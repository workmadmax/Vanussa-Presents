---
# AGENTS.md
---

**Source of Truth:** `/specs/PRD.md`. Never implement beyond PRD without a PRD update.
**Project:** Loja e-commerce Django REST + Next.js
**Updated:** 2026-05-26

## Spec-Driven Doctrine

1. Follow the phases: Specify → Plan → Tasks → Implement.
2. Do not skip approvals.
3. If requirements change, update `/specs/PRD.md` first.
4. After PRD changes, regenerate affected plan/tasks.
5. Prefer small, reversible, testable increments.
6. Never implement payment, custom admin, shipping, deploy architecture, or provider-specific integrations without an approved PRD update.
7. Treat this as a real production-oriented store, not a demo.

## Required Repository Paths

Specs live at:

```text
/specs/
  PRD.md
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  TEST_PLAN.md
  SECURITY_REVIEW.md
  decisions/
  audits/
```

Existing project structure:

```text
/backend/
/frontend/
```

Agents must read `/specs/PRD.md` and `/specs/AGENTS.md` before coding.

## Local Skills

Before changing Django code, agents must inspect and follow the local skills if present:

```text
.agents/skills/django-patterns/*
.agents/skills/django-security/*
.agents/skills/drf-serializer/*
.agents/skills/openapi-typescript/*
```

If these skills conflict with this document:
1. Prefer the stricter security rule.
2. Prefer the rule that keeps code more testable.
3. Stop and ask when conflict changes product behavior.
4. Record the decision in `/specs/decisions/`.

## Engineering Mandates

### Functional Programming

Use FP principles wherever practical:

- Pure functions for business rules.
- Immutable data transformations where possible.
- Explicit inputs and outputs.
- Avoid hidden global state.
- Avoid mixing IO with business logic.
- Model errors explicitly.
- Keep side effects at boundaries.

Code should be split ideologically into:

1. Functional core:
   - price calculations;
   - cart totals;
   - order totals;
   - validation rules;
   - DTO mapping;
   - permission predicates;
   - state transitions.

2. Imperative shell:
   - Django views;
   - database calls;
   - HTTP clients;
   - localStorage;
   - file/image IO;
   - logging;
   - environment/config access.

### TDD

Required flow:

1. Red: write or update failing test first.
2. Green: implement minimal code.
3. Refactor: improve design with tests green.

Testing requirements:
- Unit tests for pure domain rules.
- Serializer/model tests for validation.
- API tests for permissions and behavior.
- Frontend tests for critical user flows.
- Regression tests for every bug fixed.
- Property tests for invariants when useful, especially totals and quantities.

### Code Quality

General:
- Clear > clever.
- Small functions.
- Typed public APIs.
- Dead code removed.
- No duplicated hooks/services for the same responsibility.
- No hardcoded environment URLs outside config.
- Linters/formatters must be run before completion.

Python:
- Use type annotations for new/changed service/domain code.
- Introduce `mypy` or `pyright` when planned.
- Avoid business logic inside views.
- Prefer explicit custom exceptions or typed result objects for domain failures.

TypeScript:
- Avoid `any`; use DTO/contracts.
- Keep API response types explicit.
- Prefer pure components where possible.
- Separate server/client component concerns in Next.js.
- Components using `useSearchParams` must be isolated behind a proper `Suspense` boundary or redesigned to use server-provided `searchParams`.

## Django Architecture Rules

### App Layout

Preferred pattern per domain app:

```text
apps/<domain>/
  models.py
  serializers.py
  selectors.py
  services.py
  permissions.py
  views.py
  urls.py
  tests/
```

Use this gradually; do not perform massive rewrites without plan approval.

### Models

Models must protect core invariants:
- product price must not be negative;
- order item quantity must be positive;
- monetary values should use `Decimal`;
- timestamps should be explicit;
- constraints should be added where safe.

### Serializers

Serializers must:
- validate external input;
- avoid exposing sensitive fields;
- mark server-calculated fields read-only;
- never trust client-sent totals/prices for orders.

### Services

Services execute use cases:
- create order;
- calculate totals;
- transition order status;
- future payment initialization.

Services should:
- be easy to unit test;
- receive explicit inputs;
- keep database writes inside transaction boundaries when needed;
- return clear results or raise expected domain errors.

### Selectors

Selectors encapsulate important queries:
- list active products;
- get product by slug;
- list orders for user;
- get order for user.

Selectors should prevent authorization mistakes by design.

### Views / ViewSets

Views should be thin:
- parse request;
- call serializer/service/selector;
- return response.

Views must not:
- calculate complex totals inline;
- contain permission business rules inline when reusable;
- expose unrestricted querysets for user-owned data.

### Permissions

Object-level authorization is mandatory for:
- order detail;
- profile data;
- future admin/operator endpoints;
- future payment resources.

Any endpoint accepting object IDs must be reviewed for Broken Object Level Authorization risk.

## Django Security Rules

### Authentication

- JWT must be configured with reasonable expiration.
- Refresh tokens must be handled safely.
- No tokens in logs.
- No secrets in repository.
- Production settings must disable debug mode.

### Authorization

