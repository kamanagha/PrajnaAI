from django.db import models
from django.conf import settings  # 🔥 use settings.AUTH_USER_MODEL

class Material(models.Model):
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    uploaded_file = models.FileField(upload_to="materials/")
    structured_content = models.TextField()
    file_type = models.CharField(max_length=10)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='materials', null=True, blank=True)  # 🔥 track owner
    views = models.IntegerField(default=0, blank=True, null=True)
    downloads = models.IntegerField(default=0, blank=True, null=True)
    # In materials/models.py, add to your Material class:
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title