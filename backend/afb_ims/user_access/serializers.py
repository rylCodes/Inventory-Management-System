from rest_framework import serializers
from user_access.models import UserAccess

class UserAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccess
        fields = "__all__"