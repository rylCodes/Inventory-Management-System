from django.shortcuts import render
from .models import UserAccess
from .serializers import UserAccessSerializer
from rest_framework import generics

# Create your views here.

class UserAccessList(generics.ListCreateAPIView):
    queryset = UserAccess.objects.all()
    serializer_class = UserAccessSerializer

class UserAccessDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserAccess.objects.all()
    serializer_class = UserAccessSerializer