import hashlib
import hmac
import threading
from dataclasses import dataclass

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.orders.models import Order


APPROVED_STATUSES = {"approved", "accredited"}
REJECTED_STATUSES = {
    "cancelled",
    "charged_back",
    "refunded",
    "rejected",
}
PENDING_STATUSES = {
    "authorized",
    "in_mediation",
    "in_process",
    "pending",
}


@dataclass
class PreferenceResult:
    preference_id: str
    init_point: str


class MercadoPagoGateway:
    def __init__(self):
        if not settings.MP_ACCESS_TOKEN:
            raise ValidationError("Mercado Pago access token is not configured.")

        try:
            import mercadopago
        except ImportError as exc:
            raise ValidationError("Mercado Pago SDK is not installed.") from exc

        self.sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

    def create_preference(self, order):
        result = self.sdk.preference().create(_preference_payload(order))
        if result.get("status") not in (200, 201):
            raise ValidationError("Could not create Mercado Pago preference.")

        preference = result.get("response", {})
        return PreferenceResult(
            preference_id=str(preference.get("id", "")),
            init_point=preference.get("init_point", ""),
        )

    def get_payment(self, payment_id):
        result = self.sdk.payment().get(payment_id)
        if result.get("status") != 200:
            raise NotFound("Payment not found.")
        return result.get("response", {})


def _preference_payload(order):
    frontend = settings.CHECKOUT_FRONTEND_URL.rstrip("/")
    backend = settings.CHECKOUT_BACKEND_URL.rstrip("/")

    return {
        "items": [
            {
                "title": f"Pedido #{order.id}",
                "quantity": 1,
                "unit_price": float(order.total_price),
            }
        ],
        "payer": {
            "email": order.user.email,
            "name": order.user.get_full_name() or order.user.username,
            "address": {
                "zip_code": order.delivery_postal_code,
                "street_name": order.delivery_street,
            },
        },
        "back_urls": {
            "success": f"{frontend}/checkout/success?order_id={order.id}",
            "failure": f"{frontend}/checkout/failure?order_id={order.id}",
            "pending": f"{frontend}/orders/{order.id}",
        },
        "auto_return": "approved",
        "external_reference": str(order.id),
        "notification_url": f"{backend}/api/checkout/webhook/",
    }


def _normalize_postal_code(value):
    digits = "".join(char for char in str(value or "") if char.isdigit())
    if len(digits) != 8:
        raise ValidationError({"delivery_postal_code": "CEP invalido."})
    return f"{digits[:5]}-{digits[5:]}"


def _required_string(data, key):
    value = str(data.get(key, "")).strip()
    if not value:
        raise ValidationError({key: "Campo obrigatorio."})
    return value


class CheckoutService:
    gateway_class = MercadoPagoGateway

    def __init__(self, user, data):
        self.user = user
        self.data = data

    def create_payment(self):
        order_id = self.data.get("order_id")
        if not order_id:
            raise ValidationError({"order_id": "Campo obrigatorio."})

        with transaction.atomic():
            try:
                order = (
                    Order.objects
                    .select_for_update()
                    .prefetch_related("items__product")
                    .get(pk=order_id, user=self.user)
                )
            except Order.DoesNotExist:
                raise NotFound("Order not found.")

            if order.status not in (Order.Status.PENDING, Order.Status.PROCESSING):
                raise ValidationError({"order_id": "Pedido nao pode ser pago."})

            self._apply_checkout_fields(order)
            preference = self.gateway_class().create_preference(order)
            if not preference.preference_id or not preference.init_point:
                raise ValidationError("Invalid Mercado Pago preference response.")

            order.status = Order.Status.PROCESSING
            order.payment_id = preference.preference_id
            order.payment_provider_status = "preference_created"
            order.save(
                update_fields=[
                    "delivery_street",
                    "delivery_neighborhood",
                    "delivery_city",
                    "delivery_state",
                    "delivery_postal_code",
                    "lgpd_consent",
                    "lgpd_consented_at",
                    "status",
                    "payment_id",
                    "payment_provider_status",
                    "updated_at",
                ]
            )

        return preference

    def _apply_checkout_fields(self, order):
        if self.data.get("lgpd_consent") is not True:
            raise ValidationError({"lgpd_consent": "Consentimento LGPD obrigatorio."})

        order.delivery_street = _required_string(self.data, "delivery_street")
        order.delivery_neighborhood = _required_string(
            self.data, "delivery_neighborhood"
        )
        order.delivery_city = _required_string(self.data, "delivery_city")
        order.delivery_state = _required_string(self.data, "delivery_state").upper()
        if len(order.delivery_state) != 2:
            raise ValidationError({"delivery_state": "Use a sigla UF com 2 letras."})
        order.delivery_postal_code = _normalize_postal_code(
            self.data.get("delivery_postal_code")
        )
        order.lgpd_consent = True
        order.lgpd_consented_at = timezone.now()


