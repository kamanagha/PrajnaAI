from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from materials.models import Material
from .models import AdminActionLog, SystemSettings, SiteStats
from .serializers import (
    UserSerializer, UserCreateSerializer, MaterialAdminSerializer,
    AdminActionLogSerializer, SystemSettingsSerializer, SiteStatsSerializer
)

User = get_user_model()

class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(name__icontains=search)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        elif status_filter == 'admin':
            queryset = queryset.filter(is_staff=True)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Prevent deleting superuser
        if user.is_superuser:
            return Response(
                {'error': 'Cannot delete superuser'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Log the action
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='USER_DELETE',
            description=f"Deleted user: {user.username} ({user.email})",
            target_user=user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return super().destroy(request, *args, **kwargs)


class MaterialViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = MaterialAdminSerializer
    
    def get_queryset(self):
        queryset = Material.objects.select_related('user').all().order_by('-id')
        
        # Filter by search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(subject__icontains=search) |
                Q(user__username__icontains=search)
            )
        
        return queryset


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_user(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='USER_CREATE',
            description=f"Created user: {user.username} ({user.email})",
            target_user=user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_user_status(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent toggling superuser status
        if user.is_superuser:
            return Response(
                {'error': 'Cannot modify superuser status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user.is_active = not user.is_active
        user.save()
        
        action_type = 'USER_ACTIVATE' if user.is_active else 'USER_DEACTIVATE'
        AdminActionLog.objects.create(
            admin=request.user,
            action_type=action_type,
            description=f"{'Activated' if user.is_active else 'Deactivated'} user: {user.username}",
            target_user=user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'status': 'success', 'is_active': user.is_active})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_material(request, material_id):
    try:
        material = Material.objects.get(id=material_id)
        
        # Log the action
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='MATERIAL_DELETE',
            description=f"Deleted material: {material.title} (ID: {material.id}) uploaded by {material.user.username}",
            target_user=material.user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        material.delete()
        return Response({'status': 'success', 'message': 'Material deleted successfully'})
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_dashboard_stats(request):
    # Get date ranges
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # User stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    new_users_today = User.objects.filter(date_joined__date=today).count()
    new_users_week = User.objects.filter(date_joined__date__gte=week_ago).count()
    
    # Material stats
    total_materials = Material.objects.count()
    
    # Popular subjects
    popular_subjects = Material.objects.values('subject').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Recent activities - order by id (most recent)
    recent_users = User.objects.order_by('-date_joined')[:10]
    recent_materials = Material.objects.select_related('user').order_by('-id')[:10]
    
    # Admin actions this week
    admin_actions = AdminActionLog.objects.filter(timestamp__date__gte=week_ago).count()
    
    # Update or create daily stats
    stats, created = SiteStats.objects.get_or_create(
        date=today,
        defaults={
            'total_users': total_users,
            'active_users': active_users,
            'total_materials': total_materials,
            'total_uploads_today': 0,
            'total_views': Material.objects.aggregate(total=Sum('views'))['total'] or 0,
            'total_downloads': Material.objects.aggregate(total=Sum('downloads'))['total'] or 0,
        }
    )
    
    if not created:
        stats.total_users = total_users
        stats.active_users = active_users
        stats.total_materials = total_materials
        stats.save()
    
    # Serialize recent materials safely
    recent_materials_data = []
    for material in recent_materials:
        recent_materials_data.append({
            'id': material.id,
            'title': material.title,
            'subject': material.subject,
            'username': material.user.username if material.user else 'Unknown',
            'file_type': material.file_type,
            'created_at': None,  # Since no created_at field
        })
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'new_today': new_users_today,
            'new_week': new_users_week,
            'inactive': total_users - active_users,
        },
        'materials': {
            'total': total_materials,
            'uploaded_today': 0,
            'uploaded_week': 0,
        },
        'popular_subjects': list(popular_subjects),
        'recent_users': UserSerializer(recent_users, many=True).data,
        'recent_materials': recent_materials_data,
        'admin_actions_count': admin_actions,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def system_settings(request):
    if request.method == 'GET':
        settings = SystemSettings.objects.all()
        serializer = SystemSettingsSerializer(settings, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        for setting in request.data:
            obj, created = SystemSettings.objects.update_or_create(
                key=setting['key'],
                defaults={
                    'value': setting['value'],
                    'description': setting.get('description', ''),
                    'updated_by': request.user
                }
            )
        
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='SETTINGS_CHANGE',
            description="Updated system settings",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'status': 'settings updated'})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_activity_logs(request):
    logs = AdminActionLog.objects.select_related('admin', 'target_user').all()[:100]
    serializer = AdminActionLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_site_stats(request):
    stats = SiteStats.objects.all()[:30]
    serializer = SiteStatsSerializer(stats, many=True)
    return Response(serializer.data)