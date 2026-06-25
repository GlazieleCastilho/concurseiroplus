-- Replace the initial multi-provider billing surface with AbacatePay.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "abacatepayCustomerId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_abacatepayCustomerId_key" ON "users"("abacatepayCustomerId");

DROP INDEX IF EXISTS "plans_stripePriceId_key";
DROP INDEX IF EXISTS "plans_mercadoPagoPlanId_key";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "stripePriceId";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "mercadoPagoPlanId";
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "externalProductId" TEXT;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "abacatepayProductId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "plans_externalProductId_key" ON "plans"("externalProductId");
CREATE UNIQUE INDEX IF NOT EXISTS "plans_abacatepayProductId_key" ON "plans"("abacatepayProductId");

CREATE TYPE "PaymentProvider_new" AS ENUM ('ABACATEPAY');
ALTER TABLE "subscriptions" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING 'ABACATEPAY'::"PaymentProvider_new";
ALTER TABLE "payments" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING 'ABACATEPAY'::"PaymentProvider_new";
ALTER TABLE "invoices" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING 'ABACATEPAY'::"PaymentProvider_new";
DROP TYPE "PaymentProvider";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";

CREATE TABLE IF NOT EXISTS "webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'ABACATEPAY',
    "event" TEXT NOT NULL,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_eventId_key" ON "webhook_events"("eventId");
CREATE INDEX IF NOT EXISTS "webhook_events_provider_event_idx" ON "webhook_events"("provider", "event");
CREATE INDEX IF NOT EXISTS "webhook_events_processedAt_idx" ON "webhook_events"("processedAt");
