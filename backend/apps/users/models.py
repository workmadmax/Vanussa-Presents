# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    models.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/25 19:32:35 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 20:04:51 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)

    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zipcode = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True, default="Brasil")

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",
        blank=True,
    )

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.email or self.username

    @property
    def full_address(self):
        parts = [self.street, self.city, self.state, self.zipcode, self.country]
        return ", ".join(p for p in parts if p)
