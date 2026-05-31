# Implementation Plan: Product Page Gallery And Related Items

**Mission:** `product-page-gallery-related-items-01KSV4A2`
**Branch:** `kitty/mission-product-page-gallery-related-items-01KSV4A2`
**Planning/base branch:** `main`
**Merge target:** `main`
**Spec:** `kitty-specs/product-page-gallery-related-items-01KSV4A2/spec.md`

## Summary

Add a compact product detail gallery and category-based related products to the
existing Django REST + Next.js e-commerce MVP. The backend will provide a public
related-products list endpoint, and the frontend will render a responsive grid
below the product detail without introducing recommendation infrastructure.

## Technical Context

**Languages/Versions:** Python 3.12.3, Django 6.0.4, DRF 3.17.1, Node 20.20.2,
Next.js 16.2.4, React 19.2.5, TypeScript 5.x, Tailwind CSS 4.

**Primary Dependencies:** Django REST Framework generic views, existing
`ProductSerializer`, Axios API client, `next/image`, existing cart context and
product card components.

**Storage:** Existing PostgreSQL-backed `Product`, `Category`, and
`ProductImage` tables. No schema migration is required.

**Testing:** Django `TestCase`/DRF `APIClient` for backend behavior; Jest and
Testing Library for frontend product-page interactions.

**Constraints:** Preserve existing routes, keep related reads public, hide empty
related sections, and keep related-load failures non-blocking.

## Project Structure

```text
backend/apps/products/
  models.py
  serializers.py
  urls.py
  views.py
  tests.py
frontend/src/app/products/[slug]/
  page.tsx
  __tests__/page.test.tsx
frontend/src/types/
  index.ts
kitty-specs/product-page-gallery-related-items-01KSV4A2/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/rest-api.md
  tasks.md
  tasks/
```

## Implementation Strategy

- Implement related products as a `ListAPIView` that resolves the current active
  product by slug, then returns up to 4 active products.
- Prioritize same-category products, exclude the current product, and fill
  remaining slots with recent active products from other categories.
- Keep the frontend gallery local to the product detail page: selected main
  image state plus thumbnail buttons.
- Fetch related products through the central `api` client after loading the
  product detail; log failures and render the product page normally.
- Reuse `ProductCard` for the related grid to match the existing catalog
  presentation.

## Public Interfaces

Add one public endpoint:

```text
GET /api/products/<slug>/related/
```

Response: unpaginated JSON array of serialized products, using the existing
`ProductSerializer` shape. Existing routes remain unchanged.

## Work Packages

1. **WP01 - Mission artifacts and API contract:** finalize spec, plan, contract,
   data model, quickstart, task outline, and work package prompts.
2. **WP02 - Backend related products endpoint:** add the DRF view, route, and
   regression tests for ranking/fallback/error behavior.
3. **WP03 - Frontend gallery and related grid:** update types, product page UI,
   related fetch behavior, and product-page tests.

## Acceptance Gates

- `docker compose exec backend python manage.py check`
- `docker compose exec backend python manage.py test`
- `docker compose exec frontend npm test -- --runInBand`
- `docker compose exec frontend npm run lint`
- `docker compose exec frontend npm run build`
