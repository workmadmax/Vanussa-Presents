# Data Model: MVP Stabilization

This mission preserves existing data models. No schema expansion is planned.

## User

- Source: `backend/apps/users/models.py`
- Fields of interest: username, email, password hash, profile/address fields,
  staff/admin flags, groups and permissions.
- Rules: email is unique; profile endpoint returns only authenticated user's
  profile; password is never serialized.

## Category

- Source: `backend/apps/categories/models.py`
- Fields of interest: name, slug.
- Rules: slug is unique; product/category list behavior should remain
  compatible with current paginated API responses.

## Product

- Source: `backend/apps/products/models.py`
- Fields of interest: category, name, slug, description, price, stock,
  is_active, created_at, images.
- Rules: active products require `price > 0`; product list/detail expose only
  active products by default; order creation uses server-side price and active
  products only.

## ProductImage

- Source: `backend/apps/products/models.py`
- Fields of interest: product, image, alt_text.
- Rules: local media is accepted for development/staging; production storage is
  out of scope.

## Order

- Source: `backend/apps/orders/models.py`
- Fields of interest: user, status, total_price, created_at, updated_at.
- Rules: belongs to exactly one user; queries must scope by `request.user`;
  status defaults to pending.

## OrderItem

- Source: `backend/apps/orders/models.py`
- Fields of interest: order, product, quantity, price.
- Rules: quantity must be greater than zero; price is server snapshot from
  Product; subtotal is `quantity * price`; order creation is transactional and
  stock updates roll back on failure.

## Frontend State

- Auth state: `frontend/src/context/authContext.tsx`, persisted in
  `localStorage` as MVP tradeoff.
- Cart state: `frontend/src/context/cartContext.tsx`, persisted in
  `localStorage`.
- Rules: cart quantity/subtotal must remain coherent; API calls should go
  through the central client; tests must mock network calls.
