# Quickstart: MVP Stabilization Validation

Use Docker Compose for official validation. Host-only commands are useful for
inspection but are not the acceptance surface for this mission.

## Start Services

```bash
docker compose up -d --build
```

## Backend Gates

```bash
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
```

Expected target: both commands pass. Existing docs record the full backend suite
passing in Compose with 102 tests.

## Frontend Gates

```bash
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

Current validation status (2026-05-29):

- `docker compose exec frontend npm test -- --runInBand`: PASS, 12 suites / 67
  tests.
- `docker compose exec frontend npm run lint`: PASS.
- `docker compose exec frontend npm run build`: PASS.

## Mission Validation

```bash
spec-kitty agent mission finalize-tasks --validate-only --mission mvp-stabilization-01KSKEFD --json
spec-kitty agent mission finalize-tasks --mission mvp-stabilization-01KSKEFD --json
```

After finalization, implementation must start only when authorized:

```bash
spec-kitty next --agent codex --mission mvp-stabilization-01KSKEFD
```
