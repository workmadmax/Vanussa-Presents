# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    urls.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/09 15:42:16 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/13 13:37:18 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.urls import path
from .views import CategoryListView

urlpatterns = [
    path('', CategoryListView.as_view()),
]