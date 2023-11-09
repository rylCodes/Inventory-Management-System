from django.db import models

# Create your models here.

class UserAccess(models.Model):
    username = models.CharField(max_length=150, unique=True)
    token = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.username
