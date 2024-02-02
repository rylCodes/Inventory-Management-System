from rest_framework import permissions
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User

class DeleteWithAdminPasswordPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        admin_password = request.data.get('admin_password')

        if request.user.is_staff:
            return True

        try:
            admin_users = User.objects.filter(is_staff=True)
            for admin_user in admin_users:
                actual_admin_password = admin_user.password
                if check_password(admin_password, actual_admin_password):
                    return True
                
            return False
        
        except User.DoesNotExist:
            return False
