# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    admin.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:53:56 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 13:07:58 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    fields          = ["product", "quantity", "price"]
    readonly_fields = ["price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ["id", "user", "status", "total_price", "created_at"]
    list_filter     = ["status"]
    search_fields   = ["user__username", "user__email"]
    readonly_fields = ["total_price", "created_at", "updated_at"]
    inlines         = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display    = ["id", "order", "product", "quantity", "price"]
    search_fields   = ["product__name", "order__user__username"]
