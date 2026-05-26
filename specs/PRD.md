---
# PRD.md
---

**Owner:** Douglas • **Version:** 0.1 • **Updated:** 2026-05-26
**Produto:** Loja e-commerce real
**Template:** Lean PRD
**Status:** Specify aprovado para documentação inicial; implementação exige planos/tarefas aprovados.

## Summary

Loja online real construída como monorepo com backend Django REST e frontend Next.js. O MVP já existe e deve ser estabilizado para padrão profissional antes de novas features.

Usuários principais:
- Visitante: navega no catálogo e visualiza produtos.
- Cliente logado: mantém perfil, carrinho e pedidos.
- Administrador da loja: gerencia catálogo, usuários e pedidos pelo Django Admin no MVP.
- Operador de pedidos: acompanha e processa pedidos simulados no MVP.

Valor:
- Permitir venda online com base técnica segura, testável e preparada para pagamento real via Pix em feature futura.

## Contexto Atual do Projeto

Análise inicial do repositório:
- Backend: Django REST Framework, apps `categories`, `products`, `users`, `orders`, configuração em `backend/core`.
- Frontend: Next.js App Router, componentes em `frontend/src/components`, contextos `AuthProvider` e `CartProvider`, serviços HTTP em `frontend/src/services`.
- APIs existentes:
  - `/api/categories/`
  - `/api/products/`
  - `/api/products/<slug>/`
  - `/api/users/register/`
  - `/api/users/login/`
  - `/api/users/token/refresh/`
  - `/api/users/profile/`
  - `/api/orders/create/`
  - `/api/orders/my-orders/`
  - `/api/orders/<id>/`
- Stack detectada:
  - Python 3.12.3
  - Django 6.0.4
  - Django REST Framework 3.17.1
  - SimpleJWT 5.5.1
  - Node 20.20.2
  - npm 11.13.0
  - Next.js 16.2.4
  - React 19.2.5
  - TypeScript 5.x
  - Tailwind CSS 4
  - Jest 30.3
  - Testing Library
  - Django TestCase / DRF APIClient
  - ESLint 9
  - Prettier 3.8.3

Problemas técnicos já identificados:
- `npm run lint` falha com muitos problemas, principalmente regra Allman `brace-style`, `any`, hooks e links HTML.
- `npm test -- --runInBand` tem 1 suíte falhando por divergência entre rota esperada e rota real de checkout.
- `npm run build` falha por uso de `useSearchParams()` sem `Suspense` boundary.
- `manage.py check` passa.
- Testes backend são descobertos quando executados a partir de `backend/`, mas falham por conexão PostgreSQL/test DB.
- Testes backend executados da raiz descobrem 0 testes.
- `Product.price` aceita valor negativo.
- Há duplicidade/inconsistência de hooks de carrinho.
- Há uso misto de cliente API e `fetch` hardcoded para `127.0.0.1:8000`.
- Há arquivos deletados previamente no Git: `frontend/AGENTS.md` e `frontend/CLAUDE.md`.

## Jobs & Outcomes

### JTBD-001 — Comprar produto com confiança
Como cliente, quero navegar, ver detalhes, colocar produtos no carrinho e criar um pedido, para concluir uma compra sem atendimento manual.

Outcome:
- Cliente consegue criar pedido simulado de ponta a ponta sem erro.

### JTBD-002 — Administrar catálogo
Como administrador, quero cadastrar e manter categorias/produtos no Django Admin, para operar a loja no MVP.

Outcome:
- Catálogo gerenciável sem alteração direta no banco.

### JTBD-003 — Acompanhar pedidos
Como cliente, quero ver meus pedidos, para acompanhar minhas compras.
Como operador, quero consultar pedidos, para processar entregas manualmente no MVP.

Outcome:
- Pedidos pertencem ao usuário correto e não vazam dados entre contas.

### JTBD-004 — Evoluir com segurança
Como desenvolvedor, quero uma base com testes, padrões e documentação, para adicionar Pix, frete e admin customizado sem regressões.

Outcome:
- Toda mudança relevante passa por PRD atualizado, plano, testes e revisão de segurança.

