from django.db import models

class Material(models.Model):

    title = models.CharField(max_length=200)

    subject = models.CharField(max_length=100)

    uploaded_file = models.FileField(upload_to="materials/")

    structured_content = models.TextField()

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title