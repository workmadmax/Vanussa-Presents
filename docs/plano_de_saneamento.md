# Plano de Saneamento do Backend Django

## Summary
- Manter a estrutura atual de apps por domínio: `users`, `products`, `categories`, `orders`.
- Corrigir duplicatas reais sem tocar em frontend, Spec-Kitty, CI ou histórico de missão.
- Priorizar correções pequenas, testáveis e compatíveis com o MVP.

## Key Changes
- Remover ou arquivar `backend/config/` após confirmação, pois parece scaffold obsoleto e não está ativo no Django.
- Remover a rota duplicada `/token/refresh/`, mantendo `/api/users/token/refresh/` como rota canônica.
- Corrigir o seed de imagens para não gerar `product_images/product_images/...`.
- Mover/remover testes de produto dentro de `categories/tests.py`, deixando cada app testar sua própria responsabilidade.
- Adicionar constraints no banco para `OrderItem.quantity` e `OrderItem.price`.
- Melhorar querysets com `select_related("category")` em produtos e ordenar categorias antes da paginação.
- Planejar hardening separado de produção: settings split ou bloco explícito para `SECURE_*`, cookies seguros, throttling de login/register e default permissions.

## Test Plan
- `docker compose exec backend python manage.py check`
- `docker compose exec backend python manage.py test`
- Teste específico para refresh token apenas na rota canônica.
- Teste/regressão do seed usando `MEDIA_ROOT` temporário.
- Verificação manual de que `backend/media`, `.venv` e `__pycache__` continuam ignorados e não versionados.

## Assumptions
- Catálogo de produtos/categorias continua público.
- Login por `username` continua intencional.
- `/api/users/token/refresh/` é a rota pública oficial.
- Nenhuma remoção de pasta será feita sem confirmação explícita.
