# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    tests.py                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/15 20:29:26 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 20:55:11 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


# ---------------------------------------------------------------------------- #
#   Helpers                                                                     #
# ---------------------------------------------------------------------------- #


def make_user(username="testuser", email="test@test.com", password="StrongPass123!"):
    return User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )


def auth_header(user):
    token = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


# ---------------------------------------------------------------------------- #
#   Registration                                                                #
# ---------------------------------------------------------------------------- #


class UserRegistrationTest(APITestCase):

    def setUp(self):
        self.url = reverse("register")
        self.valid_data = {
            "username": "testuser",
            "email": "test@test.com",
            "password": "StrongPass123!",
        }

    def test_register_success(self):
        response = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["username"], self.valid_data["username"])

    def test_register_does_not_return_password(self):
        response = self.client.post(self.url, self.valid_data, format="json")
        self.assertNotIn("password", response.data)

    def test_register_duplicate_username(self):
        self.client.post(self.url, self.valid_data, format="json")
        response = self.client.post(self.url, self.valid_data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_email(self):
        self.client.post(self.url, self.valid_data, format="json")
        data = {**self.valid_data, "username": "otheruser"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_register_missing_fields(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_register_weak_password(self):
        data = {**self.valid_data, "password": "123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_register_invalid_email(self):
        data = {**self.valid_data, "email": "not-an-email"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, 400)

    def test_register_creates_user_in_db(self):
        self.client.post(self.url, self.valid_data, format="json")
        self.assertTrue(User.objects.filter(username="testuser").exists())


# ---------------------------------------------------------------------------- #
#   Login                                                                       #
# ---------------------------------------------------------------------------- #


class UserLoginTest(APITestCase):

    def setUp(self):
        self.url = reverse("token_obtain_pair")
        self.user = make_user()

    def test_login_success_returns_tokens(self):
        response = self.client.post(
            self.url,
            {
                "username": "testuser",
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_wrong_password(self):
        response = self.client.post(
            self.url,
            {
                "username": "testuser",
                "password": "wrongpassword",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_login_nonexistent_user(self):
        response = self.client.post(
            self.url,
            {
                "username": "ghost",
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_login_empty_fields(self):
        response = self.client.post(
            self.url,
            {
                "username": "",
                "password": "",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.data)
        self.assertIn("password", response.data)

    def test_multiple_failed_logins_still_return_401(self):
        url = reverse("token_obtain_pair")
        for _ in range(5):
            response = self.client.post(
                url,
                {
                    "username": "testuser",
                    "password": "wrongpass",
                },
                format="json",
            )
        self.assertEqual(response.status_code, 401)


# ---------------------------------------------------------------------------- #
#   Profile GET                                                                 #
# ---------------------------------------------------------------------------- #


class ProfileGetTest(APITestCase):

    def setUp(self):
        self.url = reverse("profile")
        self.user = make_user()

    def test_get_profile_authenticated(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.status_code, 200)

    def test_get_profile_returns_expected_fields(self):
        response = self.client.get(self.url, **auth_header(self.user))
        for field in [
            "id",
            "username",
            "email",
            "phone",
            "street",
            "city",
            "state",
            "zipcode",
            "country",
            "full_address",
            "date_joined",
        ]:
            self.assertIn(field, response.data)

    def test_get_profile_returns_correct_user(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertEqual(response.data["username"], self.user.username)
        self.assertEqual(response.data["email"], self.user.email)

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_get_profile_does_not_return_password(self):
        response = self.client.get(self.url, **auth_header(self.user))
        self.assertNotIn("password", response.data)

    def test_other_user_gets_own_profile(self):
        other = make_user(username="other", email="other@test.com")
        response = self.client.get(self.url, **auth_header(other))
        self.assertEqual(response.data["username"], "other")


# ---------------------------------------------------------------------------- #
#   Profile PATCH                                                               #
# ---------------------------------------------------------------------------- #


class ProfileUpdateTest(APITestCase):

    def setUp(self):
        self.url = reverse("profile")
        self.user = make_user()

    def test_update_profile_success(self):
        response = self.client.patch(
            self.url,
            {
                "first_name": "Vanusa",
                "phone": "11999999999",
                "city": "São Paulo",
            },
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "Vanusa")
        self.assertEqual(response.data["phone"], "11999999999")
        self.assertEqual(response.data["city"], "São Paulo")

    def test_update_full_address(self):
        self.client.patch(
            self.url,
            {
                "street": "Rua das Flores, 123",
                "city": "Curitiba",
                "state": "PR",
                "zipcode": "80000-000",
                "country": "Brasil",
            },
            format="json",
            **auth_header(self.user),
        )
        self.user.refresh_from_db()
        self.assertIn("Curitiba", self.user.full_address)

    def test_update_persists_in_db(self):
        self.client.patch(
            self.url, {"phone": "11988887777"}, format="json", **auth_header(self.user)
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, "11988887777")

    def test_cannot_update_email_via_patch(self):
        self.client.patch(
            self.url,
            {"email": "hacker@evil.com"},
            format="json",
            **auth_header(self.user),
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "test@test.com")

    def test_update_profile_unauthenticated(self):
        response = self.client.patch(self.url, {"phone": "11999999999"}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_partial_update_does_not_clear_other_fields(self):
        self.client.patch(
            self.url, {"city": "Recife"}, format="json", **auth_header(self.user)
        )
        self.client.patch(
            self.url, {"phone": "11977776666"}, format="json", **auth_header(self.user)
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.city, "Recife")
        self.assertEqual(self.user.phone, "11977776666")


# ---------------------------------------------------------------------------- #
#   Change Password                                                             #
# ---------------------------------------------------------------------------- #


class ChangePasswordTest(APITestCase):

    def setUp(self):
        self.url = reverse("change_password")
        self.user = make_user()

    def test_change_password_success(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "StrongPass123!",
                "new_password": "NewStrongPass456!",
            },
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, 200)

    def test_can_login_with_new_password(self):
        self.client.post(
            self.url,
            {
                "current_password": "StrongPass123!",
                "new_password": "NewStrongPass456!",
            },
            format="json",
            **auth_header(self.user),
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "testuser",
                "password": "NewStrongPass456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_cannot_login_with_old_password_after_change(self):
        self.client.post(
            self.url,
            {
                "current_password": "StrongPass123!",
                "new_password": "NewStrongPass456!",
            },
            format="json",
            **auth_header(self.user),
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "username": "testuser",
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_change_password_wrong_current(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "WrongPass!",
                "new_password": "NewStrongPass456!",
            },
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, 400)

    def test_change_password_weak_new_password(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "StrongPass123!",
                "new_password": "123",
            },
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, 400)

    def test_change_password_unauthenticated(self):
        response = self.client.post(
            self.url,
            {
                "current_password": "StrongPass123!",
                "new_password": "NewStrongPass456!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 401)


# ---------------------------------------------------------------------------- #
#   User Model                                                                  #
# ---------------------------------------------------------------------------- #


class UserModelTest(APITestCase):

    def test_user_str_returns_email(self):
        user = make_user()
        self.assertEqual(str(user), user.email)

    def test_full_address_with_all_fields(self):
        user = make_user()
        user.street = "Rua A, 1"
        user.city = "SP"
        user.state = "SP"
        user.zipcode = "01000-000"
        user.country = "Brasil"
        user.save()
        self.assertIn("SP", user.full_address)
        self.assertIn("Brasil", user.full_address)

    def test_full_address_with_only_default_country(self):
        user = make_user()
        self.assertEqual(user.full_address, "Brasil")

    def test_email_is_unique(self):
        make_user()
        with self.assertRaises(Exception):
            make_user(username="other", email="test@test.com")

    def test_default_country_is_brasil(self):
        user = make_user()
        self.assertEqual(user.country, "Brasil")
