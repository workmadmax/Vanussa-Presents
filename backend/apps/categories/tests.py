# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/14 17:32:32 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/14 18:09:20 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category

# Create your tests here.

class CategoryModelTestCase(TestCase):
    
    def setUp(self):
        self.category = Category.objects.create(
            name = 'Test Category',
            slug = 'test-category'
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, 'Test Category')
        self.assertEqual(self.category.slug, 'test-category')
    
    def test_category_str_representation(self):
        self.assertEqual(str(self.category), 'Test Category')

    def test_slug_uniqueness(self):
        with self.assertRaises(Exception):
            Category.objects.create(
                name = 'Another Test Category',
                slug = 'test-category'
            )
    
class CategoryAPITestCase(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name = 'Test Category',
            slug = 'test-category'
        )

    def test_get_categories(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Category')

    def test_get_all_categories(self):
        Category.objects.create(
            name = 'Another Test Category',
            slug = 'another-test-category'
        )
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_categories_with_filter(self):
        response = self.client.get('/api/categories/?category=test-category')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Category')
    
    def test_get_categories_with_empty_filter(self):
        response = self.client.get('/api/categories/?category=')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)