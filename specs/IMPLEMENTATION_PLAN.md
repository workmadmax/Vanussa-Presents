# Implementation Plan: MVP Stabilization

**Status:** Approved for task breakdown
**Source of truth:** `specs/PRD.md`
**Related decision:** `specs/decisions/ADR-001-spec-driven-development.md`
**Last updated:** 2026-05-26

## Summary

Stabilize the existing e-commerce MVP before adding features. The plan focuses on deterministic tests, passing frontend gates, backend domain invariants, order security and maintainable frontend integration.

No public API route should change in this cycle. Checkout remains simulated. Pix, real payment providers, shipping, custom admin, deploy architecture and observability integrations are outside this plan.

## Implementation Strategy

- Work in small SDD tasks from `specs/TASKS.md`.
- Use TDD for code changes: red, green, refactor.
- Prefer local patterns already present in the repo.
- Keep domain logic out of Django views where practical.
- Preserve user-owned data protections by filtering order queries by `request.user`.
- Do not perform unrelated formatting or broad refactors except the explicit ESLint Allman cleanup decision.

## Task Sequence

1. `T-001`: Create official PostgreSQL Docker test infrastructure and document one backend test command.
2. `T-002`: Remove the Allman `brace-style` ESLint rule while keeping Next.js/TypeScript quality rules.
3. `T-003`: Fix the Next.js production build by resolving `useSearchParams()` usage and `Suspense` boundaries.
4. `T-004`: Align checkout tests with `/checkout/{id}` and mock the API call so Jest does not hit localhost.
5. `T-005`: Reject invalid product prices for sellable products.
6. `T-006`: Reject invalid order quantities, keep totals server-calculated and wrap order creation in a transaction.
7. `T-007`: Route frontend HTTP calls through the central API client and remove hardcoded API URLs from feature code.
8. `T-008`: Consolidate duplicate cart/support menu hooks.
9. `T-009`: Add a baseline CI workflow for backend and frontend gates.

## Public Interfaces

Preserve these REST routes:

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

The required operational interface is Docker Compose. Backend, frontend, lint, build, migration, test and inspection commands must run inside Compose services:

```text
docker compose up -d --build
docker compose exec backend python manage.py check
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py test
docker compose exec frontend npm run lint
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
```

The database is available only on the Compose network as `db:5432` through `DATABASE_URL=postgres://site:site@db:5432/site`.

## Acceptance Gates

The stabilization cycle is complete only when:

- Backend tests are discovered and pass in the documented Docker Compose PostgreSQL environment.
- `docker compose exec backend python manage.py check` passes.
- Frontend `docker compose exec frontend npm test -- --runInBand` passes.
- Frontend `docker compose exec frontend npm run lint` has no blocking errors.
- Frontend `docker compose exec frontend npm run build` passes.
- Product price and order quantity invariants are covered by regression tests.
- Cross-user order access remains covered by API tests.
- No hardcoded `127.0.0.1:8000` API calls remain outside the approved API client/config boundary.

## Rollback Strategy

Each implementation task must be independently reversible. If a task breaks a gate, revert only that task's code and keep the documentation update that records the discovered issue.
