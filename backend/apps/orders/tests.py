# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/25 13:34:15 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 13:48:33 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.test import TestCase

# Create your tests here.


from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.categories.models import Category
from apps.products.models import Product
from apps.orders.models import Order, OrderItem

User = get_user_model()


# ---------------------------------------------------------------------------- #
#   Helpers                                                                     #
# ---------------------------------------------------------------------------- #

def make_user(username='testuser', password='StrongPass123!'):
    return User.objects.create_user(
        username=username,
        email=f'{username}@test.com',
        password=password,
    )

def auth_header(user):
    token = RefreshToken.for_user(user).access_token
    return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

def make_category(name='Categoria Teste'):
    return Category.objects.create(name=name, slug=name.lower().replace(' ', '-'))

def make_product(category, name='Produto Teste', price='50.00', stock=10):
    return Product.objects.create(
        name=name,
        slug=name.lower().replace(' ', '-'),
        description='Descrição de teste',
        price=Decimal(price),
        stock=stock,
        is_active=True,
        category=category,
    )


# ---------------------------------------------------------------------------- #
#   Model tests                                                                 #
# ---------------------------------------------------------------------------- #

class OrderModelTest(APITestCase):

    def setUp(self):
        self.user     = make_user()
        self.category = make_category()
        self.product  = make_product(self.category)

    def test_order_str(self):
        order = Order.objects.create(user=self.user)
        self.assertIn(str(self.user.username), str(order))

    def test_order_default_status_is_pending(self):
        order = Order.objects.create(user=self.user)
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_order_item_subtotal(self):
        order = Order.objects.create(user=self.user)
        item  = OrderItem.objects.create(
            order=order, product=self.product, quantity=3, price=Decimal('50.00')
        )
        self.assertEqual(item.subtotal(), Decimal('150.00'))


# ---------------------------------------------------------------------------- #
#   POST /api/orders/create/                                                    #
# ---------------------------------------------------------------------------- #

class OrderCreateViewTest(APITestCase):

    def setUp(self):
        self.user     = make_user()
        self.category = make_category()
        self.product  = make_product(self.category, stock=10)
        self.url      = reverse('order-create')

    def _post(self, payload, user=None):
        headers = auth_header(user or self.user)
        return self.client.post(self.url, payload, format='json', **headers)

    def test_create_order_success(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 2}]}
        response = self._post(payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)

    def test_create_order_discounts_stock(self):
        payload = {'items': [{'product_id': self.product.id, 'quantity': 3}]}
        self._post(payload)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)

    def test_create_order_calculates_total(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 2}]}
        response = self._post(payload)
        self.assertEqual(Decimal(response.data['total_price']), self.product.price * 2)

    def test_create_order_multiple_items(self):
        product2 = make_product(self.category, name='Produto B', price='30.00', stock=5)
        payload  = {'items': [
            {'product_id': self.product.id, 'quantity': 1},
            {'product_id': product2.id,     'quantity': 2},
        ]}
        response = self._post(payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OrderItem.objects.count(), 2)
        self.assertEqual(Decimal(response.data['total_price']), Decimal('110.00'))

    def test_create_order_requires_authentication(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 1}]}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_fails_with_empty_items(self):
        response = self._post({'items': []})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_fails_with_invalid_product_id(self):
        payload  = {'items': [{'product_id': 9999, 'quantity': 1}]}
        response = self._post(payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_order_fails_when_stock_insufficient(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 999}]}
        response = self._post(payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_fails_with_inactive_product(self):
        self.product.is_active = False
        self.product.save()
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 1}]}
        response = self._post(payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_response_contains_expected_fields(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 1}]}
        response = self._post(payload)
        for field in ['id', 'status', 'total_price', 'created_at', 'updated_at', 'items']:
            self.assertIn(field, response.data)

    def test_response_item_contains_subtotal_price(self):
        payload  = {'items': [{'product_id': self.product.id, 'quantity': 2}]}
        response = self._post(payload)
        item = response.data['items'][0]
        self.assertIn('subtotal_price', item)
        self.assertEqual(Decimal(item['subtotal_price']), self.product.price * 2)


# ---------------------------------------------------------------------------- #
#   GET /api/orders/my-orders/                                                  #
# ---------------------------------------------------------------------------- #

class MyOrdersViewTest(APITestCase):

    def setUp(self):
        self.user     = make_user()
        self.other    = make_user(username='other')
        self.category = make_category()
        self.product  = make_product(self.category)
        self.url      = reverse('my-orders')

    def test_returns_only_own_orders(self):
        Order.objects.create(user=self.user)
        Order.objects.create(user=self.other)
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_returns_empty_list_when_no_orders(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_response_contains_items(self):
        order = Order.objects.create(user=self.user)
        OrderItem.objects.create(
            order=order, product=self.product, quantity=1, price=self.product.price
        )
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(len(response.data[0]['items']), 1)

    def test_orders_are_ordered_by_most_recent(self):
        order1 = Order.objects.create(user=self.user)
        order2 = Order.objects.create(user=self.user)
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.data[0]['id'], order2.id)


# ---------------------------------------------------------------------------- #
#   GET /api/orders/<pk>/                                                       #
# ---------------------------------------------------------------------------- #

class OrderDetailViewTest(APITestCase):

    def setUp(self):
        self.user     = make_user()
        self.other    = make_user(username='other')
        self.category = make_category()
        self.product  = make_product(self.category)
        self.order    = Order.objects.create(user=self.user)
        self.url      = reverse('order-detail', kwargs={'pk': self.order.pk})

    def test_owner_can_view_order(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.order.pk)

    def test_other_user_cannot_view_order(self):
        response = self.client.get(self.url, **auth_header(self.other))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_order_returns_404(self):
        url      = reverse('order-detail', kwargs={'pk': 9999})
        response = self.client.get(url, **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_status_defaults_to_pending(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.data['status'], Order.Status.PENDING)