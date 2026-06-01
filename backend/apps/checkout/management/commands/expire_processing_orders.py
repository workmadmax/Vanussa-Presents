from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.orders.models import Order


class Command(BaseCommand):
    help = "Cancel processing orders older than the configured expiration window."

    def add_arguments(self, parser):
        parser.add_argument(
            "--hours",
            type=int,
            default=settings.CHECKOUT_PROCESSING_EXPIRATION_HOURS,
        )

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=options["hours"])
        expired = Order.objects.filter(
            status=Order.Status.PROCESSING,
            updated_at__lt=cutoff,
        ).update(
            status=Order.Status.CANCELLED,
            payment_provider_status="expired",
            updated_at=timezone.now(),
        )

        self.stdout.write(self.style.SUCCESS(f"Expired {expired} processing orders."))
