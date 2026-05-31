# Product Page Gallery And Related Items Specification

**Mission:** `product-page-gallery-related-items-01KSV4A2`
**Mission type:** `software-dev`
**Target branch:** `main`
**Planning/base branch:** `main`
**Merge target:** `main`

## Summary

Improve the existing product detail experience with a real image gallery and a
small related-products section. The feature must reuse the current Django REST
Framework products app, the existing `Product`/`ProductImage` data model, and
the current Next.js product detail route.

This mission is an MVP catalog/UX feature. It does not introduce tags, manual
recommendation management, CMS integrations, analytics tracking, SEO/SSR
rewrites, or a recommendation algorithm.

## Users

- **Visitor:** views product details, inspects available images, and discovers
  nearby products.
- **Customer:** can add the current product to the cart and continue browsing
  related products.
- **Store administrator:** continues managing products and images through
  Django Admin without new workflow.

## Functional Requirements

- **FR-001:** The product page must render all images returned in
  `Product.images` as a gallery with one selected main image.
- **FR-002:** When a product has no images, the product page must keep the
  existing accessible no-image placeholder behavior.
- **FR-003:** Users must be able to switch the main product image by selecting a
  thumbnail.
- **FR-004:** The backend must expose public related products at
  `GET /api/products/<slug>/related/`.
- **FR-005:** Related products must be active products from the same category,
  excluding the current product, limited to 4 items.
- **FR-006:** If fewer than 4 same-category products exist, the endpoint must
  fill remaining slots with recent active products from other categories.
- **FR-007:** If no related products exist, the endpoint must return an empty
  list.
- **FR-008:** If the current product does not exist or is inactive, the related
  endpoint must return 404.
- **FR-009:** The frontend must render related products in a responsive grid and
  hide the section when the list is empty or cannot be loaded.
- **FR-010:** Failure to load related products must not prevent the current
  product detail from rendering.

## Non-Functional Requirements

- Preserve the existing public product list and detail routes.
- Keep product detail and related reads public; no authentication is required.
- Reuse the central frontend API client.
- Keep backend querysets optimized with `select_related("category")` and
  `prefetch_related("images")`.
- Keep the UI mobile-first and accessible with semantic headings, image alt text,
  and keyboard-operable thumbnail buttons.

## Out Of Scope

- Carousels.
- Tags or product-tag schema.
- Manually linked related products.
- CMS integration.
- Click tracking or analytics events.
- SEO/SSR restructuring.
- Recommendation algorithms or personalization.

## Acceptance Criteria

- Backend tests cover related product exclusion, active-only filtering,
  same-category priority, fallback fill, limit of 4, empty list, and 404 cases.
- Frontend tests cover no-image fallback, multi-image gallery switching, related
  products rendering, and graceful related-load failure.
- `docker compose exec backend python manage.py check` passes.
- `docker compose exec backend python manage.py test` passes.
- `docker compose exec frontend npm test -- --runInBand` passes.
- `docker compose exec frontend npm run lint` passes.
- `docker compose exec frontend npm run build` passes.
