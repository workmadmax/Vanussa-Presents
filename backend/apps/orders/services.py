# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    services.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:47:20 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 14:45:44 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from decimal import Decimal
from django.db import transaction
from rest_framework.exceptions import ValidationError, NotFound
from .models import Order, OrderItem
from apps.products.models import Product


def _parse_quantity(item):
    try:
        quantity = int(item.get("quantity", 1))
    except (AttributeError, TypeError, ValueError):
        raise ValidationError("A quantidade do item deve ser um numero inteiro.")

    if quantity <= 0:
        raise ValidationError("A quantidade do item deve ser maior que zero.")
    return quantity


def OrderService(user, items):
    if not items:
        raise ValidationError("O pedido deve conter pelo menos um item.")
    
    with transaction.atomic():
        order = Order.objects.create(user=user, total_price=Decimal("0.00"))
        total_price = Decimal("0.00")
        
        for item in items:
            try:
                product_id = item.get("product_id")
            except AttributeError:
                raise ValidationError("Cada item deve conter os dados do produto.")

            quantity = _parse_quantity(item)

            if not product_id:
                raise ValidationError("Cada item deve conter um id do produto.")

            try:
                product = Product.objects.select_for_update().get(
                    id=product_id,
                    is_active=True,
                )
            except Product.DoesNotExist:
                raise NotFound(f"Produto com id '{product_id}' não encontrado.")

            if product.stock < quantity:
                raise ValidationError(
                    f"Produto '{product.name}' não tem estoque suficiente."
                )

            OrderItem.objects.create(
                order = order,
                product = product,
                quantity = quantity,
                price = product.price
            )

            product.stock -= quantity
            product.save(update_fields=["stock"])
            total_price += (product.price * quantity)

        order.total_price = total_price
        order.save(update_fields=["total_price"])
    return (order)
