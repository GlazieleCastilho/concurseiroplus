# API

Todas as rotas privadas exigem sessao Clerk.

## IA

- `POST /api/redacao/corrigir`
  - Body: `{ tema, texto, bancaPattern, simuladoId? }`
  - Retorna feedback estruturado e salva `Redacao` + `RedacaoFeedback`.

- `POST /api/skills/[slug]/chat`
  - Body: `{ message, history, chatId? }`
  - Retorna `text/event-stream`.

## Simulados

- `POST /api/simulados`
  - Body: `{ provaId }`
  - Cria simulado em andamento.

- `POST /api/simulados/[id]/respostas`
  - Body: `{ questaoId, alternativaId?, respostaDada?, respostaTexto? }`
  - Autosave de resposta.

## Billing

- `POST /api/billing/checkout`
  - Body: `{ tier, cycle, provider }`
  - Cria checkout no Stripe ou Mercado Pago.

- `POST /api/webhooks/stripe`
- `POST /api/webhooks/mercadopago`
- `POST /api/webhooks/clerk`

## Produto

- `POST /api/planner`
- `POST /api/posts`
- `POST /api/tickets`
- `GET /api/notifications`