## Success Metrics

- Build frontend: `npm run build` deve passar em 100% dos merges para `main`.
- Lint frontend: 0 erros bloqueantes no CI.
- Testes frontend: 100% das suítes existentes verdes antes de novas features.
- Testes backend: 100% dos testes descobertos e executados em ambiente local/CI reprodutível.
- Segurança de pedidos: 0 endpoints permitindo acesso a pedido/perfil de outro usuário autenticado.
- Validação de produto: preço e quantidade nunca podem ser negativos.
- Cobertura inicial alvo:
  - Backend domínio/serializers/views críticas: mínimo 80%.
  - Frontend fluxos críticos: carrinho, checkout, auth e pedidos testados.
- Tempo de resposta alvo MVP local/staging:
  - APIs de listagem/detalhe: p95 < 500 ms em dataset pequeno/médio.
  - Criação de pedido: p95 < 800 ms em staging.

## Key Scenarios

### Scenario 1 — Visitante navega e adiciona produto
Trigger: visitante acessa a home ou catálogo.
Steps:
1. Sistema lista categorias/produtos ativos.
2. Visitante abre detalhe do produto.
3. Visitante adiciona item ao carrinho.
Success:
- Carrinho reflete produto, quantidade e subtotal corretos.

### Scenario 2 — Cliente cria pedido simulado
Trigger: cliente logado inicia checkout.
Steps:
1. Sistema valida carrinho.
2. Sistema valida autenticação.
3. Sistema cria pedido com itens e totais.
4. Sistema redireciona para confirmação/detalhe do pedido.
Success:
- Pedido é salvo com usuário correto, total correto e itens imutáveis para histórico.

### Scenario 3 — Cliente consulta meus pedidos
Trigger: cliente acessa “Meus pedidos”.
Steps:
1. Sistema autentica cliente.
2. API retorna apenas pedidos do usuário autenticado.
3. Cliente abre detalhe de pedido permitido.
Success:
- Nenhum pedido de outro usuário fica acessível por troca de ID.

### Scenario 4 — Administrador opera MVP
Trigger: administrador entra no Django Admin.
Steps:
1. Admin cria/edita categoria.
2. Admin cria/edita produto com preço e imagem.
3. Admin consulta pedidos.
Success:
- Operação básica da loja funciona sem shell/manual SQL.

## Functional Requirements

### FR-001 — Catálogo de produtos
O sistema deve listar produtos ativos com categoria, nome, slug, preço, imagem e disponibilidade.

Acceptance:
- Given existem produtos ativos e inativos
- When o visitante acessa o catálogo
- Then apenas produtos ativos devem ser exibidos por padrão

### FR-002 — Detalhe de produto
O sistema deve exibir detalhe de produto por `slug`.

Acceptance:
- Given existe produto com slug válido
- When o visitante acessa `/products/<slug>`
- Then o sistema exibe nome, imagem, descrição, preço e disponibilidade

### FR-003 — Validação de preço
O sistema não deve permitir produto com preço negativo ou zero quando o produto for vendável.

Acceptance:
- Given um admin tenta salvar produto com preço negativo
- When o backend valida o produto
- Then a operação deve falhar com erro claro

### FR-004 — Carrinho
O frontend deve manter carrinho com itens, quantidade e subtotal coerentes.

Acceptance:
- Given o cliente adiciona o mesmo produto duas vezes
- When o carrinho é renderizado
- Then a quantidade deve aumentar e o subtotal deve refletir preço × quantidade

### FR-005 — Checkout simulado
O sistema deve criar pedido simulado sem pagamento real no MVP.

Acceptance:
- Given cliente autenticado com carrinho válido
- When envia checkout
- Then pedido é criado com status inicial definido e itens associados

### FR-006 — Autenticação
O sistema deve permitir cadastro, login, refresh de token e consulta de perfil.

Acceptance:
- Given credenciais válidas
- When o cliente faz login
- Then recebe tokens e consegue acessar perfil

### FR-007 — Autorização de pedidos
O sistema deve impedir acesso a pedidos de outro usuário.

