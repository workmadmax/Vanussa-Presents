# Security Review: MVP Stabilization Baseline

**Status:** Baseline review
**Source of truth:** `specs/PRD.md`
**Last updated:** 2026-05-26

## Scope

This review covers the existing MVP surface:

- Product catalog and product detail.
- Registration, login, token refresh and profile.
- Cart-to-order checkout simulation.
- My orders and order detail.
- Django Admin for MVP operations.
- Frontend API access and token handling.

Payment, shipping, webhooks, custom admin and production deployment are out of scope until the PRD is updated.

## Security Posture

The highest-risk areas are order authorization, invalid monetary/quantity inputs and token/API handling on the frontend.

Current positives:

- Order list and order detail queries filter by `request.user`.
- Order detail returns not found for another user's order.
- Order creation uses server-side product prices.
- Profile reads from `request.user`.
- CORS is currently limited to local frontend origins.

Current gaps:

- Product price can be negative.
- Order item quantity can be zero or negative unless explicitly validated.
- Order creation is not explicitly transactional.
- Some frontend calls bypass the central API client and use hardcoded localhost URLs.
- Jest currently allows at least one checkout path to attempt a real localhost request.
- JWT tokens are stored in `localStorage`, which is acceptable only as an MVP tradeoff and must not be treated as final production hardening.
- Production settings for secrets, debug, allowed hosts and secure headers need a dedicated deploy/security task before launch.

## Required Controls

Authentication:

- Auth-required endpoints must use DRF permissions.
- Tokens must never be logged.
- Refresh behavior must be centralized in the API client.
- Auth tests must cover invalid credentials and missing credentials.

Authorization:

- User-owned querysets must filter by `request.user`.
- Order detail must never expose another user's order.
- Any future endpoint accepting IDs must include BOLA review before implementation.
- Admin/operator behavior must be explicit before custom admin features are added.

Input validation:

- Product price must be greater than zero for sellable products.
- Order item quantity must be greater than zero.
- Order creation must reject inactive products.
- Order creation must reject insufficient stock.
- Server-calculated fields such as order total and item price snapshots must not be trusted from client input.

Configuration:

- API base URL must come from environment/config, not feature code.
- CORS must be environment-specific before production.
- `DEBUG` must be false in production.
- `SECRET_KEY` and database credentials must come from environment variables.

Frontend:

- Internal navigation should use Next.js routing primitives where applicable.
- API errors should be normalized before display.
- Tests must mock network calls and avoid real localhost traffic.

## Security Acceptance Criteria

- Cross-user order access has a regression test.
- Product price and order quantity validation have regression tests.
- No hardcoded API host remains outside the approved API client/config file.
- Order creation is atomic enough to avoid partial orders or stock inconsistencies on failure.
- CI runs the relevant security-sensitive tests before merge.

## Open Risks

- `localStorage` token storage increases exposure to XSS impact. This is accepted for MVP stabilization but must be revisited before production hardening.
- No rate limiting is currently specified for auth endpoints. Add a future PRD/task before public launch.
- Production media storage and secure file handling are not specified. Keep local media only for development/staging until deploy scope is approved.
