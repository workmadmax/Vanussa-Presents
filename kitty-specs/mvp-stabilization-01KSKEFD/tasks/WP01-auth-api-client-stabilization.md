---
work_package_id: WP01
title: Auth/API Client Stabilization
dependencies: []
requirement_refs:
- FR-006
- FR-010
- FR-011
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-mvp-stabilization-01KSKEFD
base_commit: 0704ac79a5bda901900d180aff5d9723f9af68e5
created_at: '2026-05-27T01:23:05.570577+00:00'
subtasks:
- T001
- T002
- T003
- T004
phase: Phase 1 - Frontend API/Auth
assignee: ''
agent: "codex"
shell_pid: "5054"
history:
- timestamp: '2026-05-27T00:53:50Z'
  agent: codex
  action: Prompt generated during manual SDD to Spec Kitty migration
authoritative_surface: frontend/src/services/
execution_mode: code_change
owned_files:
- frontend/src/services/api.ts
- frontend/src/services/auth.ts
- frontend/src/context/authContext.tsx
- frontend/src/services/__tests__/api.test.ts
- frontend/src/services/__tests__/authContext.test.tsx
- frontend/src/services/__tests__/loginModal.test.tsx
- frontend/src/services/__tests__/registerModal.test.tsx
tags: []
---

# Work Package Prompt: WP01 - Auth/API Client Stabilization

## Objective

Make the frontend central API client the reliable boundary for auth-related
requests, token attachment and refresh behavior. Preserve current UX and public
routes.

## Context

The manual specs originally reported hardcoded `fetch` calls for auth. The
preflight commit moved registration/login to `api.post` and added typed local
error handling. This WP should verify and finish that surface, not restart it.

Relevant source of truth:

- `kitty-specs/mvp-stabilization-01KSKEFD/spec.md`
- `kitty-specs/mvp-stabilization-01KSKEFD/plan.md`
- `specs/PRD.md`
- `specs/SECURITY_REVIEW.md`

## Owned Surface

Only edit files listed in frontmatter `owned_files`. Do not touch cart/menu
files, lint-only app files, backend files or CI files in this WP.

## Detailed Guidance

### T001 - API Client Behavior

- Verify `API_BASE_URL` remains configurable through `NEXT_PUBLIC_API_URL`.
- Keep the fallback base URL only inside the API client/config boundary.
- Ensure request interceptor attaches the access token when present.
- Ensure response interceptor retries one supported 401 with refresh token and
  clears auth storage on unrecoverable auth failures.
- Do not log tokens.

### T002 - Auth Context Behavior

- Keep registration and login routed through the central `api` client.
- Use narrow local response/error types; do not use `any`.
- Preserve localStorage keys: `token`, `refresh_token`, `user`.
- Preserve `registerUser`, `loginUser`, `logout`, `isAuthenticated`, and
  `isLoading` public context behavior.

### T003 - Tests

- Keep tests mocking the API/client layer, not a real backend.
- Cover successful login, failed login, registration, logout and refresh helper
  behavior where practical.
- If modal tests depend on auth behavior, update only the WP-owned modal tests.

### T004 - Validation

Run at minimum:

```bash
docker compose exec frontend npm test -- --runInBand
```

If Docker Compose is unavailable, run the equivalent host command and document
that it was host-only.

## Branch Strategy

Planning artifacts were generated on `main`. Completed changes must merge back
into `main`. Spec Kitty will allocate execution worktrees per `lanes.json`.

## Definition of Done

- No hardcoded API host exists in WP-owned feature code outside the API client.
- Auth/API tests pass and do not perform real network calls.
- Token handling remains centralized.
- Any remaining lint/build failure outside owned files is documented for WP03.

## Reviewer Guidance

Focus review on token safety, refresh retry loops, auth storage clearing, and
network mocking. Reject broad UI refactors or backend changes in this WP.

## Activity Log

- 2026-05-27T01:23:08Z – codex – shell_pid=5054 – Assigned agent via action command
