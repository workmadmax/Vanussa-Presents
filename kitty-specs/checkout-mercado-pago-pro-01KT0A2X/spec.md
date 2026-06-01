# Checkout Mercado Pago Pro Specification

**Mission:** `checkout-mercado-pago-pro-01KT0A2X`
**Mission type:** `software-dev`
**Target branch:** `feat/checkout-mercadopago-02`
**Planning/base branch:** `feat/checkout-mercadopago-02`
**Merge target:** `feat/checkout-mercadopago-02`

## Summary

Enable customers to complete checkout using Mercado Pago Checkout Pro with a
simple address flow, explicit LGPD consent, and clear post-payment outcomes.
Order status updates must be automatic and reflected to administrators without
manual intervention.

This mission excludes subscriptions, split payments, manual reconciliation, or
card data storage outside the provider.

## Users

- **Customer:** provides delivery address, consents to data usage, completes
	payment, and receives confirmation.
- **Store administrator:** sees order status updates automatically.

## User Scenarios And Testing

- **Happy path:** Customer fills delivery address, consents, is redirected to
	the payment provider, returns to a success screen, and receives an order
	confirmation email.
- **Payment rejected:** Customer returns to a failure screen with a retry
	option, and the order status is marked cancelled.
- **Payment pending:** Order remains in processing until it expires, then is
	marked cancelled.
- **Invalid provider notification:** The system rejects the update and leaves
	the order unchanged.

## Requirements

### Functional Requirements

- **FR-001 [Proposed]:** The checkout flow must collect delivery address
	details and auto-fill fields when a valid Brazilian CEP is provided, while
	still allowing manual edits.
- **FR-002 [Proposed]:** Street, neighborhood, city, state, and CEP must be
	validated before the customer can proceed to payment.
- **FR-003 [Proposed]:** The checkout must require explicit LGPD consent before
	enabling payment.
- **FR-004 [Proposed]:** Customers must be redirected to Mercado Pago Checkout
	Pro to complete payment and then returned to a success or failure outcome
	screen.
- **FR-005 [Proposed]:** When payment is initiated, the order status must
	transition to processing and remain visible to the customer.
- **FR-006 [Proposed]:** Approved payments must move the order to paid.
- **FR-007 [Proposed]:** Rejected payments must move the order to cancelled.
- **FR-008 [Proposed]:** Pending payments must keep the order in processing
	until it expires.
- **FR-009 [Proposed]:** An automated expiration process must cancel processing
	orders after the defined window.
- **FR-010 [Proposed]:** Payment status updates from Mercado Pago must be
	authenticated before any order changes occur.
- **FR-011 [Proposed]:** A paid order must trigger a transactional confirmation
	email to the customer.
- **FR-012 [Proposed]:** The order list and order detail views must show the
	processing state with the label "Processando".
- **FR-013 [Proposed]:** LGPD consent must be recorded with the order.
- **FR-014 [Proposed]:** The success screen must display the order summary.
- **FR-015 [Proposed]:** The failure screen must provide a retry action.

### Non-Functional Requirements

- **NFR-001 [Proposed]:** 95% of valid CEP auto-fill attempts must populate the
	address within 2 seconds.
- **NFR-002 [Proposed]:** 95% of authenticated payment status notifications
	must be reflected in order status within 5 minutes.
- **NFR-003 [Proposed]:** 95% of paid-order confirmation emails must be sent
	within 5 minutes of the order reaching paid status.
- **NFR-004 [Proposed]:** 95% of checkout validation error responses must be
	shown to the customer within 1 second of the attempt.
- **NFR-005 [Proposed]:** 99% of provider notification requests must receive a
	response within 2 seconds.

### Constraints

- **C-001:** Payments must use Mercado Pago Checkout Pro.
- **C-002:** Do not implement subscription billing, split payments, marketplace
	fees, or manual reconciliation.
- **C-003:** Do not store card data outside Mercado Pago.
- **C-004:** Delivery address is captured for the order only and is not stored
	as a user profile update.
- **C-005:** LGPD consent must be explicit and recorded per order.

## Key Entities

- **Order:** status, total, customer identity, and payment reference.
- **Delivery address:** street, neighborhood, city, state, and CEP.
- **Payment:** provider reference and current provider status.
- **Consent record:** LGPD consent timestamp and source.

## Success Criteria

- 95% of approved payments show the order as paid within 5 minutes of provider
	notification.
- 90% of customers reach the payment provider within 10 seconds after starting
	payment.
- 98% of processing orders older than the expiration window are cancelled
	within 10 minutes of expiry.
- 95% of paid orders send confirmation emails within 5 minutes.

## Assumptions

- The processing expiration window is 48 hours unless changed later.
- Checkout requires an authenticated customer and an existing order.
- Customer email addresses are available for confirmation messages.

## Out Of Scope

- Subscription or recurring billing.
- Split payments or marketplace fees.
- Manual payment reconciliation or admin review tools.
- Storing card data outside the payment provider.
- Address persistence to the user profile.

## Acceptance Criteria

- Customers can complete payment and see a success screen with the order
	summary.
- Rejected payments result in a failure screen with a retry option.
- Pending payments keep the order in processing until the expiration window
	elapses.
- Administrators see order status updates without manual intervention.
- Invalid provider notifications do not alter order state.
