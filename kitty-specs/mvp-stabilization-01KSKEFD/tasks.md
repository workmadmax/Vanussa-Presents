# Tasks: MVP Stabilization

**Mission:** `mvp-stabilization-01KSKEFD`  
**Source:** `kitty-specs/mvp-stabilization-01KSKEFD/spec.md`  
**Plan:** `kitty-specs/mvp-stabilization-01KSKEFD/plan.md`  
**Planning/base branch:** `main`  
**Merge target:** `main`  
**Status:** Work packages generated; approved/merged and validated on 2026-05-29

## Summary

Finish the remaining stabilization work for the existing e-commerce MVP without
adding product scope. Completed manual SDD work is treated as baseline. The
remaining implementation is grouped into frontend API/auth, cart/menu, lint/build
gates and CI.

**Verification note:** Spec Kitty status/events indicate WP01-WP04 are approved
and the mission is merged. Missing code artifacts were reconciled from the
`kitty/mission-mvp-stabilization-01KSKEFD-lane-a` branch and validated via
Docker Compose on 2026-05-29.

## Subtask Index

| ID   | Description                                                                                            | WP   | Parallel |
| ---- | ------------------------------------------------------------------------------------------------------ | ---- | -------- | --- |
| T001 | Verify central API client base URL, token attachment and refresh behavior                              | WP01 | No       | [D] |
| T002 | Keep auth registration/login on the central API client with typed errors                               | WP01 | No       | [D] |
| T003 | Update auth/API tests to mock axios/client behavior without real network                               | WP01 | No       | [D] |
| T004 | Re-run frontend Jest for auth/API surfaces and record any remaining gate risk                          | WP01 | No       | [D] |
| T005 | Keep cart checkout submission on central API client with `/checkout/{id}` redirect                     | WP02 | No       | [D] |
| T006 | Consolidate cart menu hook ownership and remove duplicate/dead hook paths                              | WP02 | No       | [D] |
| T007 | Preserve cart/menu interactions: login prompt, checkout, close on navigation, Escape and outside click | WP02 | No       | [D] |
| T008 | Update cart/menu tests and keep network calls mocked                                                   | WP02 | No       | [D] |
| T009 | Resolve React Hooks `set-state-in-effect` findings outside WP01/WP02-owned files                       | WP03 | No       | [D] |
| T010 | Replace remaining `any` usage with narrow local types outside WP01/WP02-owned files                    | WP03 | No       | [D] |
| T011 | Resolve `curly`, internal Link/Image, and frontend config lint findings                                | WP03 | No       | [D] |
| T012 | Validate frontend Jest, lint and build through the intended Docker Compose path                        | WP03 | No       | [D] |
| T013 | Add CI workflow with PostgreSQL backend gates and frontend gates                                       | WP04 | No       | [D] |
| T014 | Keep CI credentials/secrets local to workflow service configuration                                    | WP04 | No       | [D] |
| T015 | Document any CI/local command divergence in workflow comments or mission notes                         | WP04 | No       | [D] |
| T016 | Treat or document known jsdom navigation console noise without masking real test errors                | WP04 | No       | [D] |
| T017 | Add dedicated `/products/[slug]` no-image regression coverage                                          | WP04 | No       | [D] |

## Work Packages

### WP01 - Auth/API Client Stabilization

**Prompt:** `tasks/WP01-auth-api-client-stabilization.md`  
**Priority:** P1  
Dependencies: None  
Requirement refs: FR-006, FR-010, FR-011, NFR-004  
**Independent test:** `docker compose exec frontend npm test -- --runInBand`

Goal: make the central frontend API client the reliable auth boundary. This WP
owns the API client, auth context and related tests only.

Included subtasks:

- [x] T001 Verify central API client base URL, token attachment and refresh behavior (WP01)
- [x] T002 Keep auth registration/login on the central API client with typed errors (WP01)
- [x] T003 Update auth/API tests to mock axios/client behavior without real network (WP01)
- [x] T004 Re-run frontend Jest for auth/API surfaces and record any remaining gate risk (WP01)

Implementation sketch:

- Inspect current preflight commit state before changing anything.
- Tighten types around auth responses and API error data without changing UX.
- Keep `NEXT_PUBLIC_API_URL` as the only environment boundary.
- Ensure tests prove no real localhost request is made.

Parallel opportunities: none; API interceptors and auth context share token
state and should be reviewed together.

