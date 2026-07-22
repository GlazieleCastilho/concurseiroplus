-- Migra o provider de pagamento de AbacatePay para Pagar.me. Nao ha pagamentos reais
-- em producao ainda (conta de producao do AbacatePay nunca foi aprovada), entao e
-- seguro renomear em vez de manter os dois providers lado a lado.

-- Renomeia o valor do enum (Postgres 10+)
ALTER TYPE "PaymentProvider" RENAME VALUE 'ABACATEPAY' TO 'PAGARME';

-- Renomeia colunas especificas do AbacatePay
ALTER TABLE "users" RENAME COLUMN "abacatepayCustomerId" TO "pagarmeCustomerId";
ALTER TABLE "plans" RENAME COLUMN "abacatepayProductId" TO "pagarmePlanId";

-- Atualiza o default da coluna provider em webhook_events
ALTER TABLE "webhook_events" ALTER COLUMN "provider" SET DEFAULT 'PAGARME';