def verify_mercado_pago_signature(request):
    secret = settings.MP_WEBHOOK_SECRET
    if not secret:
        return False

    signature = (
        request.headers.get("x-signature")
        or request.headers.get("MP-Signature")
        or ""
    )
    request_id = request.headers.get("x-request-id", "")
    parts = {}
    for part in signature.split(","):
        key, _, value = part.partition("=")
        if key and value:
            parts[key.strip()] = value.strip()

    timestamp = parts.get("ts")
    received_hash = parts.get("v1")
    data_id = request.query_params.get("data.id") or _payload_payment_id(request.data)
    if not timestamp or not received_hash or not request_id or not data_id:
        return False

    manifest = f"id:{data_id};request-id:{request_id};ts:{timestamp};"
    expected_hash = hmac.new(
        secret.encode(),
        msg=manifest.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_hash, received_hash)


def _payload_payment_id(payload):
    data = payload.get("data") if isinstance(payload, dict) else None
    if isinstance(data, dict):
        return data.get("id")
    return payload.get("id") if isinstance(payload, dict) else None


class WebhookService:
    gateway_class = MercadoPagoGateway

    def __init__(self, payload):
        self.payload = payload

    def process(self):
        payment_id = _payload_payment_id(self.payload)
        if not payment_id:
            raise ValidationError({"payment_id": "Payment id not found."})

        payment = self.gateway_class().get_payment(payment_id)
        external_reference = payment.get("external_reference")
        provider_status = payment.get("status", "")

        if not external_reference:
            raise ValidationError({"external_reference": "Order reference not found."})

        with transaction.atomic():
            try:
                order = Order.objects.select_for_update().get(pk=external_reference)
            except Order.DoesNotExist:
                raise NotFound("Order not found.")

            previous_status = order.status
            order.payment_provider_status = provider_status
            order.status = _mapped_order_status(order.status, provider_status)
            order.save(
                update_fields=[
                    "payment_provider_status",
                    "status",
                    "updated_at",
                ]
            )

            if previous_status != Order.Status.PAID and order.status == Order.Status.PAID:
                transaction.on_commit(lambda: send_confirmation_email_async(order.id))

        return order


def _mapped_order_status(current_status, provider_status):
    if provider_status in APPROVED_STATUSES:
        return Order.Status.PAID
    if provider_status in REJECTED_STATUSES:
        return Order.Status.CANCELLED
    if provider_status in PENDING_STATUSES:
        return Order.Status.PROCESSING
    return current_status


def send_confirmation_email_async(order_id):
    thread = threading.Thread(
        target=_send_confirmation_email,
        args=(order_id,),
        daemon=True,
    )
    thread.start()


def _send_confirmation_email(order_id):
    order = Order.objects.select_related("user").get(pk=order_id)
    send_mail(
        subject=f"Confirmacao do pedido #{order.id}",
        message=(
            f"Recebemos o pagamento do pedido #{order.id}. "
            f"Total: R$ {order.total_price}."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )
