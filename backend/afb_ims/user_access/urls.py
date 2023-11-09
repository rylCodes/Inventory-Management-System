from django.urls import path
from user_access import views

urlpatterns = [
    path('authenticated/', views.UserAccessList.as_view(), name="user_access_list"),
    path('authenticated/<int:pk>', views.UserAccessDetail.as_view(), name="user_access_detail"),
]