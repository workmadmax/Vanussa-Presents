# Quickstart

## Run The App

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:3000/products/<slug>
```

Expected behavior:
- The product page shows a selected main image.
- Products with multiple images show thumbnail buttons.
- Products with no images show the accessible placeholder.
- Related products appear below the detail when the backend returns any.

## Inspect The API

```bash
docker compose exec backend python manage.py check
```

```bash
curl http://127.0.0.1:8000/api/products/<slug>/related/
```

The response should be an array with up to 4 active products.

## Validate

```bash
docker compose exec backend python manage.py test
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```
