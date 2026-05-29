# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:25:43 by mdouglas          #+#    #+#              #
#    Updated: 2026/05/29 20:06:34 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from core.pagination import StandardPagination


# Create your views here.
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )
        category = self.request.GET.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related("category")
        .prefetch_related("images")
    )
    serializer_class = ProductSerializer
    lookup_field = "slug"
