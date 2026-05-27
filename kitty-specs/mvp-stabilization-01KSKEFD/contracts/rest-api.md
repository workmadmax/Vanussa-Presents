# REST API Contract Snapshot

This mission preserves the existing MVP REST surface. Contracts are descriptive;
they do not introduce new routes.

## Catalog

### `GET /api/categories/`

- Auth: public.
- Response: paginated category list.
- Notes: used by frontend category navigation.

### `GET /api/products/`

- Auth: public.
- Query params: `category`, pagination params.
- Response: paginated active product list with product fields, category
  reference/name and images.
- Rule: inactive products are excluded by default.

### `GET /api/products/<slug>/`

- Auth: public.
- Response: active product detail.
- Error: nonexistent or inactive product returns 404.

## Users

### `POST /api/users/register/`

- Auth: public.
- Request: username, email, password.
- Response: created user fields without password.

### `POST /api/users/login/`

- Auth: public.
- Request: username, password.
- Response: access token and refresh token.

### `POST /api/users/token/refresh/`

- Auth: refresh token.
- Request: refresh token.
- Response: new access token.

### `GET/PATCH /api/users/profile/`

- Auth: JWT required.
- Response: authenticated user's profile only.
- Rule: email is read-only through profile update.

## Orders

### `POST /api/orders/create/`

- Auth: JWT required.
- Request: items with product IDs and quantities.
- Response: created order with items and server-calculated totals.
- Rules: server price wins; inactive/missing products fail; quantity must be
  positive; insufficient stock fails; creation is transactional.

### `GET /api/orders/my-orders/`

- Auth: JWT required.
- Response: list of orders for authenticated user only.

### `GET /api/orders/<id>/`

- Auth: JWT required.
- Response: requested order only when it belongs to authenticated user.
- Error: other users' orders return 404 or equivalent non-disclosure response.
