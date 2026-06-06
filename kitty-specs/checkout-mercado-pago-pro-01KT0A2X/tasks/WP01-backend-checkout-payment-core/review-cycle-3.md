---
affected_files: []
cycle_number: 3
mission_slug: checkout-mercado-pago-pro-01KT0A2X
reproduction_command:
reviewed_at: '2026-06-05T00:06:44Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP01
---

# Review Cycle 1 - WP01 Backend Checkout And Payment Core

Verdict: changes requested.

## Blocking Findings

1. Mercado Pago SDK is used by production code but is not installed in the Docker environment.

- Evidence: `backend/apps/checkout/services.py` imports `mercadopago` in `MercadoPagoGateway.__init__`, but `backend/requirements.txt` does not declare the package.
- Verification: `docker compose run --rm backend python -c "import mercadopago"` fails with `ModuleNotFoundError: No module named 'mercadopago'`.
- Impact: `POST /api/checkout/payment/` cannot create a real Mercado Pago preference, so T003 and the Definition of Done item "Payment initiation endpoint behaves per the contract" are not met outside mocked tests.
- Required remediation: add the Mercado Pago SDK to `backend/requirements.txt`, rebuild the backend image, and verify the import succeeds in Docker.

2. Processing-order expiration is tied to generic `updated_at`, not the time the order entered processing.

- Evidence: `backend/apps/checkout/management/commands/expire_processing_orders.py` filters stale orders with `updated_at__lt=cutoff`.
- Impact: any later webhook replay, admin save, serializer-side update, or provider-status refresh resets `updated_at` and can indefinitely postpone expiration. This violates FR-008/FR-009: pending payments must remain processing until the defined expiration window, then be cancelled.
- Required remediation: persist a dedicated processing-start timestamp or payment-initiation timestamp when checkout begins, migrate existing data safely, and use that field for expiration. Add tests showing a processing order still expires based on payment initiation time even if `updated_at` changes later.

## Validation Performed

- `docker compose run --rm backend python manage.py test apps.checkout apps.orders --noinput` passed: 38 tests OK.
- `docker compose run --rm backend python -c "import mercadopago"` failed with `ModuleNotFoundError`.

## Dependency Warning

WP02 depends on WP01. After these backend changes are made, WP02 agents should rebase or refresh against the updated WP01 contract and implementation.
