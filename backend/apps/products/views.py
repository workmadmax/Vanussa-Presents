# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:25:43 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 14:59:07 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.shortcuts import render
from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer

# Create your views here.
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

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