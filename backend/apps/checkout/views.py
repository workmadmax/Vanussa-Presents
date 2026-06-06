from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import (
    CheckoutService,
    WebhookService,
    verify_mercado_pago_signature,
)


class CheckoutPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        preference = CheckoutService(request.user, request.data).create_payment()
        return Response(
            {
                "init_point": preference.init_point,
                "preference_id": preference.preference_id,
            },
            status=status.HTTP_201_CREATED,
        )


class MercadoPagoWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if not verify_mercado_pago_signature(request):
            return Response(
                {"detail": "Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        WebhookService(request.data).process()
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
