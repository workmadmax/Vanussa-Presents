---
work_package_id: WP03
title: Frontend Lint/Build Gates
dependencies:
- WP01
- WP02
requirement_refs:
- FR-001
- FR-002
- FR-011
- NFR-001
- NFR-002
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
subtasks:
- T009
- T010
- T011
- T012
phase: Phase 3 - Frontend Gates
assignee: ''
agent: "codex"
shell_pid: "7358"
history:
- timestamp: '2026-05-27T00:53:50Z'
  agent: codex
  action: Prompt generated during manual SDD to Spec Kitty migration
authoritative_surface: frontend/src/app/
execution_mode: code_change
owned_files:
- frontend/src/app/homeClient.tsx
- frontend/src/app/orders/page.tsx
- frontend/src/app/products/**/page.tsx
- frontend/src/app/profile/page.tsx
- frontend/src/components/layouts/header/header.tsx
- frontend/src/components/layouts/supportMenu/contact/useMenuControl.tsx
- frontend/src/components/layouts/supportMenu/hooks/useSupportMenu.ts
- frontend/src/context/cartContext.tsx
- frontend/src/components/cards/productCard.tsx
- frontend/src/components/cards/cartItens.tsx
- frontend/next.config.ts
- frontend/prettier.config.mjs
tags: []
---

# Work Package Prompt: WP03 - Frontend Lint/Build Gates

## Objective

Clear the remaining frontend lint/build blockers in the files owned by this WP,
without broad UI refactors or product behavior changes.

## Context

Current host lint output reports React Hooks `set-state-in-effect`, `curly`,
`no-explicit-any`, Next internal Link/Image issues, and config warnings. WP01
and WP02 own auth/API and cart/menu files, so this WP must avoid those files.

Host `npm run build` is blocked by `EACCES` on `frontend/.next/build/package.json`
owned by `nobody:nogroup`. Do not delete or chmod `.next` unless the user
explicitly authorizes it. Prefer Docker Compose validation.

## Dependencies

Depends on WP01 and WP02 so lint cleanup does not overlap their owned files.

## Owned Surface

Only edit files listed in frontmatter `owned_files`. If lint reports errors in
WP01/WP02-owned files, document them instead of changing them.

## Detailed Guidance

### T009 - React Hooks Lint

- Resolve synchronous state updates in effects by using lazy initial state,
  derived state, event-driven updates, or other minimal React patterns.
- Preserve hydration safety and current UI behavior.
- Do not add global state or new dependencies.

### T010 - TypeScript Types

- Replace `any` with narrow local response/error/data types.
- Prefer existing shared types in `frontend/src/types` when they fit.
- Avoid type assertions that hide unknown API shapes.

### T011 - Curly, Link/Image and Config Findings

- Add braces for `curly` rule violations.
- Replace internal raw anchors with `next/link` where behavior is internal
  navigation.
- Replace raw product images with the approved Next image strategy only where
  config already permits the source.
- Remove unused `NextConfig` import/type mismatch and anonymous default export
  warning without changing runtime config.

### T012 - Validation

Run intended frontend gates through Docker Compose:

```bash
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

If Compose is unavailable, run host equivalents and clearly document host-only
limitations.

## Branch Strategy

Planning artifacts were generated on `main`. Completed changes must merge back
into `main`. Spec Kitty will allocate execution worktrees per `lanes.json`.

## Definition of Done

- No lint errors remain in WP03-owned files.
- Frontend Jest, lint and build are green through the accepted validation path,
  or any external environment blocker is documented with exact command output.
- Product behavior and public routes remain unchanged.

## Reviewer Guidance

Review for minimality. Reject broad component rewrites, visual redesigns,
dependency additions, or `.next` cleanup that was not explicitly authorized.

## Activity Log

- 2026-05-28T02:16:46Z – codex – shell_pid=7358 – Started implementation via action command
- 2026-05-28T02:28:41Z – codex – shell_pid=7358 – Implementation complete: frontend lint, Jest, and build passed via Docker Compose run in the WP03 worktree; host build required elevated sandbox permissions for Turbopack.
