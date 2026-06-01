# Research: Checkout Mercado Pago Pro

## Decisions

### Payment provider integration

- Decision: Use Mercado Pago Checkout Pro with preference creation and hosted
  payment flow.
- Rationale: Keeps payment handling with the provider and aligns with the
  required redirect flow and return pages.
- Alternatives considered: Custom card capture or embedded checkout.

### Webhook authentication and status validation

- Decision: Validate provider notifications using the signature header and
  confirm payment status with the provider before updating orders.
- Rationale: Prevents spoofed updates and ensures status accuracy.
- Alternatives considered: Trusting webhook payload without verification.

### Address auto-fill

- Decision: Use ViaCEP client-side lookups to auto-fill delivery address fields.
- Rationale: Keeps address UX responsive and avoids backend proxy work.
- Alternatives considered: Backend proxy to ViaCEP or manual entry only.

### Pending expiration

- Decision: Use a Django management command scheduled by cron to expire
  processing orders after the configured window.
- Rationale: Matches the requested operational approach and avoids new worker
  infrastructure.
- Alternatives considered: Celery beat or external scheduler.

### Transactional email

- Decision: Send confirmation emails via SendGrid after an order reaches paid.
- Rationale: Aligns with the existing dependency choice and scalable delivery.
- Alternatives considered: Direct SMTP or other providers.

## Notes

- The default expiration window is assumed to be 48 hours until updated.
- All decisions align with the mission constraints and NFRs in the spec.
