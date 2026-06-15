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
- Stripe: `https://dominio/api/webhooks/stripe`
- Mercado Pago: `https://dominio/api/webhooks/mercadopago`
