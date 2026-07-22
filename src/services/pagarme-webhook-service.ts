import { Prisma } from "@/generated/prisma";
import type { BillingCycle, PrismaClient } from "@/generated/prisma";
import { accessPeriodEnd } from "@/lib/billing-period";
import { prisma } from "@/lib/prisma";

type TransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Formato confirmado pela documentacao (id, type, created_at, data):
 * https://docs.pagar.me/reference/eventos-de-webhook-1. O conteudo interno de `data`
 * nao foi possivel confirmar campo a campo via fetch automatizado - a extracao abaixo
 * e defensiva (tenta varios caminhos plausiveis) de proposito. Validar contra um
 * payload real do sandbox antes de producao.
 */
type PagarmeWebhookPayload = {
  id?: string;
  type?: string;
  created_at?: string;
  data?: {
    id?: string;
    code?: string;
    status?: string;
    amount?: number;
    metadata?: { paymentId?: string; userId?: string } | null;
    customer?: { id?: string; email?: string } | null;
    subscription?: { id?: string; status?: string; canceled_at?: string | null } | null;
    charges?: Array<{ id?: string; amount?: number; paid_amount?: number; status?: string; last_transaction?: { transaction_type?: string } }>;
    checkouts?: Array<{ id?: string; payment_url?: string }>;
    created_at?: string;
    updated_at?: string;
  };
  [key: string]: unknown;
};

function asJson(payload: PagarmeWebhookPayload): Prisma.InputJsonValue {
  return payload as Prisma.InputJsonValue;
}

function validDate(value: string | null | undefined, fallback = new Date()): Date {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function paymentReferences(payload: PagarmeWebhookPayload): string[] {
  return [
    payload.data?.metadata?.paymentId,
    payload.data?.code,
    payload.data?.id,
    ...(payload.data?.charges?.map((charge) => charge.id).filter((id): id is string => Boolean(id)) ?? []),
  ].filter((value): value is string => Boolean(value));
}

async function findPayment(tx: TransactionClient, payload: PagarmeWebhookPayload) {
  const references = paymentReferences(payload);
  if (references.length === 0) return null;

  return tx.payment.findFirst({
    where: { OR: [{ id: { in: references } }, { externalPaymentId: { in: references } }] },
    include: { plan: true },
  });
}

function receivedAmountCents(payload: PagarmeWebhookPayload, fallback: number): number {
  const charge = payload.data?.charges?.[0];
  return charge?.paid_amount ?? charge?.amount ?? payload.data?.amount ?? fallback;
}

async function createPaidInvoice(tx: TransactionClient, input: {
  userId: string;
  subscriptionId?: string;
  paymentId: string;
  externalInvoiceId: string;
  amountCents: number;
  paidAt: Date;
}) {
  await tx.invoice.upsert({
    where: { externalInvoiceId: input.externalInvoiceId },
    update: { status: "PAID", amountPaidCents: input.amountCents, paidAt: input.paidAt },
    create: {
      userId: input.userId,
      subscriptionId: input.subscriptionId,
      paymentId: input.paymentId,
      provider: "PAGARME",
      status: "PAID",
      amountDueCents: input.amountCents,
      amountPaidCents: input.amountCents,
      externalInvoiceId: input.externalInvoiceId,
      paidAt: input.paidAt,
    },
  });
}

async function approvePayment(
  tx: TransactionClient,
  payload: PagarmeWebhookPayload,
  existingPayment?: Awaited<ReturnType<typeof findPayment>>
) {
  const payment = existingPayment ?? (await findPayment(tx, payload));
  if (!payment?.plan) throw new Error("Pagar.me payment or plan not found");

  const paidAt = validDate(payload.data?.updated_at ?? payload.created_at);
  const periodEnd = accessPeriodEnd(payment.plan.cycle, paidAt);
  const externalSubscriptionId = payload.data?.subscription?.id ?? `access_${payment.id}`;
  const externalPaymentId = payload.data?.id ?? payment.externalPaymentId;
  const amountCents = receivedAmountCents(payload, payment.amountCents);

  const updatedPayment = await tx.payment.update({
    where: { id: payment.id },
    data: { status: "APPROVED", externalPaymentId, rawPayload: asJson(payload), paidAt },
  });

  const subscription = await tx.subscription.upsert({
    where: { externalSubscriptionId },
    update: {
      planId: payment.planId,
      planTier: payment.plan.tier,
      billingCycle: payment.plan.cycle,
      provider: "PAGARME",
      status: payment.plan.cycle === "VITALICIO" ? "LIFETIME" : "ACTIVE",
      externalCustomerId: payload.data?.customer?.id,
      currentPeriodStart: paidAt,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      metadata: { sourcePaymentId: payment.id, orderId: payload.data?.id },
    },
    create: {
      userId: payment.userId,
      planId: payment.planId,
      planTier: payment.plan.tier,
      billingCycle: payment.plan.cycle,
      provider: "PAGARME",
      status: payment.plan.cycle === "VITALICIO" ? "LIFETIME" : "ACTIVE",
      externalCustomerId: payload.data?.customer?.id,
      externalSubscriptionId,
      currentPeriodStart: paidAt,
      currentPeriodEnd: periodEnd,
      metadata: { sourcePaymentId: payment.id, orderId: payload.data?.id },
    },
  });

  await tx.user.update({ where: { id: payment.userId }, data: { planTier: payment.plan.tier } });

  await createPaidInvoice(tx, {
    userId: payment.userId,
    subscriptionId: subscription.id,
    paymentId: updatedPayment.id,
    externalInvoiceId: `pagarme_${externalPaymentId ?? payment.id}`,
    amountCents,
    paidAt,
  });
}

async function reversePayment(tx: TransactionClient, payload: PagarmeWebhookPayload, status: "FAILED" | "CANCELED" | "REFUNDED" | "CHARGEBACK") {
  const payment = await findPayment(tx, payload);
  if (!payment) return;

  await tx.payment.update({ where: { id: payment.id }, data: { status, rawPayload: asJson(payload) } });

  const subscriptions = await tx.subscription.findMany({
    where: { userId: payment.userId, metadata: { path: ["sourcePaymentId"], equals: payment.id } },
  });

  if (subscriptions.length > 0) {
    await tx.subscription.updateMany({
      where: { id: { in: subscriptions.map((subscription) => subscription.id) } },
      data: { status: "CANCELED", canceledAt: new Date(), cancelAtPeriodEnd: false },
    });
    await tx.user.update({ where: { id: payment.userId }, data: { planTier: "ESSENCIAL" } });
  }
}

/**
 * O Pagar.me nao tem um evento explicito de "renovacao" separado: cada cobranca de
 * assinatura recorrente chega como um novo order.paid vinculado a subscription.id, sem
 * um Payment previamente criado no nosso banco (esse so existe para o checkout inicial).
 * Diferente do approvePayment(), aqui a busca e pela ASSINATURA, nao pelo pagamento.
 */
async function renewSubscription(tx: TransactionClient, payload: PagarmeWebhookPayload) {
  const externalSubscriptionId = payload.data?.subscription?.id;
  if (!externalSubscriptionId) throw new Error("Pagar.me subscription id missing");

  const subscription = await tx.subscription.findUnique({ where: { externalSubscriptionId }, include: { plan: true } });
  if (!subscription) throw new Error("Subscription not found for Pagar.me renewal");

  const paidAt = validDate(payload.data?.updated_at ?? payload.created_at);
  const periodEnd = accessPeriodEnd(subscription.billingCycle as BillingCycle, paidAt);
  const externalPaymentId = payload.data?.id ?? `${externalSubscriptionId}_${paidAt.toISOString()}`;
  const amountCents = receivedAmountCents(payload, subscription.plan?.priceCents ?? 0);

  const payment = await tx.payment.upsert({
    where: { externalPaymentId },
    update: { status: "APPROVED", amountCents, rawPayload: asJson(payload), paidAt },
    create: {
      userId: subscription.userId,
      planId: subscription.planId,
      provider: "PAGARME",
      status: "APPROVED",
      amountCents,
      externalPaymentId,
      rawPayload: asJson(payload),
      paidAt,
    },
  });

  await tx.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "ACTIVE",
      currentPeriodStart: paidAt,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      metadata: { renewedAt: paidAt.toISOString(), lastPaymentId: payment.id },
    },
  });

  await tx.user.update({ where: { id: subscription.userId }, data: { planTier: subscription.planTier } });
  await createPaidInvoice(tx, {
    userId: subscription.userId,
    subscriptionId: subscription.id,
    paymentId: payment.id,
    externalInvoiceId: `pagarme_${externalPaymentId}`,
    amountCents,
    paidAt,
  });
}

