# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:39:05 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/13 13:36:36 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.shortcuts import render
from rest_framework import generics
from .models import Category
from .serializers import CategorySerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

def get_queryset(self):
    queryset = super().get_queryset()
    category_slug = self.request.GET.get('Category')
    if category_slug:
        queryset = queryset.filter(categories__slug=category_slug)
    return (queryset)