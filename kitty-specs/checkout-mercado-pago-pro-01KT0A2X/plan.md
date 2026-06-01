# Implementation Plan: Checkout Mercado Pago Pro

_Path: [templates/plan-template.md](templates/plan-template.md)_

**Branch**: `feat/checkout-mercadopago-02` | **Date**: 2026-06-01 | **Spec**: [kitty-specs/checkout-mercado-pago-pro-01KT0A2X/spec.md](kitty-specs/checkout-mercado-pago-pro-01KT0A2X/spec.md)
**Input**: Feature specification from `/kitty-specs/checkout-mercado-pago-pro-01KT0A2X/spec.md`

The planning questions are complete. Proceeding with the implementation plan.

## Summary

Implement Mercado Pago Checkout Pro for authenticated checkout, including
address collection with CEP auto-fill, LGPD consent capture, payment preference
creation, webhook-driven status updates, and success/failure outcomes. Pending
payments remain in processing until a management command expires them, executed
via cron. Paid orders trigger confirmation emails.

## Technical Context

**Language/Version**: Python 3.12.3 (Django 6.0.4, DRF 3.17.1), Node 20.20.2
(Next.js 16.2.4, React 19.2.5, TypeScript 5.x)
**Primary Dependencies**: Mercado Pago SDK, SendGrid, ViaCEP public API,
cron-managed Django management command
**Storage**: PostgreSQL (existing Order storage)
**Testing**: Django tests via `python manage.py test`; frontend Jest/RTL via
`npm test -- --runInBand`
**Target Platform**: Linux server + modern browsers
**Project Type**: Web application (Django backend + Next.js frontend)
**Performance Goals**: Meet NFR thresholds from spec for CEP auto-fill,
notification handling, and email dispatch
**Constraints**: Mercado Pago Checkout Pro only; no subscriptions, split
payments, or external card data storage
**Scale/Scope**: Single-store ecommerce checkout and order management

## Charter Check

Charter file is missing; governance gate skipped for this mission. No conflicts
identified from existing repository practices.

## Project Structure

### Documentation (this feature)

```
kitty-specs/checkout-mercado-pago-pro-01KT0A2X/
├── plan.md              # This file (/spec-kitty.plan command output)
├── research.md          # Phase 0 output (/spec-kitty.plan command)
├── data-model.md        # Phase 1 output (/spec-kitty.plan command)
├── quickstart.md        # Phase 1 output (/spec-kitty.plan command)
├── contracts/           # Phase 1 output (/spec-kitty.plan command)
└── tasks.md             # Phase 2 output (/spec-kitty.tasks command - NOT created by /spec-kitty.plan)
```

### Source Code (repository root)

```
backend/
├── manage.py
├── apps/
│   ├── checkout/               # New app for payment + webhook handlers
│   ├── orders/
│   ├── users/
│   └── products/
└── core/

frontend/
└── src/
    ├── app/
    │   └── checkout/
    │       ├── [id]/page.tsx
    │       ├── success/page.tsx
    │       └── failure/page.tsx
    ├── services/
    ├── components/
    └── context/
```

**Structure Decision**: Use the existing web monorepo layout with a Django
backend and Next.js frontend; add a new `backend/apps/checkout` module and
extend the checkout routes under `frontend/src/app/checkout`.
