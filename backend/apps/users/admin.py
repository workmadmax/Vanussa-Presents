# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    admin.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/25 19:46:19 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 20:03:54 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "phone", "city", "is_staff", "is_active"]
    search_fields = ["username", "email", "phone"]

    fieldsets = UserAdmin.fieldsets + (
        ("Informações de Contato", {"fields": ("phone",)}),
        ("Endereço", {"fields": ("street", "city", "state", "zipcode", "country")}),
    )
