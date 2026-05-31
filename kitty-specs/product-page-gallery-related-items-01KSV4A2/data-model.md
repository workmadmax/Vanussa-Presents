# Data Model: Product Page Gallery And Related Items

## Existing Entities

### Product

Fields used by this mission:
- `id`
- `name`
- `slug`
- `description`
- `price`
- `stock`
- `is_active`
- `created_at`
- `category`
- reverse `images`

Rules:
- Related products only include `is_active=True`.
- The current product is resolved by active `slug`.
- The current product is excluded from its own related list.

### ProductImage

Fields used by this mission:
- `id`
- `image`
- `alt_text`
- `product`

Rules:
- The first image is selected by default.
- `alt_text` is preferred for rendered image alt text; product name is the
  fallback.
- No-image products render the existing accessible placeholder.

### Category

Fields used by this mission:
- `id`
- `name`
- `slug`

Rules:
- Category equality determines first-pass related products.

## New Schema

No database schema changes are required.
