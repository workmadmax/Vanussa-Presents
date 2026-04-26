# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:25:43 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/26 10:40:30 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.shortcuts import render
from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from core.pagination import StandardPagination

# Create your views here.
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).prefetch_related('images')
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        return (queryset)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images')
    serializer_class = ProductSerializer
    lookup_field = 'slug'