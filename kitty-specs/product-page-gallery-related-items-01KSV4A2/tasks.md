# Tasks: Product Page Gallery And Related Items

**Mission:** `product-page-gallery-related-items-01KSV4A2`
**Source:** `kitty-specs/product-page-gallery-related-items-01KSV4A2/spec.md`
**Plan:** `kitty-specs/product-page-gallery-related-items-01KSV4A2/plan.md`
**Planning/base branch:** `main`
**Merge target:** `main`

## Subtask Index

| ID   | Description                                                     | WP   | Parallel |
| ---- | --------------------------------------------------------------- | ---- | -------- |
| T001 | Fill mission specification, plan and supporting artifacts        | WP01 | No       | [D] |
| T002 | Add API contract, data model and quickstart documents            | WP01 | No       | [D] |
| T003 | Add work package prompts for implementation and review           | WP01 | No       | [D] |
| T004 | Add related-products endpoint tests                              | WP02 | No       |
| T005 | Add public related-products route and view                       | WP02 | No       |
| T006 | Implement same-category priority, fallback fill and active rules | WP02 | No       |
| T007 | Align frontend product image types with API fields               | WP03 | No       |
| T008 | Add product gallery and thumbnail switching                      | WP03 | No       |
| T009 | Fetch and render related products in a responsive grid           | WP03 | No       |
| T010 | Add frontend regression tests and run validation gates           | WP03 | No       |

## Work Packages

## WP01 - Mission Artifacts And API Contract

**Prompt:** `tasks/WP01-mission-artifacts-api-contract.md`
**Priority:** P1
Dependencies: None
Requirement refs: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010
**Independent test:** artifact review and `spec-kitty agent mission finalize-tasks --validate-only --mission product-page-gallery-related-items-01KSV4A2 --json`

- [x] Fill `spec.md` with MVP scope and acceptance criteria.
- [x] Replace the placeholder `plan.md`.
- [x] Add `research.md`, `data-model.md`, `contracts/rest-api.md`, and
  `quickstart.md`.
- [x] Add work package prompts.

## WP02 - Backend Related Products Endpoint

**Prompt:** `tasks/WP02-backend-related-products-endpoint.md`
**Priority:** P1
Dependencies: WP01
Requirement refs: FR-004, FR-005, FR-006, FR-007, FR-008
**Independent test:** `docker compose exec backend python manage.py test apps.products`

- [ ] Add tests for the related endpoint behavior.
- [ ] Add a public `GET /api/products/<slug>/related/` route.
- [ ] Implement related queryset selection with same-category priority,
  active-only filtering, fallback fill, exclusion, and limit of 4.

## WP03 - Frontend Gallery And Related Grid

**Prompt:** `tasks/WP03-frontend-gallery-related-grid.md`
**Priority:** P1
Dependencies: WP01, WP02
Requirement refs: FR-001, FR-002, FR-003, FR-009, FR-010
**Independent test:** `docker compose exec frontend npm test -- --runInBand`

- [ ] Align frontend product image types with API fields.
- [ ] Add selected-image gallery behavior to `/products/[slug]`.
- [ ] Fetch and render related products in a responsive grid.
- [ ] Keep product detail rendering when related loading fails.
- [ ] Add frontend regression tests for gallery and related behavior.

## Validation

- [ ] `docker compose exec backend python manage.py check`
- [ ] `docker compose exec backend python manage.py test`
- [ ] `docker compose exec frontend npm test -- --runInBand`
- [ ] `docker compose exec frontend npm run lint`
- [ ] `docker compose exec frontend npm run build`
