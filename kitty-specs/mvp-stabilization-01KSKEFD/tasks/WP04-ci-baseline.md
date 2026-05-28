---
work_package_id: WP04
title: CI Baseline
dependencies:
- WP03
requirement_refs:
- FR-003
- FR-009
- FR-012
- FR-013
- NFR-003
- NFR-004
- NFR-005
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
subtasks:
- T013
- T014
- T015
phase: Phase 4 - CI
assignee: ''
agent: "codex"
shell_pid: "7358"
history:
- timestamp: '2026-05-27T00:53:50Z'
  agent: codex
  action: Prompt generated during manual SDD to Spec Kitty migration
authoritative_surface: .github/workflows/
execution_mode: code_change
owned_files:
- .github/workflows/mvp-stabilization.yml
tags: []
---

# Work Package Prompt: WP04 - CI Baseline

## Objective

Add a baseline GitHub Actions workflow that runs the stabilized backend and
frontend gates. This WP introduces CI only after WP03 has made local frontend
gates stable.

## Context

There is currently no `.github/` directory. Manual specs require automated gates
for backend check/tests and frontend lint/test/build. Backend tests require
PostgreSQL; frontend tests must not hit real localhost services.

## Dependencies

Depends on WP03. CI should encode stable gates, not known failing local lint or
build commands.

## Owned Surface

Only create/edit `.github/workflows/mvp-stabilization.yml`. Do not modify source
code, package files, backend settings or mission docs in this WP unless a later
review explicitly asks for a follow-up.

## Detailed Guidance

### T013 - Workflow

- Create a workflow that runs on pull requests and pushes to `main`.
- Backend job should provide a PostgreSQL service with local CI credentials.
- Run backend install/setup, `python manage.py check`, and tests.
- Frontend job should run `npm ci`, `npm run lint`, `npm test -- --runInBand`,
  and `npm run build`.

### T014 - Secrets and Credentials

- Do not use real secrets.
- Use ephemeral CI-only database credentials.
- Keep any `SECRET_KEY` value local to CI and non-production.
- Avoid logging tokens or sensitive values.

### T015 - Divergence Notes

- If CI cannot exactly mirror Docker Compose, prefer comments in the workflow
  explaining the difference.
- Keep the local command matrix in Spec Kitty quickstart as the operational
  source for developers.

## Validation

Run local equivalent commands where possible:

```bash
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose exec frontend npm run lint
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
```

If GitHub Actions cannot be executed locally, validate YAML structure by review
and document that remote CI execution remains pending.

## Branch Strategy

Planning artifacts were generated on `main`. Completed changes must merge back
into `main`. Spec Kitty will allocate execution worktrees per `lanes.json`.

## Definition of Done

- `.github/workflows/mvp-stabilization.yml` exists.
- Workflow uses PostgreSQL for backend tests.
- Workflow includes frontend lint/test/build gates.
- No production secrets are committed.

## Reviewer Guidance

Review command parity, environment variables, service health checks and whether
the workflow depends on local-only paths or hidden state.

## Activity Log

- 2026-05-28T02:52:48Z – codex – shell_pid=7358 – Started implementation via action command
