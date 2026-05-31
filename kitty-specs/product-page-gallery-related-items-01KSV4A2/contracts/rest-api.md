# REST API Contract

## Existing Product Detail

```text
GET /api/products/<slug>/
```

Behavior remains unchanged. It returns one active product serialized by
`ProductSerializer` or 404 when the product is missing/inactive.

## Related Products

```text
GET /api/products/<slug>/related/
```

Authentication: public.

Response `200 OK`:

```json
[
  {
    "id": 2,
    "name": "Produto Relacionado",
    "slug": "produto-relacionado",
    "description": "Descricao",
    "price": "19.90",
    "stock": 8,
    "is_active": true,
    "created_at": "2026-05-30T00:00:00Z",
    "category": 1,
    "images": [
      {
        "id": 10,
        "image": "http://127.0.0.1:8000/media/product_images/item.jpg",
        "alt_text": "Produto Relacionado"
      }
    ],
    "category_name": "Categoria"
  }
]
```

Rules:
- Return an unpaginated array with at most 4 products.
- Same-category active products are returned first.
- The current product is excluded.
- Recent active products from other categories fill missing slots.
- Return `[]` if no candidates exist.
- Return `404 Not Found` if `<slug>` does not identify an active product.
