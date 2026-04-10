# users/study_groups.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import StudyGroup, GroupMembership, DiscussionTopic, DiscussionReply, GroupMessage, GroupEvent
import random
import string
from datetime import datetime

User = get_user_model()

def generate_join_code():
    """Generate a unique join code for private groups"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# ============ STUDY GROUP VIEWS ============

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def study_group_list(request):
    """Get all study groups"""
    groups = StudyGroup.objects.all()
    data = []
    for group in groups:
        data.append({
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'subject': group.subject,
            'created_by': group.created_by.id,
            'created_by_name': group.created_by.username,
            'member_count': group.members.count(),
            'is_private': group.is_private,
            'max_members': group.max_members,
            'avatar': group.avatar,
            'join_code': group.join_code if not group.is_private else None,
            'created_at': group.created_at,
            'is_member': group.members.filter(id=request.user.id).exists()
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def create_study_group(request):
    """Create a new study group"""
    data = request.data
    join_code = generate_join_code()
    
    # Ensure unique join code
    while StudyGroup.objects.filter(join_code=join_code).exists():
        join_code = generate_join_code()
    
    group = StudyGroup.objects.create(
        name=data.get('name'),
        description=data.get('description', ''),
        subject=data.get('subject'),
        created_by=request.user,
        join_code=join_code,
        is_private=data.get('is_private', False),
        max_members=data.get('max_members', 50),
        avatar=data.get('avatar', '👥')
    )
    
    # Add creator as admin member
    GroupMembership.objects.create(group=group, user=request.user, role='admin')
    group.members.add(request.user)
    
    return Response({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'subject': group.subject,
        'join_code': join_code,
        'is_private': group.is_private,
        'message': 'Group created successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def study_group_detail(request, group_id):
    """Get details of a specific study group"""
    group = get_object_or_404(StudyGroup, id=group_id)
    
    data = {
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'subject': group.subject,
        'created_by': group.created_by.id,
        'created_by_name': group.created_by.username,
        'member_count': group.members.count(),
        'is_private': group.is_private,
        'max_members': group.max_members,
        'avatar': group.avatar,
        'created_at': group.created_at,
        'is_member': group.members.filter(id=request.user.id).exists()
    }
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def join_study_group(request, group_id):
    """Join a study group"""
    group = get_object_or_404(StudyGroup, id=group_id)
    join_code = request.data.get('join_code', '')
    
    if group.is_private and group.join_code != join_code:
        return Response({'error': 'Invalid join code'}, status=status.HTTP_400_BAD_REQUEST)
    
    if group.members.count() >= group.max_members:
        return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)
    
    if group.members.filter(id=request.user.id).exists():
        return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    group.members.add(request.user)
    GroupMembership.objects.create(group=group, user=request.user, role='member')
    
    return Response({'message': 'Joined successfully', 'group_id': group.id})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def leave_study_group(request, group_id):
    """Leave a study group"""
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    
    if membership and membership.role == 'admin':
        other_admins = GroupMembership.objects.filter(group=group, role='admin').exclude(user=request.user)
        if not other_admins.exists():
            return Response({'error': 'Cannot leave as the only admin. Transfer admin role first.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    group.members.remove(request.user)
    if membership:
        membership.delete()
    
    return Response({'message': 'Left successfully'})

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def my_study_groups(request):
    """Get groups the current user is a member of"""
    groups = request.user.joined_groups.all()
    data = []
    for group in groups:
        membership = GroupMembership.objects.filter(group=group, user=request.user).first()
        data.append({
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'subject': group.subject,
            'member_count': group.members.count(),
            'avatar': group.avatar,
            'user_role': membership.role if membership else 'member',
            'created_at': group.created_at
        })
    return Response(data)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def group_members(request, group_id):
    """Get all members of a study group"""
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to view members'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    members_data = []
    for member in group.members.all():
        membership = GroupMembership.objects.filter(group=group, user=member).first()
        members_data.append({
            'id': member.id,
            'username': member.username,
            'email': member.email,
            'name': member.get_full_name() or member.username,
            'role': membership.role if membership else 'member'
        })
    
    return Response(members_data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def add_group_member(request, group_id):
    """Add a member to the group (admin only)"""
    group = get_object_or_404(StudyGroup, id=group_id)
    user_id = request.data.get('user_id')
    
    # Check if current user is admin
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    if not membership or membership.role != 'admin':
        return Response({'error': 'Only admins can add members'}, status=status.HTTP_403_FORBIDDEN)
    
    user_to_add = get_object_or_404(User, id=user_id)
    
    if group.members.filter(id=user_to_add.id).exists():
        return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    if group.members.count() >= group.max_members:
        return Response({'error': 'Group is full'}, status=status.HTTP_400_BAD_REQUEST)
    
    group.members.add(user_to_add)
    GroupMembership.objects.create(group=group, user=user_to_add, role='member')
    
    return Response({'message': 'Member added successfully'})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def remove_group_member(request, group_id):
    """Remove a member from the group (admin only)"""
    group = get_object_or_404(StudyGroup, id=group_id)
    user_id = request.data.get('user_id')
    
    # Check if current user is admin
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    if not membership or membership.role != 'admin':
        return Response({'error': 'Only admins can remove members'}, status=status.HTTP_403_FORBIDDEN)
    
    user_to_remove = get_object_or_404(User, id=user_id)
    
    if user_to_remove == request.user:
        return Response({'error': 'You cannot remove yourself. Use leave instead.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if not group.members.filter(id=user_to_remove.id).exists():
        return Response({'error': 'User is not a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    group.members.remove(user_to_remove)
    GroupMembership.objects.filter(group=group, user=user_to_remove).delete()
    
    return Response({'message': 'Member removed successfully'})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def update_member_role(request, group_id):
    """Update a member's role (admin only)"""
    group = get_object_or_404(StudyGroup, id=group_id)
    user_id = request.data.get('user_id')
    new_role = request.data.get('role')
    
    # Check if current user is admin
    current_membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    if not current_membership or current_membership.role != 'admin':
        return Response({'error': 'Only admins can update roles'}, status=status.HTTP_403_FORBIDDEN)
    
    if new_role not in ['admin', 'moderator', 'member']:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
    
    target_membership = GroupMembership.objects.filter(group=group, user_id=user_id).first()
    if not target_membership:
        return Response({'error': 'User is not a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    target_membership.role = new_role
    target_membership.save()
    
    return Response({'message': f'Role updated to {new_role}'})

# ============ DISCUSSION TOPIC VIEWS ============

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def discussion_topic_list(request):
    """Get all discussion topics for a group"""
    group_id = request.query_params.get('group_id')
    if not group_id:
        return Response({'error': 'group_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    topics = DiscussionTopic.objects.filter(group_id=group_id)
    data = []
    for topic in topics:
        data.append({
            'id': topic.id,
            'group': topic.group.id,
            'title': topic.title,
            'content': topic.content[:200] + '...' if len(topic.content) > 200 else topic.content,
            'created_by': topic.created_by.id,
            'created_by_name': topic.created_by.username,
            'is_pinned': topic.is_pinned,
            'is_locked': topic.is_locked,
            'views_count': topic.views_count,
            'reply_count': topic.replies.count(),
            'created_at': topic.created_at,
            'updated_at': topic.updated_at
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def create_discussion_topic(request):
    """Create a new discussion topic"""
    data = request.data
    group_id = data.get('group')
    
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to create topics'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    topic = DiscussionTopic.objects.create(
        group=group,
        title=data.get('title'),
        content=data.get('content'),
        created_by=request.user
    )
    
    return Response({
        'id': topic.id,
        'title': topic.title,
        'content': topic.content,
        'message': 'Topic created successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def discussion_topic_detail(request, topic_id):
    """Get a specific discussion topic"""
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    
    # Increment view count
    topic.views_count += 1
    topic.save()
    
    data = {
        'id': topic.id,
        'group': topic.group.id,
        'title': topic.title,
        'content': topic.content,
        'created_by': topic.created_by.id,
        'created_by_name': topic.created_by.username,
        'is_pinned': topic.is_pinned,
        'is_locked': topic.is_locked,
        'views_count': topic.views_count,
        'created_at': topic.created_at,
        'updated_at': topic.updated_at
    }
    return Response(data)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def topic_replies(request, topic_id):
    """Get all replies for a topic"""
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    replies = topic.replies.all()
    
    data = []
    for reply in replies:
        data.append({
            'id': reply.id,
            'topic': reply.topic.id,
            'content': reply.content,
            'created_by': reply.created_by.id,
            'created_by_name': reply.created_by.username,
            'likes_count': reply.likes.count(),
            'user_has_liked': request.user in reply.likes.all(),
            'is_solution': reply.is_solution,
            'created_at': reply.created_at,
            'updated_at': reply.updated_at
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def view_topic(request, topic_id):
    """Increment view count for a topic"""
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    topic.views_count += 1
    topic.save()
    return Response({'views': topic.views_count})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def pin_topic(request, topic_id):
    """Pin or unpin a topic (admin/moderator only)"""
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    group = topic.group
    
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    if not membership or membership.role not in ['admin', 'moderator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    topic.is_pinned = not topic.is_pinned
    topic.save()
    return Response({'is_pinned': topic.is_pinned})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def lock_topic(request, topic_id):
    """Lock or unlock a topic (admin/moderator only)"""
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    group = topic.group
    
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    if not membership or membership.role not in ['admin', 'moderator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    topic.is_locked = not topic.is_locked
    topic.save()
    return Response({'is_locked': topic.is_locked})

# ============ DISCUSSION REPLY VIEWS ============

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def discussion_reply_list(request):
    """Get all replies for a topic"""
    topic_id = request.query_params.get('topic_id')
    if not topic_id:
        return Response({'error': 'topic_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    replies = DiscussionReply.objects.filter(topic_id=topic_id)
    data = []
    for reply in replies:
        data.append({
            'id': reply.id,
            'topic': reply.topic.id,
            'content': reply.content,
            'created_by': reply.created_by.id,
            'created_by_name': reply.created_by.username,
            'likes_count': reply.likes.count(),
            'is_solution': reply.is_solution,
            'created_at': reply.created_at
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def create_reply(request):
    """Create a reply to a discussion topic"""
    data = request.data
    topic_id = data.get('topic')
    
    topic = get_object_or_404(DiscussionTopic, id=topic_id)
    
    if topic.is_locked:
        return Response({'error': 'This topic is locked'}, status=status.HTTP_403_FORBIDDEN)
    
    group = topic.group
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to reply'}, status=status.HTTP_403_FORBIDDEN)
    
    reply = DiscussionReply.objects.create(
        topic=topic,
        content=data.get('content'),
        created_by=request.user
    )
    
    return Response({
        'id': reply.id,
        'content': reply.content,
        'message': 'Reply added successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def like_reply(request, reply_id):
    """Like or unlike a reply"""
    reply = get_object_or_404(DiscussionReply, id=reply_id)
    
    if request.user in reply.likes.all():
        reply.likes.remove(request.user)
        liked = False
    else:
        reply.likes.add(request.user)
        liked = True
    
    return Response({'liked': liked, 'likes_count': reply.likes.count()})

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def mark_as_solution(request, reply_id):
    """Mark a reply as solution"""
    reply = get_object_or_404(DiscussionReply, id=reply_id)
    topic = reply.topic
    group = topic.group
    
    membership = GroupMembership.objects.filter(group=group, user=request.user).first()
    
    if topic.created_by != request.user and (not membership or membership.role not in ['admin', 'moderator']):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Remove solution from other replies
    topic.replies.update(is_solution=False)
    reply.is_solution = True
    reply.save()
    
    return Response({'is_solution': True})

# ============ GROUP MESSAGE VIEWS (CHAT) ============

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def group_message_list(request):
    """Get all messages for a group"""
    group_id = request.query_params.get('group_id')
    if not group_id:
        return Response({'error': 'group_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    messages = GroupMessage.objects.filter(group_id=group_id)[:50]
    data = []
    for msg in messages:
        data.append({
            'id': msg.id,
            'group': msg.group.id,
            'user': msg.user.id,
            'username': msg.user.username,
            'message': msg.message,
            'created_at': msg.created_at
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def send_group_message(request):
    """Send a message to a group"""
    data = request.data
    group_id = data.get('group')
    
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to send messages'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    message = GroupMessage.objects.create(
        group=group,
        user=request.user,
        message=data.get('message')
    )
    
    return Response({
        'id': message.id,
        'message': message.message,
        'username': request.user.username,
        'created_at': message.created_at
    }, status=status.HTTP_201_CREATED)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def get_group_messages(request, group_id):
    """Get messages for a specific group"""
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to view messages'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    limit = int(request.query_params.get('limit', 50))
    messages = GroupMessage.objects.filter(group=group)[:limit]
    
    data = []
    for msg in messages:
        data.append({
            'id': msg.id,
            'user': msg.user.id,
            'username': msg.user.username,
            'message': msg.message,
            'created_at': msg.created_at
        })
    return Response(data)

# ============ GROUP EVENT VIEWS ============

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def group_event_list(request):
    """Get all events for a group"""
    group_id = request.query_params.get('group_id')
    if not group_id:
        return Response({'error': 'group_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    events = GroupEvent.objects.filter(group_id=group_id)
    data = []
    for event in events:
        data.append({
            'id': event.id,
            'group': event.group.id,
            'title': event.title,
            'description': event.description,
            'event_date': event.event_date,
            'location': event.location,
            'meeting_link': event.meeting_link,
            'created_by': event.created_by.id,
            'created_by_name': event.created_by.username,
            'created_at': event.created_at
        })
    return Response(data)

@api_view(['POST','GET'])
@permission_classes([IsAuthenticated])
def create_group_event(request):
    """Create a new group event"""
    data = request.data
    group_id = data.get('group')
    
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to create events'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    event = GroupEvent.objects.create(
        group=group,
        title=data.get('title'),
        description=data.get('description', ''),
        event_date=data.get('event_date'),
        location=data.get('location', ''),
        meeting_link=data.get('meeting_link', ''),
        created_by=request.user
    )
    
    return Response({
        'id': event.id,
        'title': event.title,
        'message': 'Event created successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def group_event_detail(request, event_id):
    """Get a specific event"""
    event = get_object_or_404(GroupEvent, id=event_id)
    
    data = {
        'id': event.id,
        'group': event.group.id,
        'title': event.title,
        'description': event.description,
        'event_date': event.event_date,
        'location': event.location,
        'meeting_link': event.meeting_link,
        'created_by': event.created_by.id,
        'created_by_name': event.created_by.username,
        'created_at': event.created_at
    }
    return Response(data)

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def upcoming_events(request, group_id):
    """Get upcoming events for a group"""
    from django.utils import timezone
    
    group = get_object_or_404(StudyGroup, id=group_id)
    
    if not group.members.filter(id=request.user.id).exists():
        return Response({'error': 'You must be a member to view events'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    events = GroupEvent.objects.filter(
        group=group,
        event_date__gte=timezone.now()
    ).order_by('event_date')[:10]
    
    data = []
    for event in events:
        data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'event_date': event.event_date,
            'location': event.location,
            'meeting_link': event.meeting_link
        })
    return Response(data)