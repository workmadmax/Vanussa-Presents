# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/14 17:56:29 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/14 17:56:38 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Product
from apps.categories.models import Category

# Create your tests here.
class ProductModelTestCase(TestCase):

    def setUp(self):
        self.category = Category.objects.create(
            name = 'Test Category',
            slug = 'test-category'
        )
        self.product = Product.objects.create(
            name = 'Test Product',
            slug = 'test-product',
            description = 'This is a test product.',
            price = 9.99,
            category = self.category,
            is_active = True
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, 'Test Product')
        self.assertEqual(self.product.slug, 'test-product')
        self.assertEqual(self.product.description, 'This is a test product.')
        self.assertEqual(self.product.price, 9.99)
        self.assertEqual(self.product.category, self.category)
        self.assertTrue(self.product.is_active)
    
    def test_product_str_representation(self):
        self.assertEqual(str(self.product), 'Test Product')

    def test_product_is_active(self):
        self.assertTrue(self.product.is_active)
    
    def test_product_category_slug(self):
        self.assertEqual(self.product.category.slug, 'test-category')

class ProductAPITestCase(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name = 'Test Category',
            slug = 'test-category'
        )
        self.product = Product.objects.create(
            name = 'Test Product',
            slug = 'test-product',
            description = 'This is a test product.',
            price = 9.99,
            category = self.category,
            is_active = True
        )

    def test_get_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')

    def test_product_active_filter(self):
        self.product.is_active = False
        self.product.save()
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_filter_by_category(self):
        response = self.client.get('/api/products/?category=test-category')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')

    def test_filter_by_nonexistent_category(self):
         response = self.client.get('/api/products/?category=nonexistent-category')
         self.assertEqual(response.status_code, status.HTTP_200_OK)
         self.assertEqual(len(response.data), 0)

    def test_detail_product_return_200(self):
        response = self.client.get('/api/products/test-product/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Product')

    def test_detail_product_return_404(self):
        response = self.client.get('/api/products/nonexistent-product/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_correct_filds(self):
        response = self.client.get('/api/products/test-product/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertIn('slug', response.data)
        self.assertIn('description', response.data)
        self.assertIn('price', response.data)
        self.assertIn('stock', response.data)
        self.assertIn('is_active', response.data)
        self.assertIn('created_at', response.data)
        self.assertIn('category', response.data)

    def test_inactive_product_detail_return_404(self):
        self.product.is_active = False
        self.product.save()
        response = self.client.get('/api/products/test-product/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)