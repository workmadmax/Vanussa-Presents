# Research: Product Page Gallery And Related Items

## Decision: DRF `ListAPIView` for related products

Use a public `ListAPIView` with `get_queryset()` to resolve the current product
and return a small related list. DRF documentation recommends overriding
`get_queryset()` for dynamic list behavior and using `select_related` plus
`prefetch_related` to avoid N+1 queries when serializers traverse relationships.

Alternatives considered:
- Add related products into the existing detail response. Rejected because it
  changes the existing product detail contract.
- Add manual product links. Rejected because it requires schema/admin workflow
  outside MVP.

## Decision: Category-first related rule

Related products come from the same category first, excluding the current
product, limited to 4 total items. Recent active products from other categories
fill the list when same-category products are insufficient.

Alternatives considered:
- Tags. Rejected because no tag model exists.
- Algorithmic recommendations. Rejected because no events/tracking data exists.
- Random recommendations. Rejected because it is harder to test and less stable.

## Decision: Grid instead of carousel

Render related products as a responsive grid. This is simpler, accessible by
default, mobile-friendly, and matches the current product-card catalog UI.

Alternatives considered:
- Carousel. Rejected for MVP because it adds focus management, controls, edge
  cases, and tests with little immediate value.

## Decision: Client-side gallery in the existing product page

Keep the existing client product route and add local state for the selected image.
Next.js `Image` supports `fill`, `sizes`, and required `alt` text, which fits the
current image configuration and tests.

Alternatives considered:
- SSR rewrite. Rejected as out of scope.
- New gallery component package. Rejected because the interaction is small.
