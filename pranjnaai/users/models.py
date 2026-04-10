from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    # 🔥 Remove username login, use email instead
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    # Extra fields
    name = models.CharField(max_length=100)

    # 🔑 Login with email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']   # required when creating superuser

    def __str__(self):
        return self.email


class StudyGroup(models.Model):
    """Study Group Model"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(User, related_name='joined_groups', blank=True)
    join_code = models.CharField(max_length=10, unique=True)
    is_private = models.BooleanField(default=False)
    max_members = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    avatar = models.CharField(max_length=10, default='👥')
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']

class GroupMembership(models.Model):
    """Group Membership with roles"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['group', 'user']

class DiscussionTopic(models.Model):
    """Discussion Topic/Thread"""
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=300)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topics')
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']

class DiscussionReply(models.Model):
    """Replies to discussion topics"""
    topic = models.ForeignKey(DiscussionTopic, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    likes = models.ManyToManyField(User, related_name='liked_replies', blank=True)
    is_solution = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']

class GroupMessage(models.Model):
    """Real-time group chat messages"""
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_messages')
    message = models.TextField()
    file_attachment = models.FileField(upload_to='group_files/', null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']

class GroupEvent(models.Model):
    """Study group events/meetings"""
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    meeting_link = models.URLField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title