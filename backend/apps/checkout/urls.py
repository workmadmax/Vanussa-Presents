from django.urls import path

from .views import CheckoutPaymentView, MercadoPagoWebhookView


urlpatterns = [
    path("payment/", CheckoutPaymentView.as_view(), name="checkout-payment"),
    path("webhook/", MercadoPagoWebhookView.as_view(), name="checkout-webhook"),
]
