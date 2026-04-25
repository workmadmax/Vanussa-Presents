# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/15 20:10:36 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 19:46:00 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

# Create your views here.

from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset            = User.objects.all()
    serializer_class    = RegisterSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return (Response(serializer.data))
    
    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return (Response(ProfileSerializer(request.user).data))

class changePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return (Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK))