# Test Plan: MVP Stabilization

**Status:** Baseline
**Source of truth:** `specs/PRD.md`
**Last updated:** 2026-05-26

## Test Environments

Backend tests must run against PostgreSQL. SQLite is not the default because production is expected to use PostgreSQL and order/catalog invariants should be checked against the same database family.

Target local test environment:

```text
Docker Compose services: db, backend, frontend
Database: site
User: site
Password: site
Database host: db
DATABASE_URL=postgres://site:site@db:5432/site
```

Frontend tests run in Jest with jsdom. Tests must mock network calls; they should not call `127.0.0.1:8000`.

## Command Matrix

Backend:

```bash
docker compose up -d --build
docker compose exec backend python manage.py check
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py test
```

Frontend:

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
```

Planned CI gates:

```text
backend:
  install dependencies
  start PostgreSQL
  manage.py check
  migrations check
  tests

frontend:
  npm ci
  npm run lint
  npm test -- --runInBand
  npm run build
```

## Required Backend Scenarios

- Product with negative price is rejected.
- Sellable product with zero price is rejected unless the PRD explicitly allows free products later.
- Order item quantity zero is rejected.
- Order item quantity negative is rejected.
- Order creation uses product price from the server, not client-provided totals.
- Order total equals the sum of item price snapshots times quantity.
- Order creation fails when product is inactive.
- Order creation fails when stock is insufficient.
- Unauthenticated user cannot create orders.
- User can list only their own orders.
- User cannot retrieve another user's order by changing the ID.
- Profile endpoint requires authentication and returns only the authenticated user's profile.

## Required Frontend Scenarios

- Cart adds the same product twice by increasing quantity.
- Cart subtotal reflects price times quantity.
- Unauthenticated checkout prompts login instead of creating an order.
- Authenticated checkout posts the mapped cart items and redirects to `/checkout/{id}`.
- Checkout test mocks API success and failure paths.
- Orders page handles unauthenticated state.
- API client attaches access token when present.
- API client refreshes token on supported 401 responses.
- Production build does not fail due to `useSearchParams()` usage.
- No test performs real network calls to `127.0.0.1:8000`.

## Current Known Failures

- Backend tests are blocked by PostgreSQL test database setup.
- Frontend `cartPage.test.tsx` expects `/checkout` but the app routes to `/checkout/{id}`.
- Frontend lint is blocked mostly by the Allman `brace-style` rule.
- Frontend production build is blocked by `useSearchParams()` without an appropriate boundary.

## Definition of Done for Test Work

- Every bug fix includes a regression test.
- Every domain invariant has a model, serializer, service or API test at the correct layer.
- Tests are deterministic and do not depend on services that are not started by the documented workflow.
- Any remaining failing gate is documented with owner, reason and next task.
