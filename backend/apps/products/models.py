# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    models.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/13 14:12:23 by mdouglas          #+#    #+#              #
#    Updated: 2026/05/29 17:24:29 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

# Create your models here.
class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(
        'categories.Category', on_delete=models.CASCADE, related_name='products'
    )

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(is_active=False) | models.Q(price__gt=0),
                name="active_product_price_gt_0",
            ),
        ]

    def clean(self):
        super().clean()
        if (
            self.is_active
            and self.price is not None
            and self.price <= Decimal("0.00")
        ):
            raise ValidationError(
                {"price": "Produtos vendaveis devem ter preco maior que zero."}
            )

    def __str__(self):
        return (self.name)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return (f"Image for {self.product.name}")
