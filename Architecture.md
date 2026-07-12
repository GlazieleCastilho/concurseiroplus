# Architecture

Concurseiro+ usa arquitetura limpa em quatro camadas:

- UI: `src/app`, `src/components`
- Domain/Application: `src/features`, `src/schemas`, `src/stores`
- Services: `src/services`
- Data/Infra: `src/repositories`, `src/lib`, `prisma`

Fluxos criticos:

- Clerk autentica e sincroniza usuarios via webhook.
- Prisma persiste usuarios, planos, simulados, redacoes, skills, social, suporte e auditoria.
- IA usa Anthropic como provedor principal e OpenAI como fallback.
- Billing cria checkout em Stripe ou Mercado Pago e reconcilia por webhook.
- Rate limit usa Upstash Redis em producao.

Rotas publicas ficam em `/` e `/auth/*`. Produto autenticado fica em `/dashboard`, `/simulados`, `/redacao`, `/skills`, `/planner`, `/ranking`, `/feed`, `/estatisticas`, `/billing` e `/suportes`. Admin fica em `/admin/*`.
