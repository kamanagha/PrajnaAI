from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from materials.models import Material
from .models import AdminActionLog, SystemSettings, SiteStats

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    material_count = serializers.SerializerMethodField()
    is_active_status = serializers.SerializerMethodField()
    join_date = serializers.DateTimeField(source='date_joined', format='%Y-%m-%d %H:%M:%S')
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name',
                 'is_active', 'is_staff', 'is_superuser', 'date_joined', 
                 'last_login', 'material_count', 'is_active_status', 'join_date']
    
    def get_material_count(self, obj):
        return Material.objects.filter(user_id=obj.id).count()
    
    def get_is_active_status(self, obj):
        return "Active" if obj.is_active else "Inactive"


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class MaterialAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    file_size = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    # Use structured_content instead of description
    structured_content_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ['id', 'title', 'subject', 'structured_content', 'uploaded_file', 'file_type',
                 'username', 'user_email', 'user_name', 'file_size', 'file_url',
                 'views', 'downloads', 'structured_content_preview']
    
    def get_file_size(self, obj):
        if obj.uploaded_file:
            return f"{obj.uploaded_file.size / (1024*1024):.2f} MB"
        return "N/A"
    
    def get_file_url(self, obj):
        if obj.uploaded_file:
            return obj.uploaded_file.url
        return None
    
    def get_structured_content_preview(self, obj):
        if obj.structured_content:
            # Return first 100 characters as preview
            preview = str(obj.structured_content)[:100]
            return preview + "..." if len(str(obj.structured_content)) > 100 else preview
        return "No content"


# If you don't have structured_content field either, use this simplified version:
class MaterialAdminSerializerSimple(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    file_size = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ['id', 'title', 'subject', 'uploaded_file', 'file_type',
                 'username', 'user_email', 'user_name', 'file_size', 'file_url',
                 'views', 'downloads']
    
    def get_file_size(self, obj):
        if obj.uploaded_file:
            return f"{obj.uploaded_file.size / (1024*1024):.2f} MB"
        return "N/A"
    
    def get_file_url(self, obj):
        if obj.uploaded_file:
            return obj.uploaded_file.url
        return None


class AdminActionLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.username', read_only=True)
    target_name = serializers.CharField(source='target_user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = AdminActionLog
        fields = ['id', 'admin_name', 'action_type', 'description', 
                 'target_name', 'ip_address', 'timestamp']


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'description', 'updated_at']


class SiteStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteStats
        fields = '__all__'