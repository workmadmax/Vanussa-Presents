# Implementation Plan: MVP Stabilization

**Mission:** `mvp-stabilization-01KSKEFD`  
**Branch:** `main`  
**Planning/base branch:** `main`  
**Merge target:** `main`  
**Spec:** `kitty-specs/mvp-stabilization-01KSKEFD/spec.md`  
**Status:** Ready for task generation

## Summary

Finish stabilizing the existing Django REST + Next.js e-commerce MVP without
adding product features. The plan turns the manual `/specs/` SDD material into
Spec Kitty implementation slices focused on API client consistency, cart/menu
cleanup, frontend lint/build gates, and CI.

Already completed work must be recorded, not reimplemented: Docker Compose,
positive product pricing, order quantity/total invariants, category test
alignment, checkout route alignment, Allman lint removal, and part of central
API-client consolidation.

## Technical Context

**Languages/Versions:** Python 3.12.3, Django 6.0.4, DRF 3.17.1, Node 20.20.2,
npm 11.13.0, Next.js 16.2.4, React 19.2.5, TypeScript 5.x, Tailwind CSS 4.

**Primary Dependencies:** SimpleJWT, django-cors-headers, dj-database-url,
psycopg2-binary, axios, lucide-react, Jest, Testing Library, ESLint 9,
Prettier 3.8.3.

**Storage:** PostgreSQL through `DATABASE_URL`; local media under
`backend/media/product_images` for development/staging only.

**Testing:** Backend Django/DRF tests through Docker Compose PostgreSQL;
frontend Jest/jsdom tests with network calls mocked; lint/build gates through
frontend npm scripts.

**Project Type:** Monorepo web application with separate `backend/`,
`frontend/`, manual historical specs in `specs/`, and Spec Kitty mission docs in
`kitty-specs/mvp-stabilization-01KSKEFD/`.

**Performance Goals:** Preserve PRD targets: API reads p95 under 500 ms and
order creation p95 under 800 ms in small/medium staging data.

**Constraints:** Preserve public REST routes, do not implement Pix/payment,
shipping, custom admin, production deploy or observability integrations, and do
not delete host `.next` permission artifacts without authorization.

## Charter Check

No `.kittify/charter/charter.md` exists. The charter gate is skipped for this
mission and recorded as a governance gap. The manual rules in `specs/AGENTS.md`
act as the local operating doctrine: preserve PRD scope, use TDD, protect
security-sensitive order/auth behavior, and keep changes small.

## Project Structure

```text
backend/
  apps/categories/
  apps/products/
  apps/users/
  apps/orders/
  core/
frontend/
  src/app/
  src/components/
  src/context/
  src/services/
  src/types/
specs/
  PRD.md
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  TASKS.md
  TEST_PLAN.md
  SECURITY_REVIEW.md
kitty-specs/mvp-stabilization-01KSKEFD/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
  tasks.md
  tasks/
```

**Structure Decision:** Keep the current monorepo layout. Work packages may
touch frontend source, frontend tests, CI workflow files, and mission docs only
where explicitly owned.

## Implementation Strategy

- Treat `specs/` as preserved historical/manual SDD material.
- Use `kitty-specs/mvp-stabilization-01KSKEFD/` as the Spec Kitty execution
  surface for remaining work.
- Keep backend behavior unchanged unless a later explicit WP owns backend work.
- Complete frontend stabilization in focused WPs:
  - central API client validation and token refresh tests;
  - cart checkout/menu hook consolidation;
  - lint/build cleanup;
  - CI baseline after local gates are stable.
- Run validation through Docker Compose where possible:
  - `docker compose exec backend python manage.py check`
  - `docker compose exec backend python manage.py test`
  - `docker compose exec frontend npm test -- --runInBand`
  - `docker compose exec frontend npm run lint`
  - `docker compose exec frontend npm run build`

## Public Interfaces

Preserve these routes:

```text
/api/categories/
/api/products/
/api/products/<slug>/
/api/users/register/
/api/users/login/
/api/users/token/refresh/
/api/users/profile/
/api/orders/create/
/api/orders/my-orders/
/api/orders/<id>/
```

Preserve `NEXT_PUBLIC_API_URL` as the frontend environment boundary. The
fallback API base URL may remain in `frontend/src/services/api.ts`, but feature
code should not hardcode API hosts.

## Remaining Work Packages

1. **WP01 - Auth/API client stabilization:** validate central API client usage,
   refresh-token behavior, auth error typing, and tests.
2. **WP02 - Cart checkout/menu consolidation:** finish cart/menu API usage,
   canonical hook ownership, checkout redirect, and interaction tests.
3. **WP03 - Frontend lint/build gates:** fix React Hooks lint, `any`, `curly`,
   internal Link/Image findings, config warnings, and build validation.
4. **WP04 - CI baseline:** add GitHub Actions workflow mirroring backend and
   frontend gates with PostgreSQL.

## Acceptance Gates

- `spec-kitty agent mission finalize-tasks --validate-only --mission
  mvp-stabilization-01KSKEFD --json` passes.
- Work package ownership has no overlapping file globs.
- Frontend Jest remains green.
- Remaining implementation WPs, when executed later, make lint/build/CI gates
  green without changing public product scope.

## Rollback

Each WP must be independently reversible. If a WP breaks a gate, revert only
that WP. Do not revert the migrated Spec Kitty mission artifacts unless the user
explicitly decides to discard the migration.
