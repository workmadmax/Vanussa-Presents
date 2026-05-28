---
work_package_id: WP02
title: Cart Checkout/Menu Consolidation
dependencies:
- WP01
requirement_refs:
- FR-004
- FR-005
- FR-007
- FR-008
- FR-010
- FR-011
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
subtasks:
- T005
- T006
- T007
- T008
phase: Phase 2 - Cart/Menu
assignee: ''
agent: "codex"
shell_pid: "5054"
history:
- timestamp: '2026-05-27T00:53:50Z'
  agent: codex
  action: Prompt generated during manual SDD to Spec Kitty migration
authoritative_surface: frontend/src/components/layouts/supportMenu/cart/
execution_mode: code_change
owned_files:
- frontend/src/app/cart/page.tsx
- frontend/src/components/layouts/supportMenu/cart/**
- frontend/src/components/layouts/supportMenu/hooks/useCartMenu.ts
- frontend/src/services/__tests__/cartPage.test.tsx
- frontend/src/services/__tests__/cartMenu.test.tsx
- frontend/src/services/__tests__/cartMenuGuest.test.tsx
- frontend/src/services/__tests__/cartMenuLogged.test.tsx
tags: []
---

# Work Package Prompt: WP02 - Cart Checkout/Menu Consolidation

## Objective

Finish cart checkout and support-menu cart consolidation while preserving current
cart UX and `/checkout/{id}` redirect behavior.

## Context

The manual specs identified duplicate cart hooks and hardcoded cart checkout
calls. The preflight commit moved the cart menu order creation to the central
API client and deleted one duplicate hook path. This WP verifies and finishes
that work in the cart/menu-owned surface.

## Dependencies

Depends on WP01 because cart checkout uses the central API client and token
interceptors owned there.

## Owned Surface

Only edit files listed in frontmatter `owned_files`. Do not touch auth context,
API client internals, unrelated app pages, backend files or CI files.

## Detailed Guidance

### T005 - Checkout Submission

- Ensure cart page and cart menu submit the same payload shape:
  `{ items: [{ product_id, quantity }] }`.
- Preserve redirect to `/checkout/{id}` after successful order creation.
- Preserve cart clearing behavior where it already exists.
- Preserve login prompt behavior for unauthenticated users.

### T006 - Hook Consolidation

- Keep exactly one canonical cart menu hook import path.
- Remove dead imports or references to deleted duplicate hooks.
- Keep close-on-navigation and Escape behavior.
- Do not broaden this into a support menu redesign.

### T007 - Interaction Behavior

- Preserve outside-click close behavior.
- Preserve cart button/menu accessibility attributes already present.
- Preserve guest and logged-in dropdown behavior.
- Fix lint in WP02-owned files if encountered.

### T008 - Tests

- Keep cart page/menu tests mocking `api.post`.
- Assert checkout payload and `/checkout/{id}` route.
- Assert guests trigger login instead of order creation.
- Keep cart menu guest/logged tests green.

## Validation

Run at minimum:

```bash
docker compose exec frontend npm test -- --runInBand
```

If lint errors remain in WP02-owned files, fix them here. Lint errors outside
owned files belong to WP03.

## Branch Strategy

Planning artifacts were generated on `main`. Completed changes must merge back
into `main`. Spec Kitty will allocate execution worktrees per `lanes.json`.

## Definition of Done

- Cart checkout uses the central API client in WP02-owned code.
- Duplicate/dead cart hook path is gone.
- Cart/menu tests pass with no real network calls.
- No public route or product scope changes are introduced.

## Reviewer Guidance

Review for behavioral preservation and ownership discipline. Reject changes that
move auth-client internals into cart code or alter backend order contracts.

## Activity Log

- 2026-05-27T02:07:43Z – codex – shell_pid=5054 – Started implementation via action command
- 2026-05-27T02:13:46Z – codex – shell_pid=5054 – Ready for review: cart checkout/menu uses central API client, canonical cart menu hook behavior is covered, and WP02 tests pass
- 2026-05-28T02:09:57Z – codex – shell_pid=5054 – Review passed: WP02 accepted after review; cart checkout/menu consolidation met acceptance criteria with central API client usage, canonical cart menu hook behavior, and passing WP02 tests.
