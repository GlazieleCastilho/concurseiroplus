import type { BillingCycle, Plan, PlanTier, User } from "@/generated/prisma";
import { abacatepayProductCycle, isRecurringCycle, planExternalProductId } from "@/lib/billing-period";
import { prisma } from "@/lib/prisma";
import { plans, priceForCycle } from "@/lib/product";
import { abacatepayRequest, AbacatePayError, type AbacatePayCheckout, type AbacatePayCustomer, type AbacatePayProduct } from "@/lib/abacatepay";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function resolvePlan(tier: PlanTier, cycle: BillingCycle) {
  const plan = await prisma.plan.findUnique({ where: { tier_cycle: { tier, cycle } } });
  if (plan) return plan;
  const definition = plans.find((item) => item.tier === tier);
  if (!definition) throw new Response("Unknown plan", { status: 422 });
  return prisma.plan.create({
    data: {
      tier,
      cycle,
      name: definition.name,
      description: definition.tagline,
      priceCents: priceForCycle(definition, cycle),
      essayLimit: definition.limits.essaysPerMonth,
      discursiveLimit: definition.limits.discursivePerMonth,
      skillsLimit: definition.limits.skills,
      features: definition.features,
      externalProductId: planExternalProductId(tier, cycle),
    },
  });
}

async function getOrCreateCustomer(user: User): Promise<string> {
  if (user.abacatepayCustomerId) return user.abacatepayCustomerId;

  const customer = await abacatepayRequest<AbacatePayCustomer>("/customers/create", {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
      metadata: {
        userId: user.id,
        clerkUserId: user.clerkUserId,
      },
    }),
  });

  await prisma.user.update({ where: { id: user.id }, data: { abacatepayCustomerId: customer.id } });
  return customer.id;
}

async function findAbacatePayProduct(externalProductId: string): Promise<AbacatePayProduct | null> {
  try {
    return await abacatepayRequest<AbacatePayProduct>(`/products/get?externalId=${encodeURIComponent(externalProductId)}`);
  } catch (error) {
    if (error instanceof AbacatePayError && error.status === 404) return null;
    throw error;
  }
}

async function ensureAbacatePayProduct(plan: Plan): Promise<Plan> {
  if (plan.abacatepayProductId && plan.externalProductId) return plan;

  const externalProductId = plan.externalProductId ?? planExternalProductId(plan.tier, plan.cycle);
  const existing = await findAbacatePayProduct(externalProductId);
  const product = existing ?? await abacatepayRequest<AbacatePayProduct>("/products/create", {
    method: "POST",
    body: JSON.stringify({
      externalId: externalProductId,
      name: `Concurseiro+ ${plan.name} ${plan.cycle.toLowerCase()}`,
      description: plan.description,
      price: plan.priceCents,
      currency: "BRL",
      cycle: abacatepayProductCycle(plan.cycle) ?? undefined,
    }),
  });

  return prisma.plan.update({
    where: { id: plan.id },
    data: {
      externalProductId,
      abacatepayProductId: product.id,
    },
  });
}

export async function createCheckout(input: {
  user: User;
  tier: PlanTier;
  cycle: BillingCycle;
}): Promise<{ checkoutUrl: string; paymentId: string }> {
  const plan = await ensureAbacatePayProduct(await resolvePlan(input.tier, input.cycle));
  if (!plan.abacatepayProductId) throw new Error("AbacatePay product was not synchronized");

  const customerId = await getOrCreateCustomer(input.user);
  const payment = await prisma.payment.create({
    data: {
      userId: input.user.id,
      planId: plan.id,
      provider: "ABACATEPAY",
      amountCents: plan.priceCents,
      status: "PENDING",
    },
  });

  const checkoutPath = isRecurringCycle(input.cycle) ? "/subscriptions/create" : "/checkouts/create";
  const checkout = await abacatepayRequest<AbacatePayCheckout>(checkoutPath, {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          id: plan.abacatepayProductId,
          quantity: 1,
        },
      ],
      customerId,
      externalId: payment.id,
      returnUrl: `${baseUrl()}/billing`,
      completionUrl: `${baseUrl()}/billing/sucesso`,
      methods: ["PIX", "CARD"],
      card: { maxInstallments: 12 },
      metadata: {
        paymentId: payment.id,
        userId: input.user.id,
        tier: input.tier,
        cycle: input.cycle,
      },
    }),
  });

  if (!checkout.url) throw new Error("AbacatePay did not return checkout URL");
  await prisma.payment.update({
    where: { id: payment.id },
    data: { checkoutUrl: checkout.url, externalPaymentId: checkout.id },
  });
  return { checkoutUrl: checkout.url, paymentId: payment.id };
}
