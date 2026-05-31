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

from django.shortcuts import get_object_or_404
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


class ProductRelatedView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = None

    def get_base_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
            .order_by("-created_at", "-id")
        )

    def get_queryset(self):
        base_queryset = self.get_base_queryset()
        current_product = get_object_or_404(
            base_queryset,
            slug=self.kwargs["slug"],
        )

        related_products = list(
            base_queryset.filter(category=current_product.category)
            .exclude(pk=current_product.pk)[:4]
        )

        remaining_slots = 4 - len(related_products)
        if remaining_slots <= 0:
            return related_products

        excluded_ids = [current_product.pk]
        excluded_ids.extend(product.pk for product in related_products)
        fallback_products = list(
            base_queryset.exclude(pk__in=excluded_ids)[:remaining_slots]
        )

        return related_products + fallback_products
