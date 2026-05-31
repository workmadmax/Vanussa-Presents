# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    views.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/24 21:49:29 by mdouglas          #+#    #+#              #
#    Updated: 2026/05/31 17:14:26 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework import status

from .models import Order
from .serializers import OrderSerializer
from .services import OrderService


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get("items", [])
        try:
            order = OrderService(request.user, items).create_order()
        except NotFound as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related(
            "items__product"
        )
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = (
                Order.objects
                .prefetch_related("items__product")
                .get(pk=pk, user=request.user)
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
