Analisei o projeto sem alterar arquivos. O repositório está organizado como uma aplicação de e-commerce com backend Django REST e frontend Next.js.
Estrutura Relevante
backend/: API Django.
backend/apps/categories, products, users, orders: apps de domínio.
backend/core: configurações Django, URLs, ASGI/WSGI e paginação.
backend/media/product_images: imagens locais de produtos.
frontend/: aplicação Next.js.
frontend/src/app: rotas App Router.
frontend/src/components: componentes de UI/layout/cards.
frontend/src/context: AuthProvider e CartProvider.
frontend/src/services: cliente HTTP, auth e testes.
.vscode/settings.json: formatação/indentação do editor.
Tecnologias Detectadas
Backend: Python 3.12.3, Django 6.0.4, Django REST Framework 3.17.1, SimpleJWT 5.5.1.
Frontend: Node 20.20.2, npm 11.13.0, Next.js 16.2.4, React 19.2.5, TypeScript 5.x.
Estilo/UI: Tailwind CSS 4, PostCSS, lucide-react.
Testes: Jest 30.3, Testing Library, Django TestCase/DRF APIClient.
Lint/format: ESLint 9, eslint-config-next, Prettier 3.8.3.
Dependências: backend/requirements.txt via pip/venv; frontend/package.json + package-lock.json via npm.
Backend
Entrada principal: backend/manage.py.
Configuração: backend/core/settings.py.
Rotas principais: backend/core/urls.py.
APIs:/api/categories/
/api/products/
/api/products/<slug>/
/api/users/register/
/api/users/login/
/api/users/token/refresh/
/api/users/profile/
/api/orders/create/
/api/orders/my-orders/
/api/orders/<id>/

ORM: Django ORM.
Banco: configurado por DATABASE_URL via dj-database-url; há psycopg2-binary, então o alvo provável é PostgreSQL.
Migrations existem para categories, products, users e orders.
Frontend
Entrada App Router: frontend/src/app/layout.tsx e frontend/src/app/page.tsx.
Rotas detectadas: /, /cart, /orders, /profile, /products/[slug], /checkout/[id].
Cliente API principal: frontend/src/services/api.ts.
Base URL default: http://127.0.0.1:8000/api/, sobrescrevível por NEXT_PUBLIC_API_URL.
Auth e carrinho usam localStorage.
next.config.ts libera imagens remotas de localhost:8000/media/** e 127.0.0.1:8000/media/**.
Arquitetura Atual
É uma arquitetura monorepo simples, com frontend e backend separados por pasta: Next.js consumindo uma API REST Django. Não há Docker/Compose detectado, nem configuração central na raiz para orquestrar os dois serviços.
Problemas/Inconsistências Encontrados
npm run lint falha com 305 problems, majoritariamente por regra Allman brace-style, além de any, hooks e links HTML.
npm test -- --runInBand: 9 suítes passam, 1 falha. O teste do carrinho espera router.push("/checkout"), mas o código atual navega para /checkout/${id}.
npm run build falha em produção por useSearchParams() sem boundary Suspense, provavelmente vindo de hooks usados no layout/header.
Backend: manage.py check passa sem problemas.
Backend tests: rodando de backend/, o Django encontra 96 testes, mas falha por conexão PostgreSQL/test DB. Rodando da raiz com backend/manage.py test, descobre 0 testes, então o diretório de execução importa.
frontend/madbloco.txt contém nota: “produto ta aceitando valor negativo”; o modelo Product.price não tem validador mínimo.
Há duplicidade/inconsistência em hooks de carrinho: existem supportMenu/cart/useCartMenu.ts e supportMenu/hooks/useCartMenu.ts.
Git está com arquivos deletados já existentes antes da análise: frontend/AGENTS.md e frontend/CLAUDE.md.
Próximas Etapas Recomendadas
Corrigir o build Next.js envolvendo componentes/hooks que usam useSearchParams em Suspense ou isolando-os em componentes client apropriados.
Decidir se o padrão Allman no ESLint é obrigatório; se for, formatar a base inteira, senão ajustar a regra.
Atualizar o teste do carrinho para /checkout/${id} ou alinhar o fluxo de checkout desejado.
Configurar ambiente de teste do backend com PostgreSQL acessível ou banco SQLite dedicado para testes.
Adicionar validação de preço positivo no backend.
Consolidar cliente HTTP do frontend: hoje há uso misto de api/Axios e fetch hardcoded para 127.0.0.1:8000.
Limpar arquivos/hooks duplicados e remover ou documentar o app backend/config, que parece scaffold não utilizado.