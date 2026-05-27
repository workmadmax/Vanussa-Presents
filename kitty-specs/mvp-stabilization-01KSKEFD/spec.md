# MVP Stabilization Specification

**Mission:** `mvp-stabilization-01KSKEFD`  
**Mission type:** `software-dev`  
**Target branch:** `main`  
**Planning/base branch:** `main`  
**Merge target:** `main`  
**Source of truth migrated from:** `/specs/` manual SDD docs  
**Status:** Ready for Spec Kitty plan/tasks generation

## Summary

This mission migrates the existing manual Spec-Driven Development material into
the Spec Kitty workflow and uses it to finish stabilizing the current e-commerce
MVP. The product is a real online store implemented as a monorepo with Django
REST Framework backend and Next.js frontend.

The mission does not add new product features. It preserves the current public
API surface and focuses on reliable gates, frontend cleanup, API-client
consistency, CI, and documentation alignment before future Pix, shipping, custom
admin, production deploy, or observability work.

## Source Material Analyzed

- `specs/PRD.md`
- `specs/AGENTS.md`
- `specs/IMPLEMENTATION_PLAN.md`
- `specs/TASKS.md`
- `specs/TEST_PLAN.md`
- `specs/SECURITY_REVIEW.md`
- `specs/audits/2026-05-26-project-audit.md`
- `specs/decisions/ADR-001-spec-driven-development.md`
- `docs/01-visão-geral.md`
- `docs/estado-atual.md`
- `docs/estado-atual-v2.md`
- `compose.yml`
- `.kittify/config.yaml` and `.kittify/metadata.yaml`
- Backend apps: categories, products, users, orders, core settings and URLs
- Frontend app routes, contexts, components, services, tests and config files

The existing `/specs/` directory remains preserved as historical/manual SDD
documentation. This mission is the canonical Spec Kitty representation for the
remaining stabilization work.

## Product Objective

Provide a production-oriented e-commerce MVP where:

- Visitors can browse active categories/products and view product details.
- Authenticated customers can manage profile state, cart state, simulated
  checkout, and their own orders.
- Store administrators can use Django Admin for basic MVP operations.
- Developers can evolve the project through specs, tests, security review, and
  repeatable local/CI gates.

## Users

- **Visitor:** browses catalog and product details.
- **Authenticated customer:** manages cart, profile and orders.
- **Store administrator:** manages catalog, users and orders through Django
  Admin in the MVP.
- **Order operator:** inspects simulated orders manually in the MVP.
- **Developer/agent:** changes the system through Spec Kitty work packages with
  TDD and validation gates.

## Current Implemented Surface

- Backend: Django 6.0.4, DRF 3.17.1, SimpleJWT 5.5.1, PostgreSQL via
  `DATABASE_URL`.
- Frontend: Next.js 16.2.4 App Router, React 19.2.5, TypeScript, Tailwind CSS 4,
  Jest and Testing Library.
- Docker Compose services: `db`, `backend`, `frontend`.
- Existing routes to preserve:
  - `/api/categories/`
  - `/api/products/`
  - `/api/products/<slug>/`
  - `/api/users/register/`
  - `/api/users/login/`
  - `/api/users/token/refresh/`
  - `/api/users/profile/`
  - `/api/orders/create/`
  - `/api/orders/my-orders/`
  - `/api/orders/<id>/`
- Frontend routes detected:
  - `/`
  - `/cart`
  - `/orders`
  - `/profile`
  - `/products/[slug]`
  - `/checkout/[id]`

## Requirements

### Functional Requirements

- **FR-001 [Implemented]:** List active products with category, name, slug,
  price, images, stock/availability and pagination.
- **FR-002 [Implemented]:** Show product detail by `slug` for active products.
- **FR-003 [Implemented]:** Active/sellable products require `price > 0` at
  model/database level.
- **FR-004 [Implemented]:** Frontend cart tracks items, quantity and subtotal.
- **FR-005 [Implemented]:** Authenticated checkout creates a simulated order
  without real payment and redirects to `/checkout/{id}`.
- **FR-006 [Implemented]:** Registration, login, token refresh, profile read and
  profile update exist.
- **FR-007 [Implemented]:** Order detail and my-orders endpoints scope data to
  the authenticated user.
- **FR-008 [Implemented]:** Customers can list only their own orders.
- **FR-009 [Implemented]:** Django Admin remains the MVP admin surface.
- **FR-010 [Partially Implemented]:** Frontend API calls must go through the
  central configurable API client. Recent preflight work moved auth and cart menu
  calls to the client; remaining validation is required.
- **FR-011 [Partially Implemented]:** Frontend production/build/lint gates must
  pass. Jest passes; lint still fails; host build is blocked by `.next`
  permissions and should be validated through Docker Compose.
- **FR-012 [Implemented]:** Backend tests run reproducibly through Docker
  Compose/PostgreSQL according to `docs/estado-atual-v2.md`.
- **FR-013 [Not Implemented]:** CI must run backend check/tests and frontend
  lint/test/build on pull requests or main updates.

### Non-Functional Requirements

- **NFR-001 [Pending Gate]:** `docker compose exec frontend npm run lint` must
  pass with zero blocking errors.
- **NFR-002 [Pending Gate]:** `docker compose exec frontend npm run build` must
  pass without relying on host-owned `.next` artifacts.
