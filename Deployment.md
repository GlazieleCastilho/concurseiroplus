# Deployment

## Vercel

1. Conecte o repositorio.
2. Configure variaveis de `.env.example`.
3. Configure PostgreSQL com SSL e pooling.
4. Configure build command: `npm run build`.
5. Rode `npx prisma migrate deploy` no pipeline.

## Railway

Use Railway para PostgreSQL ou deploy alternativo do app. Configure `DATABASE_URL` com SSL.

## Storage

Use Supabase Storage ou S3 para arquivos de provas, imagens e materiais. Variaveis AWS/Supabase estao em `.env.example`.

## Webhooks

- Clerk: `https://dominio/api/webhooks/clerk`
- AbacatePay: `https://dominio/api/webhooks/abacatepay?webhookSecret=SEU_SECRET`
  - Eventos: `checkout.completed`, `checkout.refunded`, `checkout.disputed`, `checkout.lost`, `subscription.completed`, `subscription.renewed`, `subscription.cancelled`, `subscription.trial_started`.
  - Configure `ABACATEPAY_WEBHOOK_SECRET` com o secret da query string.
  - Configure `ABACATEPAY_WEBHOOK_HMAC_SECRET` com o secret HMAC cadastrado no webhook para validar `X-Webhook-Signature`.
