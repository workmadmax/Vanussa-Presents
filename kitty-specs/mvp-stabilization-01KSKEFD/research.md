# Research: MVP Stabilization

## Decision: Continue With Docker Compose As Validation Surface

**Rationale:** Manual SDD docs and current project state agree that PostgreSQL is
the target database family and that host backend tests are unreliable without a
running PostgreSQL service. Compose already provides `db`, `backend`, and
`frontend` services.

**Alternatives considered:** Host-only tests were rejected because they discover
0 tests from the repo root and fail PostgreSQL setup from `backend/` without the
service. SQLite tests were rejected because the PRD sets PostgreSQL as the
production-aligned database.

## Decision: Keep Public API Routes Stable

**Rationale:** The stabilization cycle is not a product expansion. Existing
frontend flows and backend tests already cover the current route surface.

**Alternatives considered:** Route redesign or OpenAPI-first rework is deferred
to a future mission because it would expand scope and risk breaking the MVP.

## Decision: Treat Completed Manual Tasks As Baseline

**Rationale:** Current code includes product price validation, order invariants,
transactional order creation, category pagination tests, checkout route tests,
Allman lint removal, and partial API-client centralization. Reimplementing those
items would waste work and risk regressions.

**Alternatives considered:** Restarting from the original manual task list was
rejected because it conflicts with the real repository state.

## Decision: Complete Frontend Stabilization Before CI

**Rationale:** `npm run lint` still fails. CI should be introduced after local
frontend gates are understood so the workflow is a useful guard instead of a
noisy blocker.

**Alternatives considered:** Adding CI first was rejected because it would encode
known failing gates before the cleanup WPs clarify intended behavior.

## Decision: Record Missing Charter As Non-Blocking Governance Gap

**Rationale:** Spec Kitty is initialized, but no charter file exists. The user
asked for migration to mission artifacts, not a governance interview.

**Alternatives considered:** Blocking the migration on charter generation was
rejected because the manual `/specs/` doctrine already provides enough local
rules for this stabilization mission.
