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