- **NFR-003 [Implemented]:** `docker compose exec backend python manage.py test`
  must discover and pass the backend test suite.
- **NFR-004 [Implemented]:** `docker compose exec frontend npm test --
  --runInBand` must pass without real network calls.
- **NFR-005 [Pending]:** CI must mirror the local Docker Compose validation
  intent using PostgreSQL for backend tests.
- **NFR-006 [Pending Future Hardening]:** Production secrets, CORS, allowed
  hosts, secure headers, rate limiting and media storage require a future deploy
  security mission before launch.

### Constraints

- **C-001:** Do not implement Pix, payment providers, shipping, custom admin,
  native mobile, marketplace, multi-tenant, ERP or production deploy in this
  mission.
- **C-002:** Do not change the public REST route set listed above.
- **C-003:** Keep `/specs/` intact unless the user explicitly authorizes removal
  or archival changes.
- **C-004:** Use Docker Compose as the official validation interface for backend
  and frontend gates.
- **C-005:** Do not delete or repair host `.next` permission artifacts without
  explicit authorization; validate build through Compose.
- **C-006:** Use TDD for implementation WPs and keep work packages independently
  reversible.

## Current Gate Status

- `npm test -- --runInBand` from `frontend/`: PASS, 11 suites and 58 tests.
- `npm run lint` from `frontend/`: FAIL, 18 errors and 6 warnings, mainly
  React Hooks `set-state-in-effect`, `curly`, `no-explicit-any`, Next Link/Image
  warnings and config warnings.
- `npm run build` from `frontend/` on host: FAIL before Next.js build due to
  `EACCES` on `frontend/.next/build/package.json`, owned by `nobody:nogroup`.
- `backend/.venv/bin/python backend/manage.py check` from repo root: PASS.
- `backend/.venv/bin/python backend/manage.py test` from repo root: finds 0
  tests because of working-directory behavior.
- `../backend/.venv/bin/python manage.py test` from `backend/`: discovers 102
  tests but cannot connect/create PostgreSQL test DB on host without Compose.
- `docs/estado-atual-v2.md` records Compose backend suite PASS, 102 tests.

## Decisions Imported

- **DEC-001:** Use Spec-Driven Development for the project.
- **DEC-002:** Keep manual SDD docs under `/specs/`.
- **DEC-003:** Stabilize the MVP before adding new product features.
- **DEC-004:** Keep Django REST + Next.js as the application architecture.
- **DEC-005:** Preserve current public REST routes during stabilization.
- **DEC-006:** Use Docker Compose/PostgreSQL for backend test reliability.
- **DEC-007:** Remove Allman `brace-style` lint noise and keep meaningful
  Next.js/TypeScript quality rules.
- **DEC-008:** Treat `localStorage` token storage as an accepted MVP tradeoff,
  not final production hardening.
- **DEC-009:** Spec Kitty charter is absent; record as governance gap, not a
  blocker.

## Risks

- **RISK-001:** Order or profile data leakage through object ID access.
  Mitigation: keep request-user filtering and regression tests.
- **RISK-002:** Monetary/quantity invalid input causing negative totals or stock
  corruption. Mitigation: preserve implemented model/service validations and
  transaction handling.
- **RISK-003:** Frontend lint and host build state mask deploy readiness.
  Mitigation: complete lint WPs and validate build in Docker Compose.
- **RISK-004:** API calls bypassing the central client cause token/env drift.
  Mitigation: finish FR-010 validation and tests.
- **RISK-005:** CI introduced before local gates are stable creates noisy
  failures. Mitigation: make CI the final WP after local gates.
- **RISK-006:** Manual `/specs/` and Spec Kitty docs drift. Mitigation: treat
  this mission as the executable Spec Kitty source and keep conflicts recorded.

## Documentation And Code Conflicts

- Older manual docs say T-001 through T-006 are pending, but current code/docs
  show Compose, price validation, order invariants, category tests and checkout
  alignment have been implemented.
- Older audit material mentions hardcoded frontend `fetch` calls in auth/cart
  menu; preflight commits migrated those paths to the central API client, leaving
  validation rather than initial implementation.
- Older audit material mentions `useSearchParams` build failure; current source
  search finds no production `useSearchParams` usage, while host build is blocked
  by `.next` permissions.
- `specs/TASKS.md` now includes LINT-001 through LINT-005; these should be
  represented in Spec Kitty work packages instead of implemented from `/specs/`
  directly.

## Out Of Scope

- Real payment or Pix.
- Payment webhooks or provider integration.
- Shipping/freight calculation.
- Custom administrative UI.
- Production deploy architecture.
- Observability integrations.
- OpenAPI/type-generation introduction unless separately scoped.

## Acceptance Criteria

- Spec Kitty mission artifacts exist under
  `kitty-specs/mvp-stabilization-01KSKEFD/`.
- `/specs/` remains preserved.
- Work packages cover the remaining stabilization work without adding new
  features.
- `spec-kitty agent mission finalize-tasks --validate-only --mission
  mvp-stabilization-01KSKEFD --json` passes.
- `spec-kitty agent mission finalize-tasks --mission
  mvp-stabilization-01KSKEFD --json` completes and creates lane metadata.
- Next implementation action is explicitly `spec-kitty next --agent codex
  --mission mvp-stabilization-01KSKEFD`, only after user authorization.
