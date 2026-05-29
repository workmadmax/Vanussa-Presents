# Seed de Produtos por Imagens (Desenvolvimento)

Este script e usado apenas em ambiente de desenvolvimento para popular o banco
com produtos de exemplo a partir de imagens organizadas por categoria.

## O que faz

- Cria categorias a partir das subpastas em `backend/seeds/`.
- Cria produtos com nome/slug baseados no nome do arquivo.
- Copia as imagens para `backend/media/product_images/`.

## Estrutura esperada

```
backend/seeds/
  aneis/
  brincos/
  chapeis/
  colares/
  pingentes/
  pulseiras/
```

## Como executar

Dentro do Docker Compose:

```bash
docker compose exec backend python manage.py seed_products_from_images --clear
```

## Observacoes

- O comando aceita `--folder` para um caminho customizado.
- Os precos sao gerados aleatoriamente dentro da faixa configurada no comando.
- Nao utilizar em producao.