async function cancelSubscription(tx: TransactionClient, payload: PagarmeWebhookPayload) {
  const externalSubscriptionId = payload.data?.subscription?.id ?? payload.data?.id;
  if (!externalSubscriptionId) return;

  const subscription = await tx.subscription.findUnique({ where: { externalSubscriptionId } });
  if (!subscription) return;

  const canceledAt = validDate(payload.data?.subscription?.canceled_at ?? payload.data?.updated_at);
  await tx.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "CANCELED",
      canceledAt,
      cancelAtPeriodEnd: Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date()),
    },
  });

  if (!subscription.currentPeriodEnd || subscription.currentPeriodEnd <= new Date()) {
    await tx.user.update({ where: { id: subscription.userId }, data: { planTier: "ESSENCIAL" } });
  }
}

async function processWebhookPayload(tx: TransactionClient, payload: PagarmeWebhookPayload) {
  switch (payload.type) {
    case "order.paid": {
      const existingPayment = await findPayment(tx, payload);
      const isRecurringCharge = Boolean(payload.data?.subscription?.id) && !existingPayment;
      if (isRecurringCharge) await renewSubscription(tx, payload);
      else await approvePayment(tx, payload, existingPayment);
      break;
    }
    case "order.payment_failed":
      await reversePayment(tx, payload, "FAILED");
      break;
    case "order.canceled":
      await reversePayment(tx, payload, "CANCELED");
      break;
    case "charge.refunded":
      await reversePayment(tx, payload, "REFUNDED");
      break;
    case "chargeback.received":
      await reversePayment(tx, payload, "CHARGEBACK");
      break;
    case "subscription.canceled":
      await cancelSubscription(tx, payload);
      break;
    default:
      break;
  }
}

async function upsertWebhookEvent(payload: PagarmeWebhookPayload) {
  if (!payload.id || !payload.type) throw new Error("Invalid Pagar.me webhook payload");

  try {
    return await prisma.webhookEvent.create({
      data: { eventId: payload.id, event: payload.type, provider: "PAGARME", payload: asJson(payload) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.webhookEvent.findUniqueOrThrow({ where: { eventId: payload.id } });
    }
    throw error;
  }
}

export async function recordAndProcessPagarmeWebhook(payload: PagarmeWebhookPayload) {
  const webhookEvent = await upsertWebhookEvent(payload);
  if (webhookEvent.processedAt) return { duplicate: true };

  try {
    await prisma.$transaction(async (tx) => {
      await processWebhookPayload(tx, payload);
      await tx.webhookEvent.update({ where: { id: webhookEvent.id }, data: { processedAt: new Date(), error: null } });
    });
    return { duplicate: false };
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { error: error instanceof Error ? error.message : "Unknown webhook processing error" },
    });
    throw error;
  }
}
