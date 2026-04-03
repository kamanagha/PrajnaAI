from django.db import models
from django.conf import settings  # 🔥 use settings.AUTH_USER_MODEL

class Material(models.Model):
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    uploaded_file = models.FileField(upload_to="materials/")
    structured_content = models.TextField()
    file_type = models.CharField(max_length=10)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 🔥 track owner

    def __str__(self):
        return self.title