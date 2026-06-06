# Quickstart: Checkout Mercado Pago Pro

## Prerequisites

- Docker Compose services for backend and frontend.
- Mercado Pago credentials available as environment variables.
- SendGrid credentials available as environment variables.

## Environment Variables

- MP_ACCESS_TOKEN
- MP_WEBHOOK_SECRET
- SENDGRID_API_KEY
- DEFAULT_FROM_EMAIL

## Local Run (Example)

1. Start services with Docker Compose.
2. Create an authenticated user and an order.
3. Run the checkout flow from `/checkout/{orderId}`.
4. Simulate webhook notifications from Mercado Pago and verify order updates.
5. Run the expiration command manually, then add a cron entry for periodic runs.

## Cron Scheduling

- Add a cron entry to run the management command that expires processing orders
  (for example every 10 minutes).
- Keep the expiration window configurable via settings or environment.
