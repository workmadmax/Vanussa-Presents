# Tasks: MVP Stabilization

**Status:** Ready for implementation planning
**Source of truth:** `specs/PRD.md`
**Last updated:** 2026-05-26

Tasks must be implemented in order unless a new decision record changes the sequence.

## T-001: Backend Test Database Baseline

**Related FR-ID:** FR-012
**Objective:** Make backend tests reproducible with PostgreSQL.
**Current behavior:** Tests are discovered from `backend/` but fail while creating or connecting to the PostgreSQL test database.
**Expected behavior:** A documented local command starts PostgreSQL and runs all backend tests.
**Design notes:** Add Docker Compose with service `postgres`, database/user/password `site`, and host port `5432`; keep production settings environment-driven.
**Tests first:** No product behavior test required; verify with `manage.py check` and full backend test command.
**Files likely changed:** Docker Compose file, backend env docs, spec docs if command changes.
**Definition of Done:** Backend test command is documented, tests are discovered, database setup is deterministic.
**Rollback notes:** Remove Docker Compose/env docs and restore previous test instructions.
**Security considerations:** Do not commit real secrets; use local-only credentials.

## T-002: ESLint Allman Rule Removal

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Remove the high-noise Allman `brace-style` rule.
**Current behavior:** `npm run lint` reports hundreds of style errors dominated by Allman braces.
**Expected behavior:** Lint focuses on meaningful Next.js, React and TypeScript issues.
**Design notes:** Remove only the Allman `brace-style` override; keep `curly`, semicolons and Next.js configs unless a concrete conflict appears.
**Tests first:** Run `npm run lint` before and after to capture remaining actionable errors.
**Files likely changed:** `frontend/eslint.config.mjs`.
**Definition of Done:** Allman errors are gone and remaining lint failures are documented or fixed in later tasks.
**Rollback notes:** Restore the removed rule if the team explicitly recommits to Allman style.
**Security considerations:** None directly.

## T-003: Next.js Build Suspense Fix

**Related FR-ID:** FR-011
**Objective:** Make `npm run build` pass by resolving `useSearchParams()` prerender issues.
**Current behavior:** Build fails because `useSearchParams()` is used without an appropriate boundary.
**Expected behavior:** Production build completes successfully.
**Design notes:** Remove unnecessary `useSearchParams()` from menu-close hooks where pathname is sufficient; isolate any real query-param UI behind a client component with `Suspense` or server-provided `searchParams`.
**Tests first:** Add or update regression coverage for affected menu/page behavior where practical, then run build.
**Files likely changed:** Home page, support menu hooks/components, related tests.
**Definition of Done:** `npm run build` passes and affected UI still closes menus on navigation.
**Rollback notes:** Revert changed components/hooks and restore prior build failure state if needed.
**Security considerations:** Avoid exposing query data in logs.

## T-004: Checkout Test Alignment

**Related FR-ID:** FR-005
**Objective:** Align frontend checkout tests with the actual `/checkout/{id}` route.
**Current behavior:** A cart test expects `/checkout`, while implementation navigates to `/checkout/{id}` and may attempt a real localhost request.
**Expected behavior:** Test mocks order creation and expects redirect to `/checkout/{id}`.
**Design notes:** Mock the central API client or request layer; do not depend on a running backend in Jest.
**Tests first:** Update the failing test to assert the intended checkout route and API payload.
**Files likely changed:** `frontend/src/services/__tests__/cartPage.test.tsx`, possibly API mocks.
**Definition of Done:** `npm test -- --runInBand` passes with no real network request.
**Rollback notes:** Restore old test only if product UX changes back to route without ID.
**Security considerations:** Ensure tests do not leak tokens or depend on real local credentials.

## T-005: Product Price Validation

**Related FR-ID:** FR-003
**Objective:** Reject invalid product prices.
**Current behavior:** `Product.price` accepts negative values.
**Expected behavior:** Sellable products require price greater than zero.
**Design notes:** Enforce at model/serializer/admin boundary and add a database constraint where safe.
**Tests first:** Add failing tests for negative and zero sellable product prices.
**Files likely changed:** Product model, migration, serializers/admin if needed, product tests.
**Definition of Done:** Invalid prices fail with clear errors and tests pass.
**Rollback notes:** Revert model/migration/test changes together.
**Security considerations:** Prevent negative totals or catalog manipulation.

## T-006: Order Quantity and Total Invariants

**Related FR-ID:** FR-005, FR-007
**Objective:** Make order creation safe and atomic.
**Current behavior:** Quantity is not explicitly validated and order creation uses manual cleanup on failure.
**Expected behavior:** Quantity must be positive, totals are server-calculated and failures do not leave partial orders or inconsistent stock.
**Design notes:** Move validation into service/domain helpers where practical; wrap DB writes in `transaction.atomic()`.
**Tests first:** Add failing tests for zero quantity, negative quantity, partial failure and total calculation.
**Files likely changed:** Order service, models or serializers, migrations if constraints are added, order tests.
**Definition of Done:** Tests cover invalid quantities, stock behavior and server-side totals.
**Rollback notes:** Revert service and validation changes with their tests.
**Security considerations:** Prevent stock inflation, negative totals and client-controlled pricing.

## T-007: Central Frontend API Client

