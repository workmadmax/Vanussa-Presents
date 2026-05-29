# Proximos Passos do Projeto

Data: 2026-05-29
Fonte primaria: kitty-specs/mvp-stabilization-01KSKEFD/

## Estado Atual do Projeto

- Missao mvp-stabilization-01KSKEFD: merged, com artefatos reconciliados e gates validados via Docker Compose em 2026-05-29.
- Backend: Django 6.0.4, DRF 3.17.1, SimpleJWT 5.5.1.
- Frontend: Next.js 16.2.4, React 19.2.5, TypeScript 5.x.
- CI baseline: workflow presente, execucao remota ainda nao verificada.

## O que Ja Esta Estabilizado

- Gates locais via Docker Compose (backend check/test, frontend test/lint/build) passando.
- Cliente API centralizado no frontend, com testes de auth e carrinho.
- Consolidacao de hooks do carrinho/menu e cobertura de no-image em produto.
- Pipeline CI baseline criada para backend e frontend.

## Riscos Tecnicos Restantes

- Warnings no backend: paginacao sem ordenacao em Product e chave JWT curta em ambiente de teste.
- CI remoto ainda nao executado, risco de divergencias entre local e Actions.
- Hardening de seguranca e deploy ainda pendentes (NFR-006).

## Warnings e Pendencias Conhecidas

- UnorderedObjectListWarning em listagem de produtos.
- InsecureKeyLengthWarning para chave JWT em testes.
- Execucao remota do workflow CI pendente.

## Sugestoes de Proximas Missoes Spec Kitty

1. Missao: Hardening de seguranca e preparo para deploy
   - Foco: CORS, allowed hosts, headers seguros, segredos, rate limiting, storage de media.
   - Impacto: alto; Risco tecnico: alto; Valor portfolio: alto; Facilidade: media.

2. Missao: Qualidade de dados e warnings de backend
   - Foco: ordenar queries paginadas e fortalecer chave JWT em testes.
   - Impacto: medio; Risco tecnico: baixo; Valor portfolio: medio; Facilidade: alta.

3. Missao: Confiabilidade de CI
   - Foco: validar o workflow no GitHub Actions e ajustar divergencias.
   - Impacto: medio; Risco tecnico: medio; Valor portfolio: medio; Facilidade: media.

## Priorizacao por Criterios (1-5)

| Missao                          | Impacto | Risco Tecnico | Valor Portfolio | Facilidade |
| ------------------------------- | ------- | ------------- | --------------- | ---------- |
| Hardening de seguranca e deploy | 5       | 4             | 5               | 3          |
| Warnings e qualidade de dados   | 3       | 2             | 3               | 5          |
| Confiabilidade de CI            | 3       | 3             | 3               | 3          |

## Recomendacao da Proxima Missao Mais Segura

Missao: Warnings e qualidade de dados.
Motivo: baixo risco, escopo objetivo, remove alertas recorrentes e melhora a confiabilidade
sem alterar features.

## Escopo Sugerido da Proxima Missao

- Ordenar queryset de produtos usado em paginacao para eliminar UnorderedObjectListWarning.
- Ajustar chave JWT de teste para comprimento seguro, sem impactar ambiente de producao.
- Atualizar testes e documentacao do estado atual.
- Revalidar gates via Docker Compose.

## Fora do Escopo

- Novas features (pagamentos, shipping, admin customizado, mobile, marketplace).
- Alteracoes de API publica existentes.
- Deploy em producao, observabilidade, ou integrações externas.

## Criterios de Aceite

- Nenhum UnorderedObjectListWarning nos testes do backend.
- Nenhum InsecureKeyLengthWarning nos testes do backend.
- Gates do frontend e backend continuam passando via Docker Compose.
- Documentacao do estado atual atualizada com os resultados da missao.

## Comandos de Validacao

```bash
docker compose up -d --build

docker compose exec backend python manage.py check

docker compose exec backend python manage.py test

docker compose exec frontend npm test -- --runInBand

docker compose exec frontend npm run lint

docker compose exec frontend npm run build
```
