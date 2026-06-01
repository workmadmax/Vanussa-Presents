# Data Model: Checkout Mercado Pago Pro

## Existing Entities

### Order

- Current fields: status, total, customer reference, payment_method_id.
- Proposed additions:
  - delivery_street
  - delivery_neighborhood
  - delivery_city
  - delivery_state
  - delivery_postal_code
  - lgpd_consent (boolean)
  - lgpd_consented_at (timestamp)
  - payment_provider_status (string, optional for last known provider status)

## Supporting Records (Optional)

### Payment Notification Log (optional)

- Purpose: audit provider notifications and status changes.
- Fields: order_id, provider_event_id, status, received_at, signature_valid.

## Validation Rules

- CEP must be valid Brazilian postal code format.
- Address fields must be present before creating a payment preference.
- LGPD consent must be true before payment initiation.
- Status transitions allowed:
  - CREATED -> PROCESSING -> PAID
  - CREATED -> PROCESSING -> CANCELLED
  - PROCESSING -> CANCELLED (expiration)

## State Transitions

- Payment initiation sets status to PROCESSING and stores payment_id.
- Approved provider status sets order to PAID and sends confirmation email.
- Rejected provider status sets order to CANCELLED.
- Pending provider status keeps PROCESSING until expired by cron job.