Acceptance:
- Given usuário A possui pedido 1 e usuário B está autenticado
- When usuário B tenta acessar `/api/orders/1/`
- Then a API deve retornar 403 ou 404

### FR-008 — Meus pedidos
O sistema deve listar apenas pedidos do cliente autenticado.

Acceptance:
- Given cliente possui pedidos
- When acessa `/api/orders/my-orders/`
- Then recebe somente seus próprios pedidos

### FR-009 — Admin MVP
O Django Admin deve permitir operação básica de categorias, produtos, usuários e pedidos.

Acceptance:
- Given usuário staff autorizado
- When acessa Django Admin
- Then consegue consultar e manter entidades do MVP conforme permissões

### FR-010 — Cliente API único
O frontend deve usar um cliente HTTP centralizado e configurável por ambiente.

Acceptance:
- Given `NEXT_PUBLIC_API_URL` está configurada
- When frontend faz chamadas à API
- Then nenhuma chamada deve usar URL hardcoded `127.0.0.1:8000` fora do arquivo de configuração permitido

### FR-011 — Build Next.js
O frontend deve compilar em produção.

Acceptance:
- Given o projeto frontend está com dependências instaladas
- When executa `npm run build`
- Then o build finaliza sem erro de `useSearchParams`/`Suspense`

### FR-012 — Testes backend reprodutíveis
O backend deve ter ambiente de teste executável de forma previsível.

Acceptance:
- Given dev ou CI executa o comando documentado
- When os testes rodam
- Then todos os testes são descobertos e usam banco de teste configurado

## MVP vs Advanced

### MVP Atual a Estabilizar
- Catálogo de categorias e produtos.
- Detalhe de produto.
- Carrinho.
- Cadastro/login/perfil.
- Checkout com pedido simulado.
- Meus pedidos.
- Django Admin para operação.
- Upload/serving de imagens em ambiente local/staging.
- Testes existentes corrigidos.
- Build/lint/typecheck como gates.
- Validação de domínio essencial: preço, quantidade, ownership de pedidos.

### Advanced / Próximas Features
- Pagamento Pix real.
- Integração com operadora de pagamento.
- Admin customizado.
- Frete/entrega.
- Cupons/descontos.
- E-mails transacionais.
- Observabilidade completa com traces/métricas/logs.
- Deploy definitivo em provedor a escolher.
- Busca avançada, filtros e paginação otimizada.
- Estoque reservado.
- Webhooks de pagamento.
- Auditoria administrativa.

### Fora do Escopo Agora
- Marketplace multi-vendedor.
- Pagamento real no MVP estabilizado.
- App mobile nativo.
- ERP completo.
- Internacionalização completa.
- Multi-tenant/white-label.

## Non-Functional Requirements

### Performance
- APIs críticas com p95 < 500 ms para leitura e p95 < 800 ms para criação de pedido em staging pequeno/médio.
- Listagens devem usar paginação.
- Queries de pedidos devem evitar N+1 com `select_related`/`prefetch_related` quando aplicável.
- Imagens devem ter estratégia clara para produção, preferencialmente storage externo/CDN em feature de deploy.

### Reliability
- Banco de produção alvo: PostgreSQL.
- Testes devem rodar com banco de teste isolado.
- Migrações devem ser versionadas e revisadas.
- Backups e restore serão definidos na feature de deploy.

### Security & Privacy
- Dados de cliente e pedidos são PII leve/moderada.
- Tokens JWT devem ter expiração adequada e refresh controlado.
- Endpoints de pedido e perfil exigem autenticação.
- Todo acesso por ID deve validar ownership/permissão.
- Secrets devem vir de variáveis de ambiente, nunca do Git.
- CORS deve permitir apenas origens necessárias por ambiente.
- Inputs devem ser validados em serializer/model/service.
- Erros não devem vazar stack trace em produção.
- Logs não devem conter senha, token ou dados sensíveis completos.

### Accessibility
- UI deve usar HTML semântico.
- Links reais devem usar elementos adequados.
- Formulários devem ter labels e mensagens de erro claras.
- Alvo inicial: boas práticas compatíveis com WCAG 2.2 AA para fluxos críticos.

### Maintainability
- TypeScript sem `any` em contratos públicos.
- Python com type hints em serviços/domínio e checagem via `mypy` ou `pyright` quando introduzido.
- Backend deve evitar views gordas; regra preferida:
  - serializers validam entrada/saída;
  - services executam casos de uso;
  - selectors encapsulam queries de leitura relevantes;
  - permissions protegem acesso;
  - models preservam invariantes essenciais.
- Frontend deve separar:
  - componentes puros de UI;
  - hooks de integração;
  - cliente API tipado;
  - mapeamento de DTOs.

### Observability
- Logs estruturados por ambiente.
- Correlation/request ID nas APIs.
- Métricas mínimas futuras:
  - taxa de erro 4xx/5xx;
  - latência p95;
  - pedidos criados;
  - falhas de checkout;
  - falhas de login.
- Preparar integração futura com OpenTelemetry.

## Integrations & Data

### Integrações Atuais
- Frontend Next.js consome API Django REST.
- Django usa banco relacional configurado por `DATABASE_URL`.
- Imagens locais em `backend/media/product_images` no desenvolvimento.

### Integrações Futuras
- Pix real.
- Operadora de pagamento.
- Serviço de envio/frete.
- Storage de mídia em produção.
- Provedor de e-mail.
- Observabilidade/monitoramento.
- Hospedagem frontend/backend a definir.

### Data Model Sketch

Entidades principais:
- User
  - id
  - email/username
  - password hash
  - profile fields
  - staff/admin flags
- Category
  - id
  - name
  - slug
  - active
- Product
  - id
  - category
  - name
  - slug
  - description
  - price
  - image
  - stock/availability
  - active
- Order
  - id
  - user
  - status
  - total
  - created_at
  - updated_at
- OrderItem
  - id
  - order
  - product snapshot/name
  - unit_price
  - quantity
  - subtotal

Regras de dados:
- `Product.price > 0` para produto vendável.
- `OrderItem.quantity > 0`.
- `Order.total` deve ser derivado dos itens ou validado contra soma dos itens.
- Pedido deve manter snapshot suficiente para preservar histórico mesmo se produto mudar depois.
- APIs de pedido não devem confiar em preço enviado pelo cliente.

## Arquitetura Recomendada

### Estrutura de Specs

Criar pasta na raiz:

```text
/specs/
  PRD.md
  AGENTS.md
  IMPLEMENTATION_PLAN.md        # gerar depois, quando aprovado
  TEST_PLAN.md                  # gerar depois, quando solicitado
  SECURITY_REVIEW.md            # gerar depois, quando solicitado
  decisions/
    ADR-001-spec-driven-development.md
  audits/
    2026-05-26-project-audit.md
```

A pasta `/specs/` funciona bem para Spec-Driven Development porque mantém documentação versionada junto ao código e visível para humanos e agentes.

### Estrutura de Código Recomendada

Manter monorepo:

```text
/backend/
  apps/
    categories/
    products/
    users/
    orders/
  core/
/frontend/
  src/
    app/
    components/
    context/
    services/
    tests/
/specs/
```

Evolução recomendada para backend por app:

```text
apps/products/
  models.py
  serializers.py
  selectors.py
  services.py
  permissions.py
  views.py
  urls.py
  tests/
    test_models.py
    test_serializers.py
    test_api.py
```

Evolução recomendada para frontend:

```text
src/
  app/
  components/
  features/
    cart/
    products/
    orders/
    auth/
  services/
    apiClient.ts
    contracts/
  lib/
  tests/
```

## Risks, Assumptions, Decisions

### Risks

RISK-001 — Vazamento de pedidos entre usuários
Mitigation:
- Testes obrigatórios de object-level authorization.
- Querysets filtrados por `request.user`.
- Permissions explícitas em endpoints sensíveis.

RISK-002 — Build frontend quebrado bloqueia deploy
Mitigation:
- Corrigir `useSearchParams` com `Suspense`/isolamento em client component.
- CI com `npm run build`.

RISK-003 — Testes backend não reprodutíveis
Mitigation:
- Documentar comando oficial.
- Configurar banco de teste via Docker/Compose ou settings dedicado.
- CI executando a partir de `backend/`.

