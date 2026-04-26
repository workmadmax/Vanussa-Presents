# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/14 17:56:29 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/26 09:57:09 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Product, ProductImage
from apps.categories.models import Category


# ---------------------------------------------------------------------------- #
#   Helpers                                                                     #
# ---------------------------------------------------------------------------- #


def make_category(name="Test Category"):
    return Category.objects.create(
        name=name,
        slug=name.lower().replace(" ", "-"),
    )


def make_product(category, name="Test Product", price="9.99", stock=10, is_active=True):
    return Product.objects.create(
        name=name,
        slug=name.lower().replace(" ", "-"),
        description="This is a test product.",
        price=Decimal(price),
        stock=stock,
        is_active=is_active,
        category=category,
    )


def get_results(response):
    data = response.data
    return data["results"] if "results" in data else data


# ---------------------------------------------------------------------------- #
#   Model                                                                       #
# ---------------------------------------------------------------------------- #


class ProductModelTest(TestCase):

    def setUp(self):
        self.category = make_category()
        self.product = make_product(self.category)

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Test Product")
        self.assertEqual(self.product.slug, "test-product")
        self.assertEqual(self.product.description, "This is a test product.")
        self.assertEqual(self.product.price, Decimal("9.99"))
        self.assertEqual(self.product.category, self.category)

    def test_product_str(self):
        self.assertEqual(str(self.product), "Test Product")

    def test_product_default_stock_is_zero(self):
        product = Product.objects.create(
            name="No Stock",
            slug="no-stock",
            description="test",
            price=Decimal("1.00"),
            category=self.category,
        )
        self.assertEqual(product.stock, 0)

    def test_product_is_active_by_default(self):
        self.assertTrue(self.product.is_active)

    def test_product_category_slug(self):
        self.assertEqual(self.product.category.slug, "test-category")

    def test_product_slug_uniqueness(self):
        with self.assertRaises(Exception):
            make_product(self.category, name="Other", price="1.00")
            Product.objects.create(
                name="Duplicate",
                slug="test-product",
                description="dup",
                price=Decimal("1.00"),
                category=self.category,
            )

    def test_inactive_product_exists_in_db(self):
        product = make_product(self.category, name="Inactive", is_active=False)
        self.assertFalse(product.is_active)
        self.assertTrue(Product.objects.filter(slug="inactive").exists())


# ---------------------------------------------------------------------------- #
#   GET /api/products/                                                          #
# ---------------------------------------------------------------------------- #


class ProductListAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.category = make_category()
        self.product = make_product(self.category)
        self.url = "/api/products/"

    def test_list_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_returns_paginated_response(self):
        response = self.client.get(self.url)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("total_pages", response.data)

    def test_list_returns_only_active_products(self):
        make_product(self.category, name="Inactive", is_active=False)
        response = self.client.get(self.url)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(get_results(response)[0]["name"], "Test Product")

    def test_inactive_product_not_in_list(self):
        self.product.is_active = False
        self.product.save()
        response = self.client.get(self.url)
        self.assertEqual(response.data["count"], 0)

    def test_filter_by_category(self):
        other_cat = make_category(name="Other Category")
        make_product(other_cat, name="Other Product")
        response = self.client.get(f"{self.url}?category=test-category")
        results = get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Test Product")

    def test_filter_by_nonexistent_category_returns_empty(self):
        response = self.client.get(f"{self.url}?category=nao-existe")
        self.assertEqual(response.data["count"], 0)

    def test_list_returns_expected_fields(self):
        response = self.client.get(self.url)
        item = get_results(response)[0]
        for field in [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "is_active",
            "created_at",
            "category",
            "images",
        ]:
            self.assertIn(field, item)

    def test_list_accessible_without_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_multiple_products_count(self):
        make_product(self.category, name="Product B")
        make_product(self.category, name="Product C")
        response = self.client.get(self.url)
        self.assertEqual(response.data["count"], 3)


# ---------------------------------------------------------------------------- #
#   GET /api/products/<slug>/                                                   #
# ---------------------------------------------------------------------------- #


class ProductDetailAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.category = make_category()
        self.product = make_product(self.category)
        self.url = "/api/products/test-product/"

    def test_detail_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_returns_correct_product(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data["name"], "Test Product")
        self.assertEqual(response.data["slug"], "test-product")

    def test_detail_returns_expected_fields(self):
        response = self.client.get(self.url)
        for field in [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "is_active",
            "created_at",
            "category",
            "images",
        ]:
            self.assertIn(field, response.data)

    def test_detail_nonexistent_product_returns_404(self):
        response = self.client.get("/api/products/nao-existe/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_detail_inactive_product_returns_404(self):
        self.product.is_active = False
        self.product.save()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_detail_accessible_without_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_detail_price_is_correct(self):
        response = self.client.get(self.url)
        self.assertEqual(Decimal(response.data["price"]), Decimal("9.99"))

    def test_detail_images_field_is_list(self):
        response = self.client.get(self.url)
        self.assertIsInstance(response.data["images"], list)
