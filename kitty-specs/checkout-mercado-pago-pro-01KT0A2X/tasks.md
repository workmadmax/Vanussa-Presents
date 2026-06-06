# Tasks: Checkout Mercado Pago Pro

**Mission:** `checkout-mercado-pago-pro-01KT0A2X`
**Source:** `kitty-specs/checkout-mercado-pago-pro-01KT0A2X/spec.md`
**Plan:** `kitty-specs/checkout-mercado-pago-pro-01KT0A2X/plan.md`
**Planning/base branch:** `feat/checkout-mercadopago-02`
**Merge target:** `feat/checkout-mercadopago-02`

## Subtask Index

| ID   | Description                                                      | WP   | Parallel |
| ---- | ---------------------------------------------------------------- | ---- | -------- |
| T001 | Create checkout app skeleton and wire routes                     | WP01 | No       | [D] |
| T002 | Extend Order model with delivery and LGPD consent fields         | WP01 | No       | [D] |
| T003 | Implement payment initiation endpoint and preference creation    | WP01 | No       | [D] |
| T004 | Implement webhook verification and order status updates          | WP01 | No       | [D] |
| T005 | Send confirmation email on paid orders                           | WP01 | No       | [D] |
| T006 | Add expiration management command for processing orders          | WP01 | No       | [D] |
| T007 | Build checkout address form with CEP auto-fill and validation    | WP02 | No       | [D] |
| T008 | Add LGPD consent gating and payment redirect                     | WP02 | No       | [D] |
| T009 | Implement success and failure pages with order summary and retry | WP02 | No       | [D] |
| T010 | Show "Processando" status in order list and detail views         | WP02 | No       | [D] |
| T011 | Update frontend services/types for checkout endpoints            | WP02 | No       | [D] |

## Work Packages

## WP01 - Backend Checkout And Payment Core

**Prompt:** `tasks/WP01-backend-checkout-payment-core.md`
**Priority:** P1
Dependencies: None
Requirement refs: FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013
**Independent test:** Manual API smoke checks and management command dry-run

- [x] T001 Create checkout app skeleton and wire routes.
- [x] T002 Extend Order model with delivery and LGPD consent fields.
- [x] T003 Implement payment initiation endpoint and preference creation.
- [x] T004 Implement webhook verification and order status updates.
- [x] T005 Send confirmation email on paid orders.
- [x] T006 Add expiration management command for processing orders.

## WP02 - Frontend Checkout Experience

**Prompt:** `tasks/WP02-frontend-checkout-experience.md`
**Priority:** P1
Dependencies: WP01
Requirement refs: FR-001, FR-002, FR-003, FR-004, FR-012, FR-014, FR-015
**Independent test:** Manual checkout walkthrough in the browser

- [x] T007 Build checkout address form with CEP auto-fill and validation.
- [x] T008 Add LGPD consent gating and payment redirect.
- [x] T009 Implement success and failure pages with order summary and retry.
- [x] T010 Show "Processando" status in order list and detail views.
- [x] T011 Update frontend services/types for checkout endpoints.