RISK-004 — Pagamento futuro mal encaixado
Mitigation:
- No MVP, modelar pedido simulado com status claro.
- Não acoplar pedido a provedor específico agora.
- Criar abstração futura para `PaymentIntent`/`PaymentTransaction`.

RISK-005 — Dados inválidos em produção
Mitigation:
- Validações em model/serializer/service.
- Testes de invariantes.
- Constraints no banco quando possível.

### Assumptions
- Loja terá volume inicial baixo/médio.
- Django Admin é suficiente no MVP.
- Pagamento real será feature posterior.
- Hospedagem será decidida em fase futura.
- PostgreSQL será o banco alvo de produção.

### Decisions
- DEC-001: Usar Lean PRD.
- DEC-002: Criar `/specs/` na raiz.
- DEC-003: Priorizar estabilização profissional antes de novas features.
- DEC-004: Manter Django REST + Next.js.
- DEC-005: Usar TDD e FP como princípios obrigatórios para novas alterações.
- DEC-006: Gerar `IMPLEMENTATION_PLAN.md` apenas após aprovação explícita.
- DEC-007: Gerar `TEST_PLAN.md` e `SECURITY_REVIEW.md` posteriormente, quando solicitado.

## Release & Metrics

### Milestone 1 — Baseline Profissional
Objetivo:
- Documentar specs.
- Corrigir build.
- Corrigir testes existentes.
- Definir CI mínimo.
- Corrigir validações críticas.
- Consolidar cliente HTTP.

Gate:
- `npm run build` verde.
- `npm test` verde.
- Backend tests descobertos e verdes em ambiente documentado.
- `manage.py check` verde.
- 0 endpoints críticos sem teste de autorização.

### Milestone 2 — Hardening MVP
Objetivo:
- Melhorar segurança, cobertura e arquitetura.
- Introduzir type checking e OpenAPI.
- Preparar deploy.

Gate:
- Cobertura crítica mínima atingida.
- Testes de segurança básicos escritos.
- Configuração por ambiente documentada.
- Secrets fora do código.

### Milestone 3 — Feature Pagamento Pix
Objetivo:
- Adicionar pagamento Pix real com provedor escolhido.

Gate:
- PRD atualizado.
- Plano de integração aprovado.
- Webhooks testados.
- Regras de idempotência definidas.
- Rollback documentado.

## Roteiro Spec-Driven Development

### Fase 1 — Specify
1. Criar `/specs/PRD.md`.
2. Criar `/specs/AGENTS.md`.
3. Registrar decisões em ADRs quando necessário.
4. Não alterar código ainda, exceto criação de documentação.

### Fase 2 — Plan
1. Gerar `/specs/IMPLEMENTATION_PLAN.md`.
2. Mapear cada correção para FR-ID.
3. Definir ordem segura:
   - testes e ambiente;
   - build;
   - validações;
   - segurança de pedidos;
   - limpeza de duplicidades;
   - CI;
   - observabilidade mínima.

### Fase 3 — Tasks
1. Quebrar o plano em tasks pequenas.
2. Cada task deve ter:
   - FR-ID;
   - teste antes do código;
   - arquivos esperados;
   - Definition of Done;
   - risco de regressão.

### Fase 4 — Implement
1. Executar uma task por vez.
2. Seguir Red → Green → Refactor.
3. Atualizar PRD primeiro se surgir mudança de escopo.
4. Nunca implementar pagamento/admin customizado sem nova spec.

## Glossary / References

- PRD: Product Requirements Document.
- SDD: Spec-Driven Development.
- FP: Functional Programming.
- TDD: Test-Driven Development.
- BOLA: Broken Object Level Authorization.
- MVP: versão mínima operacional.
- ADR: Architecture Decision Record.

Referências técnicas:
- Django 6.0 release notes: https://docs.djangoproject.com/en/6.0/releases/6.0/
- Next.js missing Suspense boundary with `useSearchParams`: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP API1 Broken Object Level Authorization: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- OpenTelemetry docs: https://opentelemetry.io/docs/
