# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    urls.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/15 20:14:34 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 19:57:16 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, changePasswordView
 
urlpatterns = [
    path('register/',        RegisterView.as_view(),        name='register'),
    path('login/',           TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/',   TokenRefreshView.as_view(),    name='token_refresh'),
    path('profile/',         ProfileView.as_view(),         name='profile'),
    path('change-password/', changePasswordView.as_view(),  name='change_password'),
]
 