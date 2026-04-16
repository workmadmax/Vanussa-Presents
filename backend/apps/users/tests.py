# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/15 20:29:26 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/15 21:34:04 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationTest(APITestCase):
    
    def test_user_registration(self):
        
        url = reverse('register')
        data = {
            "username": "testuser",
            "email": "test@test.com",
            "password": "password123@#"
        }

        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['username'], data['username'])
        self.assertNotIn('password', response.data)

    def test_login_user(self):
        
        username = "loginuser"
        password = "password123@#"
        
        User.objects.create_user(
            username=username,
            email="login@test.com",
            password=password
        )

        url = reverse('token_obtain_pair')
        login_data = {
            "username": username,
            "password": password
        }

        response = self.client.post(url, login_data, format='json')

        self.assertEqual(response.status_code, 200)
        # Verifica se os tokens JWT estão presentes
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_registration_duplicate(self):
        url = reverse('register')

        data = {
            "username": "testuser",
            "email": "test@test.com",
            "password": "password123@#"
        }

        self.client.post(url, data, format='json')
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, 400)

    def test_user_registration_missing_fields(self):
        url = reverse('register')

        data = {
            "username": "",
            "email": "",
            "password": ""
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, 400)

    def test_user_registration_weak_password(self):
        url = reverse('register')

        data = {
            "username": "weakuser",
            "email": "weak@test.com",
            "password": "123@#"
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, 400)

    def test_login_wrong_password(self):
        username = "user1"
        password = "correctpass"

        User.objects.create_user(
            username=username,
            email="user@test.com",
            password=password
        )

        url = reverse('token_obtain_pair')

        response = self.client.post(url, {
            "username": username,
            "password": "wrongpass"
        }, format='json')

        self.assertEqual(response.status_code, 401)

    def test_login_nonexistent_user(self):
        url = reverse('token_obtain_pair')

        response = self.client.post(url, {
            "username": "ghost",
            "password": "123456"
        }, format='json')

        self.assertEqual(response.status_code, 401)


    def test_login_empty_fields(self):
        url = reverse('token_obtain_pair')

        response = self.client.post(url, {
            "username": "",
            "password": ""
        }, format='json')

        self.assertEqual(response.status_code, 400)
        
        self.assertIn('username', response.data)
        self.assertIn('password', response.data)


    def test_multiple_failed_logins(self):
        username = "secureuser"
        password = "correctpass"

        User.objects.create_user(
            username=username,
            email="secure@test.com",
            password=password
        )

        url = reverse('token_obtain_pair')

        for _ in range(5):
            response = self.client.post(url, {
                "username": username,
                "password": "wrongpass"
            }, format='json')

        self.assertEqual(response.status_code, 401)