from datetime import timedelta
from decimal import Decimal
from io import StringIO
from unittest.mock import patch
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.categories.models import Category
from apps.checkout.services import PreferenceResult
from apps.orders.models import Order, OrderItem
from apps.products.models import Product

User = get_user_model()


def make_user(username="checkoutuser", password="StrongPass123!"):
    return User.objects.create_user(
        username=username,
        email=f"{username}@test.com",
        password=password,
    )


def auth_header(user):
    token = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


def make_order(user, status=Order.Status.PENDING):
    suffix = uuid4().hex[:8]
    category = Category.objects.create(name="Checkout", slug=f"checkout-{suffix}")
    product = Product.objects.create(
        name=f"Produto {suffix}",
        slug=f"produto-{suffix}",
        description="Produto de teste",
        price=Decimal("99.90"),
        stock=5,
        is_active=True,
        category=category,
    )
    order = Order.objects.create(
        user=user,
        status=status,
        total_price=Decimal("99.90"),
    )
    OrderItem.objects.create(
        order=order,
        product=product,
        quantity=1,
        price=product.price,
    )
    return order


class FakeGateway:
    payment = {
        "external_reference": None,
        "status": "approved",
    }

    def create_preference(self, order):
        return PreferenceResult(
            preference_id=f"pref-{order.id}",
            init_point=f"https://mercadopago.test/checkout/{order.id}",
        )

    def get_payment(self, payment_id):
        return self.payment


def valid_payment_payload(order_id):
    return {
        "order_id": order_id,
        "delivery_street": "Rua Teste",
        "delivery_neighborhood": "Centro",
        "delivery_city": "Sao Paulo",
        "delivery_state": "SP",
        "delivery_postal_code": "01001000",
        "lgpd_consent": True,
    }


class CheckoutPaymentViewTest(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.other = make_user(username="othercheckout")
        self.order = make_order(self.user)
        self.url = reverse("checkout-payment")

    @patch("apps.checkout.services.CheckoutService.gateway_class", FakeGateway)
    def test_create_payment_preference_records_checkout_fields(self):
        response = self.client.post(
            self.url,
            valid_payment_payload(self.order.id),
            format="json",
            **auth_header(self.user),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["preference_id"], f"pref-{self.order.id}")
        self.assertIn("init_point", response.data)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)
        self.assertEqual(self.order.payment_id, f"pref-{self.order.id}")
        self.assertEqual(self.order.delivery_postal_code, "01001-000")
        self.assertTrue(self.order.lgpd_consent)
        self.assertIsNotNone(self.order.lgpd_consented_at)

    @patch("apps.checkout.services.CheckoutService.gateway_class", FakeGateway)
    def test_requires_order_owner(self):
        response = self.client.post(
            self.url,
            valid_payment_payload(self.order.id),
            format="json",
            **auth_header(self.other),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.checkout.services.CheckoutService.gateway_class", FakeGateway)
    def test_requires_lgpd_consent(self):
        payload = valid_payment_payload(self.order.id)
        payload["lgpd_consent"] = False

        response = self.client.post(
            self.url,
            payload,
            format="json",
            **auth_header(self.user),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)

    @patch("apps.checkout.services.CheckoutService.gateway_class", FakeGateway)
    def test_requires_valid_cep(self):
        payload = valid_payment_payload(self.order.id)
        payload["delivery_postal_code"] = "123"

        response = self.client.post(
            self.url,
            payload,
            format="json",
            **auth_header(self.user),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_requires_authentication(self):
        response = self.client.post(
            self.url,
            valid_payment_payload(self.order.id),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(MP_WEBHOOK_SECRET="test-secret")
class MercadoPagoWebhookViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="webhookuser")
        self.order = make_order(self.user, status=Order.Status.PROCESSING)
        self.url = reverse("checkout-webhook")

    @patch("apps.checkout.views.verify_mercado_pago_signature", return_value=True)
    @patch("apps.checkout.services.WebhookService.gateway_class", FakeGateway)
    @patch("apps.checkout.services.send_confirmation_email_async")
    def test_approved_payment_marks_order_paid(self, email_mock, signature_mock):
        FakeGateway.payment = {
            "external_reference": str(self.order.id),
            "status": "approved",
        }

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                self.url,
                {"data": {"id": "pay-1"}},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PAID)
        self.assertEqual(self.order.payment_provider_status, "approved")
        email_mock.assert_called_once_with(self.order.id)

    @patch("apps.checkout.views.verify_mercado_pago_signature", return_value=True)
    @patch("apps.checkout.services.WebhookService.gateway_class", FakeGateway)
    def test_pending_payment_keeps_order_processing(self, signature_mock):
        FakeGateway.payment = {
            "external_reference": str(self.order.id),
            "status": "pending",
        }

        response = self.client.post(
            self.url,
            {"data": {"id": "pay-1"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)

    @patch("apps.checkout.views.verify_mercado_pago_signature", return_value=True)
    @patch("apps.checkout.services.WebhookService.gateway_class", FakeGateway)
    def test_rejected_payment_cancels_order(self, signature_mock):
        FakeGateway.payment = {
            "external_reference": str(self.order.id),
            "status": "rejected",
        }

        response = self.client.post(
            self.url,
            {"data": {"id": "pay-1"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CANCELLED)

    @patch("apps.checkout.views.verify_mercado_pago_signature", return_value=False)
    def test_rejects_invalid_signature(self, signature_mock):
        response = self.client.post(
            self.url,
            {"data": {"id": "pay-1"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)


class ExpireProcessingOrdersCommandTest(APITestCase):
    def test_expires_stale_processing_orders(self):
        user = make_user(username="expireuser")
        stale = make_order(user, status=Order.Status.PROCESSING)
        fresh = make_order(user, status=Order.Status.PROCESSING)

        Order.objects.filter(pk=stale.pk).update(
            updated_at=timezone.now() - timedelta(hours=72)
        )

        out = StringIO()
        call_command("expire_processing_orders", "--hours=48", stdout=out)

        stale.refresh_from_db()
        fresh.refresh_from_db()
        self.assertEqual(stale.status, Order.Status.CANCELLED)
        self.assertEqual(stale.payment_provider_status, "expired")
        self.assertEqual(fresh.status, Order.Status.PROCESSING)
        self.assertIn("Expired 1 processing orders.", out.getvalue())
