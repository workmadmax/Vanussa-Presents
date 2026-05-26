# Estado Atual do Projeto

**Data:** 2026-05-26
**Tipo:** Relatorio operacional SDD
**Fonte da verdade:** `specs/PRD.md`

Este documento registra o estado atual do projeto depois dos commits locais de
estabilizacao inicial. Ele nao substitui a PRD e nao autoriza novas features por
si so.

## Estado Git

- Branch atual: `main`.
- Estado remoto: `main...origin/main [ahead 5]`.
- Diff rastreado pendente: nenhum.
- Arquivos/pastas nao versionados conhecidos: `.agents/`.
- Nenhum push ou PR foi feito nesta etapa.

Ultimos commits locais:

```text
3d2a3c4 fix(products): enforce positive price for active products
2d2536c fix(frontend): align build hooks and checkout tests
d65d5b5 chore(compose): add docker compose app runtime
a33a0fa docs(sdd): add project specification baseline
02d3806 chore(repo): consolidate ignore rules
```

## Estado Tecnico

- Docker Compose esta configurado como ambiente obrigatorio.
- Servicos atuais: `db`, `backend` e `frontend`.
- PostgreSQL roda somente na rede interna do Compose como `db:5432`.
- Backend expoe `8000:8000`; frontend expoe `3000:3000`.
- `frontend/node_modules/` e `frontend/.next/` estao ignorados pela `.gitignore`
  raiz.

Tasks SDD ja implementadas e commitadas:

- `T-001`: baseline de teste backend com PostgreSQL via Docker Compose.
- `T-002`: remocao da regra ESLint Allman `brace-style`.
- `T-003`: build Next.js corrigido para `useSearchParams`/`Suspense`.
- `T-004`: teste de checkout alinhado para `/checkout/{id}` com API mockada.
- `T-005`: produto ativo exige `price > 0` no model e no banco.

## Validacoes Registradas

Ultima validacao relevante feita em Docker Compose:

```text
docker compose up -d --build                         PASS
docker compose exec backend python manage.py check   PASS
docker compose exec backend python manage.py migrate PASS
docker compose exec backend python manage.py test apps.products PASS, 26 tests
docker compose exec frontend npm test -- --runInBand src/services/__tests__/cartPage.test.tsx PASS, 12 tests
docker compose exec frontend npm run build           PASS
docker compose exec frontend npm test -- --runInBand PASS, 54 tests
docker compose exec frontend npm run lint            FAIL, 27 problemas
docker compose exec backend python manage.py test    FAIL, 4 falhas em categorias
```

Para atualizar este relatorio, usar apenas comandos Docker Compose. Nao rodar
`python`, `pip`, `npm` ou `manage.py` diretamente no host.

## Pendencias Conhecidas

- `docker compose exec frontend npm run lint` ainda falha com 27 problemas fora
  do Bloco A, principalmente regras de hooks, `curly`, `no-explicit-any` e uso
  de `<a>`/`<img>`.
- `docker compose exec backend python manage.py test` ainda falha em 4 testes
  legados de `backend/apps/categories/tests.py`.
- As falhas de categorias parecem vir de expectativas antigas de lista direta,
  enquanto `/api/products/` atualmente retorna resposta paginada com `results`
  e `count`.
- Ainda ha chamadas hardcoded para `http://127.0.0.1:8000` fora do cliente API
  central em:
  - `frontend/src/context/authContext.tsx`
  - `frontend/src/components/layouts/supportMenu/cart/cartMenu.tsx`
- Tambem existem ocorrencias temporarias em `frontend/src/services/api.ts` e em
  fixtures/testes; essas devem ser avaliadas na `T-007`.
- Existem hooks duplicados de carrinho/menu em:
  - `frontend/src/components/layouts/supportMenu/cart/useCartMenu.ts`
  - `frontend/src/components/layouts/supportMenu/hooks/useCartMenu.ts`
  - `frontend/src/components/layouts/supportMenu/hooks/useSupportMenu.ts`
- Nao existe diretorio `.github/`; portanto ainda nao ha workflow de CI.
- `docker compose up` pode avisar sobre container orfao antigo
  `site-postgres-1`, criado antes da renomeacao do servico de banco para `db`.

## Proximas Tasks SDD

### T-006: Order Quantity and Total Invariants

Objetivo: tornar a criacao de pedidos segura e atomica.

Fazer:

- Adicionar testes vermelhos para quantidade `0` e negativa.
- Garantir que totais sejam calculados no servidor.
- Usar `transaction.atomic()` na criacao do pedido.
- Evitar pedido parcial quando um item falhar.
- Manter desconto de estoque consistente.

Validar:

```text
docker compose exec backend python manage.py test apps.orders
docker compose exec backend python manage.py test
```

### Task Tecnica: Ajustar Testes Legados de Categorias

Objetivo: desbloquear a suite backend completa sem alterar a API publica.

Fazer:

- Atualizar `backend/apps/categories/tests.py` para ler respostas paginadas via
  `results` e `count`.
- Manter os cenarios atuais: produto ativo, filtro por categoria, categoria
  inexistente e detalhe por slug.
- Nao alterar comportamento de `/api/products/`.

Validar:

```text
docker compose exec backend python manage.py test apps.categories
docker compose exec backend python manage.py test
```

### T-007: Central Frontend API Client

Objetivo: remover chamadas hardcoded de API do codigo de feature.

Fazer:

- Migrar `authContext.tsx` para usar o cliente `api` ou uma camada de servico
  central.
- Migrar `cartMenu.tsx` para usar o cliente `api`.
- Manter `NEXT_PUBLIC_API_URL` como configuracao operacional.
- Ajustar testes de login, register, token refresh e checkout/menu para mocks
  sem rede real.

Validar:

```text
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

### T-008: Duplicate Cart Hook Consolidation

Objetivo: reduzir duplicidade nos hooks de menu/carrinho.

Fazer:

- Escolher uma implementacao canonica de `useCartMenu`.
- Atualizar imports dos componentes para usar apenas a implementacao canonica.
- Remover hook duplicado se ficar sem uso.
- Preservar fechamento por navegacao, tecla `Escape` e clique fora.

Validar:

```text
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
```

### T-009: CI Baseline

Objetivo: criar gates automaticos equivalentes ao fluxo local Docker.

Fazer:

- Criar workflow em `.github/workflows/`.
- Incluir PostgreSQL para o backend.
- Rodar backend `check`, migrations e testes.
- Rodar frontend lint, tests e build.
- Documentar qualquer divergencia entre CI e Compose local.

Validar:

```text
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

## Ordem Recomendada

1. Ajustar testes legados de categorias para recuperar o gate backend completo.
2. Executar `T-006`.
3. Executar `T-007`.
4. Executar `T-008`.
5. Executar `T-009`.

Essa ordem prioriza estabilidade dos gates antes de adicionar CI.
