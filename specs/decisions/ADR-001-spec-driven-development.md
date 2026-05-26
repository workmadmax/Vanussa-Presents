# ADR-001: Adopt Spec-Driven Development

**Date:** 2026-05-26
**Status:** Accepted
**Decision owner:** Douglas
**Related spec:** `specs/PRD.md`

## Context

The repository already contains a functional e-commerce MVP, but the current state has known build, lint, test and domain validation gaps. Adding new features before stabilizing the base would increase regression risk, especially around checkout, order ownership and future payment work.

The project needs a repeatable process that keeps product intent, implementation tasks, tests and security review aligned.

## Decision

Use Spec-Driven Development for this project.

The required flow is:

```text
Specify -> Plan -> Tasks -> Implement
```

Rules:

- `specs/PRD.md` is the source of truth for product scope.
- Any behavior change outside the current PRD must update the PRD first.
- Implementation must not start until an implementation plan and tasks exist.
- Tasks must be small, reversible, testable and linked to PRD requirements.
- TDD is required for implementation tasks: write or update the failing test first, implement the smallest change, then refactor with tests green.
- Security review is required for auth, orders, products, permissions, payment-adjacent work and user-owned data.

## Consequences

Positive:

- Future work has explicit scope and acceptance criteria.
- Agents and humans can resume work from versioned documentation.
- Payment, shipping and admin expansion stay blocked until intentionally specified.
- Security-sensitive changes receive review before implementation.

Tradeoffs:

- Documentation must be maintained with code.
- Small changes may require a short task record before implementation.
- The first stabilization cycle spends time on process and gates before feature work.

## Defaults Chosen

- Stabilize the MVP before new features.
- Use PostgreSQL via Docker Compose for backend tests.
- Remove the Allman `brace-style` lint rule and keep standard Next.js/TypeScript linting.
- Preserve current public REST routes during MVP stabilization.