**Related FR-ID:** FR-010
**Objective:** Remove hardcoded API calls from feature code.
**Current behavior:** Some auth and cart flows call `http://127.0.0.1:8000` directly.
**Expected behavior:** API calls go through a central configurable client.
**Design notes:** Keep base URL in one config/client boundary; normalize auth errors consistently.
**Tests first:** Add or update tests for login, register, checkout and token refresh with mocked API calls.
**Files likely changed:** `frontend/src/services/api.ts`, auth context, cart menu, related tests.
**Definition of Done:** Search finds no hardcoded API host outside allowed config/test fixtures.
**Rollback notes:** Revert service/client changes and associated tests.
**Security considerations:** Centralize token handling and avoid accidental calls to the wrong environment.

## T-008: Duplicate Cart Hook Consolidation

**Related FR-ID:** FR-004, JTBD-004
**Objective:** Remove duplicated cart/support menu hook implementations.
**Current behavior:** Multiple `useCartMenu` files overlap and increase maintenance risk.
**Expected behavior:** One hook owns cart menu open/close behavior.
**Design notes:** Keep the implementation used by current components, remove dead duplicate imports, and preserve keyboard/outside-click behavior.
**Tests first:** Ensure existing menu behavior tests fail if the hook contract changes incorrectly.
**Files likely changed:** Support menu hooks/components and related tests.
**Definition of Done:** Only one cart menu hook remains and tests pass.
**Rollback notes:** Restore removed hook only if a real separate responsibility is identified.
**Security considerations:** None directly.

## T-009: CI Baseline

**Related FR-ID:** JTBD-004
**Objective:** Add automated gates for MVP stabilization.
**Current behavior:** Gates are manual and inconsistent.
**Expected behavior:** CI runs backend check/tests and frontend lint/test/build.
**Design notes:** Use PostgreSQL service in CI; mirror local commands from `TEST_PLAN.md`.
**Tests first:** Validate workflow command syntax locally where possible.
**Files likely changed:** CI workflow files and docs.
**Definition of Done:** CI runs all baseline gates on pull requests or main branch updates.
**Rollback notes:** Disable or revert CI workflow if it blocks due to infrastructure, keeping documented local gates.
**Security considerations:** Do not expose secrets in logs; use ephemeral CI database credentials.

## LINT-001: React Hooks State-in-Effect Cleanup

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Resolve `react-hooks/set-state-in-effect` errors without changing UI behavior.
**Current behavior:** `docker compose exec frontend npm run lint` reports synchronous state updates inside effects across cart, home, header, auth, cart context and support menu hooks.
**Expected behavior:** Components initialize state or synchronize external systems in a way accepted by the React Hooks lint rules.
**Design notes:** Treat each component/hook as a focused change; avoid broad UI refactors.
**Tests first:** Use existing component/hook tests and add regression tests when initialization behavior changes.
**Definition of Done:** No `react-hooks/set-state-in-effect` errors remain.
**Rollback notes:** Revert individual component/hook changes if hydration or interaction behavior regresses.
**Security considerations:** Preserve auth/logout behavior and avoid exposing stored tokens.

## LINT-002: TypeScript Any Cleanup

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Replace remaining `any` usage with narrow local types.
**Current behavior:** Lint still reports `@typescript-eslint/no-explicit-any` in cart, product detail and profile flows.
**Expected behavior:** Error responses and API payloads use explicit types.
**Design notes:** Prefer small local response/error types near the consuming code unless a shared type already exists.
**Tests first:** Keep existing Jest coverage green for affected screens.
**Definition of Done:** No `no-explicit-any` errors remain.
**Rollback notes:** Revert per file if typing changes alter runtime behavior.
**Security considerations:** Avoid hiding auth/API errors behind overly broad types.

## LINT-003: Next.js Link and Image Compliance

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Resolve Next.js lint issues for internal navigation and images.
**Current behavior:** Lint reports raw `<a>` for internal navigation and raw `<img>` usage.
**Expected behavior:** Internal routes use `next/link`; product images use an approved image strategy.
**Design notes:** Confirm image domain/config requirements before replacing `<img>` with `next/image`.
**Tests first:** Run existing card/page tests and build after each conversion.
**Definition of Done:** No `@next/next/no-html-link-for-pages` or `@next/next/no-img-element` findings remain.
**Rollback notes:** Revert per component if rendering or remote image loading breaks.
**Security considerations:** Keep image sources constrained by Next config before production.

## LINT-004: Curly Rule Cleanup

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Add braces to remaining single-line conditionals required by `curly`.
**Current behavior:** Lint reports missing braces in cart, orders and profile flows.
**Expected behavior:** All conditionals satisfy the configured `curly` rule.
**Design notes:** This is mechanical but should be staged separately to keep review clean.
**Tests first:** Existing frontend tests are sufficient.
**Definition of Done:** No `curly` errors remain.
**Rollback notes:** Revert mechanical brace changes if accidental behavior changes are introduced.
**Security considerations:** None directly.

## LINT-005: Frontend Config Warnings

**Related FR-ID:** FR-011, JTBD-004
**Objective:** Resolve non-blocking frontend config warnings.
**Current behavior:** Lint warns about unused `NextConfig` and anonymous default export in Prettier config.
**Expected behavior:** Config files are lint-clean without changing runtime behavior.
**Design notes:** Keep config behavior identical.
**Tests first:** Run lint and build.
**Definition of Done:** No config warnings remain.
**Rollback notes:** Revert config-only changes if build behavior changes.
**Security considerations:** None directly.