- Never rely on frontend hiding UI as authorization.
- Backend must enforce permissions.
- Querysets for user-owned resources must filter by `request.user`.
- Tests must attempt cross-user access.

### Input Validation

Validate:
- price > 0 for sellable products;
- quantity > 0;
- order item product exists and is active;
- status transitions;
- uploaded image constraints if applicable.

### API Safety

- Use explicit serializers.
- Avoid mass assignment.
- Mark sensitive/server-owned fields read-only.
- Use pagination for list endpoints.
- Use rate limiting/throttling for auth endpoints when planned.
- Return consistent error shapes.

### Configuration

- Use environment variables for secrets and environment-specific settings.
- Configure CORS per environment.
- Configure allowed hosts per environment.
- Use secure cookies/headers in production when applicable.
- Document local/staging/prod differences.

### Logging

- Log security-relevant events without secrets:
  - login failure;
  - permission denial;
  - order creation;
  - payment webhook future events.
- Do not log full tokens, passwords or sensitive PII.

## Frontend Architecture Rules

### API Client

- All API calls must go through one central API client.
- Base URL must come from environment config.
- No hardcoded `127.0.0.1:8000` outside allowed config.
- Auth token handling must be centralized.
- Errors must be normalized.

### State

- Keep cart/auth state predictable.
- Persist to localStorage only at boundary layer.
- Pure cart operations should be independently testable.
- Avoid duplicate hooks for the same feature.

### Components

- Presentational components should be pure where possible.
- Hooks should isolate side effects.
- Forms should expose accessible errors.
- Avoid raw `<a>` for internal navigation when framework link is appropriate.
- Handle loading, empty and error states.

### Next.js

- Respect server/client boundaries.
- Do not call client hooks in server components.
- Components using `useSearchParams` require `Suspense` or alternative design.
- `npm run build` is a required gate.

## Testing Protocol

Each task must include tests before implementation.

### Backend Tests

Required categories:
- model validation tests;
- serializer validation tests;
- service unit tests;
- API integration tests;
- permission tests;
- regression tests.

Critical cases:
- product negative price rejected;
- order item negative/zero quantity rejected;
- user cannot access another user's order;
- order total is calculated server-side;
- unauthenticated user cannot create/list orders;
- admin/staff behavior is explicit.

### Frontend Tests

Required categories:
- pure cart logic tests;
- component tests;
- integration tests for checkout/auth/orders;
- regression tests for known bugs.

Critical cases:
- cart subtotal calculation;
- checkout route behavior;
- auth-required pages;
- API error display;
- no build failure from `useSearchParams`.

### CI Gates

Minimum future CI pipeline:

```text
backend:
  install
  lint/format check
  typecheck when enabled
  manage.py check
  migrations check
  tests

frontend:
  install
  lint
  typecheck
  test
  build
```

No task is complete unless relevant gates pass locally or the failure is documented and approved.

## Task Protocol

Every implementation task must include:

```text
Task ID:
Related FR-ID:
Objective:
Current behavior:
Expected behavior:
Design notes:
Tests first:
Files likely changed:
Definition of Done:
Rollback notes:
Security considerations:
```

Definition of Done must include:
- tests written/updated;
- tests green;
- lint/build relevant gates green;
- docs/spec updated if behavior changed;
- security implications considered;
- no unrelated refactors.

## Recommended First Task Order

Do not implement until `/specs/IMPLEMENTATION_PLAN.md` is approved.

Suggested order:

1. Stabilize test commands and backend test database.
2. Fix frontend build error involving `useSearchParams` and `Suspense`.
3. Align checkout test with intended route or align route with intended UX.
4. Add product price validation.
5. Add quantity and order total invariants.
6. Add cross-user order authorization tests.
7. Consolidate frontend API client.
8. Remove/resolve duplicate cart hooks.
9. Decide ESLint Allman rule: enforce and format, or remove rule.
10. Add CI baseline.
11. Add security inspection document.
12. Add full test plan.

## Security Review Checklist

Before merging changes touching auth/orders/products:

- Does endpoint expose object IDs?
- Is queryset scoped by user/role?
- Is serializer exposing only allowed fields?
- Are server-calculated fields read-only?
- Are invalid values rejected?
- Are errors safe?
- Are secrets absent from logs?
- Is there a regression test?
- Is admin/staff behavior explicit?
- Are future payment assumptions avoided?

## Communication Rules

- Ambiguity → stop and ask.
- If forced, implement the smallest safe interpretation and log a PRD change request.
- Do not silently expand scope.
- Do not introduce provider-specific payment logic before approved payment PRD.
- Do not create custom admin before approved admin PRD.
- Prefer concise commits with conventional commit style.

## Commit Style

Use conventional commits:

```text
docs(specs): add initial PRD and agent rules
test(orders): cover cross-user order access
fix(products): reject negative prices
refactor(frontend): centralize api client
ci: add frontend build gate
```

## Done Means Professional

A change is not professional unless:
- it has a spec link or FR-ID;
- it has tests;
- it passes relevant gates;
- it improves or preserves security;
- it is understandable by the next developer;
- it does not hide technical debt.
