# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:39:05 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 15:01:29 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.shortcuts import render
from rest_framework import generics

from core.pagination import LargePagination
from .models import Category
from .serializers import CategorySerializer


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = LargePagination
 
    def get_queryset(self):
        queryset = Category.objects.all()
        slug = self.request.GET.get('slug')
        if slug:
            queryset = queryset.filter(slug=slug)
        return queryset