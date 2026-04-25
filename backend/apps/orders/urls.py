# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    urls.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:52:36 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/24 23:08:30 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.urls import path
from .views import OrderCreateView, MyOrdersView, OrderDetailView

urlpatterns = [
	path('create/', OrderCreateView.as_view(), name='order-create'),
	path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]