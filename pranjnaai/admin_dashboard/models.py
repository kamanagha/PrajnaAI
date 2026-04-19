from django.db import models
from django.conf import settings
from django.utils import timezone

class AdminActionLog(models.Model):
    ACTION_TYPES = [
        ('USER_CREATE', 'User Created'),
        ('USER_DELETE', 'User Deleted'),
        ('USER_ACTIVATE', 'User Activated'),
        ('USER_DEACTIVATE', 'User Deactivated'),
        ('MATERIAL_DELETE', 'Material Deleted'),
        ('MATERIAL_FEATURE', 'Material Featured'),
        ('SETTINGS_CHANGE', 'Settings Changed'),
    ]
    
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_actions')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.admin.username} - {self.action_type} - {self.timestamp}"

class SystemSettings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.key}: {self.value[:50]}"

class SiteStats(models.Model):
    date = models.DateField(default=timezone.now, unique=True)
    total_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_materials = models.IntegerField(default=0)
    total_uploads_today = models.IntegerField(default=0)
    total_views = models.IntegerField(default=0)
    total_downloads = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Stats for {self.date}"