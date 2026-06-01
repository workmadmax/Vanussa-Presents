# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    models.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 20:58:44 by mdouglas          #+#    #+#              #
#    Updated: 2026/05/31 18:48:30 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class Order(models.Model):

    class Status(models.TextChoices):
        PENDING    = "PENDING",    "Pendente"
        PROCESSING = "PROCESSING", "Processando"
        PAID       = "PAID",       "Pago"
        SHIPPED    = "SHIPPED",    "Enviado"
        DELIVERED  = "DELIVERED",  "Entregue"
        CANCELLED  = "CANCELLED",  "Cancelado"

    user = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="orders"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    payment_provider_status = models.CharField(max_length=50, blank=True)
    delivery_street = models.CharField(max_length=255, blank=True)
    delivery_neighborhood = models.CharField(max_length=120, blank=True)
    delivery_city = models.CharField(max_length=120, blank=True)
    delivery_state = models.CharField(max_length=2, blank=True)
    delivery_postal_code = models.CharField(max_length=9, blank=True)
    lgpd_consent = models.BooleanField(default=False)
    lgpd_consented_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product", on_delete=models.PROTECT, related_name="order_items"
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name="orderitem_quantity_gte_1",
            ),
            models.CheckConstraint(
                condition=models.Q(price__gt=0),
                name="orderitem_price_gt_0",
            ),
        ]

    def subtotal(self):
        return self.quantity * self.price
