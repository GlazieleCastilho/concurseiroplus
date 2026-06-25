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
  - Body: `{ tier, cycle }`
  - Cria checkout hospedado na AbacatePay.
  - `MENSAL` e `ANUAL` usam assinatura; `TRIMESTRAL` e `VITALICIO` usam pagamento unico.

- `POST /api/webhooks/abacatepay?webhookSecret=SEU_SECRET`
  - Eventos: `checkout.completed`, `checkout.refunded`, `checkout.disputed`, `checkout.lost`, `subscription.completed`, `subscription.renewed`, `subscription.cancelled`, `subscription.trial_started`.
  - Exige assinatura `X-Webhook-Signature`.
- `POST /api/webhooks/clerk`

## Produto

- `POST /api/planner`
- `POST /api/posts`
- `POST /api/tickets`
- `GET /api/notifications`
