# Runbook

## Incidente de IA

1. Verificar status Anthropic.
2. Confirmar `ANTHROPIC_API_KEY`.
3. Verificar fallback `OPENAI_API_KEY`.
4. Conferir rate limit Upstash.

## Incidente de billing

1. Conferir webhooks Stripe/Mercado Pago.
2. Buscar `Payment.externalPaymentId`.
3. Reprocessar evento no dashboard do provedor.
4. Validar `Subscription.status` e `User.planTier`.

## Incidente de auth

1. Conferir Clerk status.
2. Validar `CLERK_WEBHOOK_SECRET`.
3. Verificar `users.clerkUserId`.
4. Reenviar webhook pelo painel Clerk.

## Banco

1. Verificar conexoes e pooling.
2. Rodar migrations pendentes com `npx prisma migrate deploy`.
3. Conferir indices em consultas lentas.