Risks: token refresh regressions, auth state hydration behavior, hidden real
network calls in Jest.

### WP02 - Cart Checkout/Menu Consolidation

**Prompt:** `tasks/WP02-cart-checkout-menu-consolidation.md`  
**Priority:** P1  
Dependencies: WP01  
Requirement refs: FR-004, FR-005, FR-007, FR-008, FR-010, FR-011, NFR-004  
**Independent test:** `docker compose exec frontend npm test -- --runInBand`

Goal: finish cart/menu stabilization using the central API client and one
canonical cart-menu hook path.

Included subtasks:

- [x] T005 Keep cart checkout submission on central API client with `/checkout/{id}` redirect (WP02)
- [x] T006 Consolidate cart menu hook ownership and remove duplicate/dead hook paths (WP02)
- [x] T007 Preserve cart/menu interactions: login prompt, checkout, close on navigation, Escape and outside click (WP02)
- [x] T008 Update cart/menu tests and keep network calls mocked (WP02)

Implementation sketch:

- Treat the current API-client migration as partial baseline.
- Verify cart page and cart menu both submit the same order payload shape.
- Keep unauthenticated users in the login flow instead of creating orders.
- Fix lint issues in WP02-owned files when they are encountered.

Parallel opportunities: after WP01 lands, WP02 can run before WP03; WP03 must not
touch WP02-owned files.

Risks: duplicate hook imports, modal behavior regressions, checkout route drift.

### WP03 - Frontend Lint/Build Gates

**Prompt:** `tasks/WP03-frontend-lint-build-gates.md`  
**Priority:** P1  
Dependencies: WP01, WP02  
Requirement refs: FR-001, FR-002, FR-011, NFR-001, NFR-002, NFR-004  
**Independent test:** `docker compose exec frontend npm run lint && docker compose exec frontend npm run build`

Goal: clear the remaining frontend lint/build blockers without broad UI
refactors or product behavior changes.

Included subtasks:

- [x] T009 Resolve React Hooks `set-state-in-effect` findings outside WP01/WP02-owned files (WP03)
- [x] T010 Replace remaining `any` usage with narrow local types outside WP01/WP02-owned files (WP03)
- [x] T011 Resolve `curly`, internal Link/Image, and frontend config lint findings (WP03)
- [x] T012 Validate frontend Jest, lint and build through the intended Docker Compose path (WP03)

Implementation sketch:

- Use current lint output as the work queue.
- Prefer small local type definitions and minimal render-state changes.
- Use `next/link` and the existing Next image configuration where appropriate.
- Do not delete host `.next`; validate build through Docker Compose.

Parallel opportunities: none while WP01/WP02 are open, because lint work should
avoid overlapping owned files.

Risks: hydration changes, image rendering changes, accidental broad formatting.

### WP04 - CI Baseline

**Prompt:** `tasks/WP04-ci-baseline.md`  
**Priority:** P2  
Dependencies: WP03  
Requirement refs: FR-003, FR-009, FR-012, FR-013, NFR-003, NFR-004, NFR-005  
**Independent test:** review workflow syntax and run local equivalent commands.

Goal: add a baseline GitHub Actions workflow that mirrors the stable local gates
for backend and frontend.

Included subtasks:

- [x] T013 Add CI workflow with PostgreSQL backend gates and frontend gates (WP04)
- [x] T014 Keep CI credentials/secrets local to workflow service configuration (WP04)
- [x] T015 Document any CI/local command divergence in workflow comments or mission notes (WP04)
- [x] T016 Treat or document known jsdom navigation console noise without masking real test errors (WP04)
- [x] T017 Add dedicated `/products/[slug]` no-image regression coverage (WP04)

Implementation sketch:

- Add `.github/workflows/mvp-stabilization.yml`.
- Use an ephemeral PostgreSQL service for backend tests.
- Run backend check/tests and frontend lint/test/build.
- Keep credentials non-secret and CI-local.
- Keep jsdom console handling local to the affected menu test if it can be
  done safely; otherwise document it as known noise.
- Add a focused product detail test for an API product with no images, without
  changing product behavior.

Parallel opportunities: WP04 waits for WP03 so CI captures stable gates.

Risks: workflow drift from Compose, CI-only environment differences, noisy gate
failures if local lint/build are not green first, test mocks hiding real
navigation failures if applied too broadly.
