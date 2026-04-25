# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    services.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:47:20 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 13:23:22 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from decimal import Decimal
from rest_framework.exceptions import ValidationError, NotFound
from .models import Order, OrderItem
from apps.products.models import Product


def OrderService(user, items):
    if not items:
        raise ValidationError("O pedido deve conter pelo menos um item.")
    
    order = Order.objects.create(user=user, total_price=Decimal("0.00"))
    
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)

        if not product_id:
            raise ValidationError("Cada item deve conter um slug do produto.")
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            raise NotFound(f"Produto com slug '{product_id}' não encontrado.")
        
        if product.stock < quantity:
            raise ValidationError(f"Produto '{product.name}' não tem estoque suficiente.")
        
        OrderItem.objects.create(
            order = order,
            product = product,
            quantity = quantity,
            price = product.price
        )

        product.stock -= quantity
        product.save(update_fields=["stock"])
        total_price = order.total_price + (product.price * quantity)

    order.total_price = total_price
    order.save(update_fields=["total_price"])
    return (order)
