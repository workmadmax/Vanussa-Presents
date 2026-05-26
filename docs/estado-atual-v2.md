# Estado Atual do Projeto - Versao 2

**Data:** 2026-05-26
**Tipo:** Relatorio operacional SDD
**Fonte da verdade:** `specs/PRD.md`

Este documento registra o estado apos a execucao de `T-006` e da task tecnica
de ajuste dos testes legados de categorias. Ele nao substitui a PRD e nao
introduz novas features.

## Estado Git

- Branch atual: `main`.
- Estado remoto: `main...origin/main [ahead 5]`.
- Commits locais anteriores continuam sem push.
- Alteracoes de trabalho desta rodada:
  - `backend/apps/orders/services.py`
  - `backend/apps/orders/tests.py`
  - `backend/apps/categories/tests.py`
  - `docs/estado-atual-v2.md`
- Arquivos nao versionados ja conhecidos:
  - `.agents/`
  - `docs/estado-atual.md`

## Estado Tecnico

- `T-001` a `T-005` permanecem implementadas e commitadas.
- `T-006` foi implementada nesta rodada.
- A task tecnica de categorias foi implementada nesta rodada.
- A criacao de pedidos agora rejeita `quantity <= 0` antes de gravar no banco.
- A criacao de pedidos roda dentro de `transaction.atomic()`.
- O produto e bloqueado com `select_for_update()` durante a atualizacao de
  estoque.
- Totais e precos de itens continuam calculados no servidor a partir do produto.
- Se um item posterior falhar, pedido, itens e desconto de estoque sao
  revertidos pela transacao.
- Os testes legados de categorias agora leem a resposta paginada atual via
  `count` e `results`.
- O comportamento publico de `/api/products/` nao foi alterado.

## Validacoes Executadas

Comandos executados dentro do container Docker:

```text
docker compose exec backend python manage.py test apps.orders
```

Resultado: `PASS`, 28 testes.

```text
docker compose exec backend python manage.py test apps.categories
```

Resultado: `PASS`, 12 testes.

```text
docker compose exec backend python manage.py test
```

Resultado: `PASS`, 102 testes.

Observacoes:

- A suite completa ainda exibe `UnorderedObjectListWarning` na paginacao de
  produtos.
- A suite completa ainda exibe `InsecureKeyLengthWarning` do JWT por chave local
  curta no ambiente de teste.
- Esses avisos nao bloquearam os testes desta rodada.

## Pendencias Restantes

- `T-007`: centralizar chamadas frontend no cliente API e remover `fetch`
  hardcoded para `http://127.0.0.1:8000`.
- `T-008`: consolidar hooks duplicados de carrinho/menu.
- `T-009`: adicionar CI baseline com PostgreSQL, backend checks/tests e
  frontend lint/test/build.
- Resolver a pendencia de lint frontend ja conhecida.
- Avaliar o aviso de paginacao sem ordenacao em `/api/products/`.
- Avaliar a chave local usada nos testes JWT para eliminar o warning de tamanho
  insuficiente.
- Limpar o container orfao antigo `site-postgres-1` quando for seguro.

## Proxima Ordem Recomendada

1. Executar `T-007`.
2. Executar `T-008`.
3. Corrigir lint frontend ou registrar subtasks de lint por categoria.
4. Executar `T-009` quando os gates locais estiverem estaveis.

Todos os proximos comandos de backend/frontend devem continuar usando Docker
Compose. Nao rodar `python`, `pip`, `npm` ou `manage.py` diretamente no host.
