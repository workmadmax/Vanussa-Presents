# Project Audit: MVP Stabilization Baseline

**Date:** 2026-05-26
**Project:** Loja e-commerce Django REST + Next.js
**Related specs:** `specs/PRD.md`, `specs/AGENTS.md`
**Purpose:** Capture the current repository state before implementation tasks begin.

## Summary

The project is a real e-commerce MVP in a monorepo:

- Backend: Django REST Framework under `backend/`, with domain apps for categories, products, users and orders.
- Frontend: Next.js App Router under `frontend/`, with shared contexts for auth/cart and service code under `frontend/src/services`.
- Specs: initial PRD and agent rules already exist under `specs/`.

The next SDD cycle should stabilize the existing MVP before adding new features. Payment, shipping, custom admin, provider integrations and deployment architecture remain out of scope until the PRD is updated.

## Repository State

Relevant structure:

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
specs/
  PRD.md
  AGENTS.md
```

Observed Git state before this audit:

- `frontend/AGENTS.md` is deleted.
- `frontend/CLAUDE.md` is deleted.
- `.agents/`, `docs/` and `specs/` are untracked.

These pre-existing deletions are not part of the SDD documentation task and should not be reverted without an explicit decision.

## Verified Gates

Commands inspected during planning:

- `backend/.venv/bin/python backend/manage.py check` passes from the repository root.
- `cd backend && .venv/bin/python manage.py test` discovers 96 tests, then fails while creating or connecting to the PostgreSQL test database.
- `cd frontend && npm test -- --runInBand` runs 10 suites: 9 pass and 1 fails in `cartPage.test.tsx`.
- `cd frontend && npm run lint` fails with 305 reported problems, mostly from the Allman `brace-style` rule.
- `cd frontend && npm run build` fails in the real environment because `useSearchParams()` is used without an appropriate `Suspense` boundary during prerendering.

The first backend test blocker is environment reproducibility, not necessarily a failing assertion. The first frontend blockers are a checkout test mismatch, lint policy noise and a Next.js build boundary issue.

## Key Findings

- Product price validation is incomplete: `Product.price` accepts negative values.
- Order quantity validation is incomplete: `OrderService` does not reject zero or negative quantities before stock and total calculations.
- Order ownership is partially protected: order detail and my-orders queries filter by `request.user`; regression tests must stay mandatory.
- Order creation is not wrapped in an explicit transaction; manual `order.delete()` cleanup is fragile.
- Frontend API usage is inconsistent: the Axios client exists, but some auth and cart flows still use hardcoded `fetch("http://127.0.0.1:8000/...")`.
- There are duplicate cart/support menu hooks with overlapping responsibilities.
- The frontend route behavior is `/checkout/{id}`, while one test still expects `/checkout`.
- Next.js client hooks using `useSearchParams()` appear in places that affect static prerendering.
- ESLint currently enforces Allman braces, which conflicts with the existing code style and creates high noise.

## Recommended SDD Order

1. Finish required SDD artifacts and approve task sequence.
2. Make backend tests reproducible with PostgreSQL via Docker Compose.
3. Remove the Allman lint rule before broad lint cleanup.
4. Fix frontend build and checkout test regressions.
5. Add backend domain invariants for price, quantity and server-calculated totals.
6. Consolidate frontend API access and duplicate hooks.
7. Add CI once local commands are deterministic.

## Audit Conclusion

The MVP is feature-shaped but not yet production-ready. The immediate objective is not feature expansion; it is to establish stable gates, enforce domain invariants and reduce security risk around orders, auth and environment configuration.
