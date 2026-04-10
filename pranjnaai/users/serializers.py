from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = '__all__'


from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class StudyGroupSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description', 'subject', 'created_by', 'created_by_name', 
                  'members', 'join_code', 'is_private', 'max_members', 'created_at', 
                  'updated_at', 'avatar', 'member_count', 'is_member', 'user_role']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = GroupMembership.objects.filter(group=obj, user=request.user).first()
            if membership:
                return membership.role
        return None

class DiscussionTopicSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    reply_count = serializers.SerializerMethodField()
    last_reply_at = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionTopic
        fields = ['id', 'group', 'title', 'content', 'created_by', 'created_by_name', 
                  'is_pinned', 'is_locked', 'views_count', 'created_at', 'updated_at',
                  'reply_count', 'last_reply_at']
    
    def get_reply_count(self, obj):
        return obj.replies.count()
    
    def get_last_reply_at(self, obj):
        last_reply = obj.replies.first()
        return last_reply.created_at if last_reply else None

class DiscussionReplySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionReply
        fields = ['id', 'topic', 'content', 'created_by', 'created_by_name', 
                  'likes', 'likes_count', 'user_has_liked', 'is_solution', 
                  'created_at', 'updated_at']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class GroupMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GroupMessage
        fields = ['id', 'group', 'user', 'username', 'message', 'file_attachment', 
                  'is_edited', 'created_at']

class GroupEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = GroupEvent
        fields = ['id', 'group', 'title', 'description', 'event_date', 'location', 
                  'meeting_link', 'created_by', 'created_by_name', 'created_at']