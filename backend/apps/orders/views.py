# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:49:29 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 13:02:58 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Order
from .serializers import OrderSerializer
from .services import OrderService


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])
        order = OrderService.create_order(request.user, items)
        serializer = OrderSerializer(order)
        return (Response(serializer.data, status=status.HTTP_201_CREATED))
    
class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
        serializer = OrderSerializer(orders, many=True)
        return (Response(serializer.data, status=status.HTTP_200_OK))
    
class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return (Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND))
        
        serializer = OrderSerializer(order)
        return (Response(serializer.data, status=status.HTTP_200_OK))