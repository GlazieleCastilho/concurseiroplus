import type { BillingCycle, Plan, PlanTier, User } from "@/generated/prisma";
import { isRecurringCycle, pagarmePlanInterval, planExternalProductId } from "@/lib/billing-period";
import { prisma } from "@/lib/prisma";
import { plans, priceForCycle } from "@/lib/product";
import { pagarmeRequest, type PagarmePaymentLink, type PagarmePlan } from "@/lib/pagarme";

/** Ate 12x, seguindo a mesma trava de parcelamento maximo que ja existia no AbacatePay. */
const MAX_INSTALLMENTS = 12;

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

/**
 * Assinatura recorrente no Pagar.me precisa de um Plan pre-criado (POST /plans) para
 * referenciar por plan_id no link de pagamento - nao existe equivalente a criar produto
 * "on the fly" a cada checkout como no AbacatePay. Sincroniza uma vez e cacheia o id.
 * https://docs.pagar.me/reference/planos-1
 */
async function ensurePagarmePlan(plan: Plan): Promise<Plan> {
  if (plan.pagarmePlanId) return plan;

  const interval = pagarmePlanInterval(plan.cycle);
  if (!interval) throw new Error(`Cycle ${plan.cycle} is not recurring, cannot create a Pagar.me plan`);

  const pagarmePlan = await pagarmeRequest<PagarmePlan>("/plans", {
    method: "POST",
    body: JSON.stringify({
      name: `Concurseiro+ ${plan.name} ${plan.cycle.toLowerCase()}`,
      description: plan.description,
      shippable: false,
      payment_methods: ["credit_card"],
      currency: "BRL",
      interval: interval.unit,
      interval_count: interval.count,
      billing_type: "prepaid",
      installments: Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1),
      items: [
        {
          name: plan.name,
          quantity: 1,
          pricing_scheme: { price: plan.priceCents, scheme_type: "unit" },
        },
      ],
    }),
  });

  return prisma.plan.update({ where: { id: plan.id }, data: { pagarmePlanId: pagarmePlan.id } });
}

/**
 * Link de pagamento hospedado pelo Pagar.me (equivalente ao checkout.url do AbacatePay).
 * https://docs.pagar.me/reference/checkout-link - os nomes de campo abaixo seguem a
 * documentacao oficial, mas nao foi possivel confirmar o schema literal exato via
 * fetch automatizado (paginas renderizadas em JS); validar contra o sandbox do
 * Pagar.me antes de ir pra producao.
 */
async function createPagarmePaymentLink(input: {
  paymentId: string;
  amountCents: number;
  name: string;
  recurring: boolean;
  pagarmePlanId?: string | null;
  user: User;
}): Promise<PagarmePaymentLink> {
  const acceptedMethods = input.recurring ? ["credit_card"] : ["credit_card", "pix"];

  const body: Record<string, unknown> = {
    type: input.recurring ? "subscription" : "order",
    name: input.name,
    is_building: false,
    payment_settings: {
      accepted_payment_methods: acceptedMethods,
      credit_card_settings: {
        operation_type: "auth_and_capture",
        installments: Array.from({ length: MAX_INSTALLMENTS }, (_, i) => ({
          number: i + 1,
          total: input.amountCents,
        })),
      },
      ...(acceptedMethods.includes("pix") ? { pix_settings: { expires_in: 3600 } } : {}),
    },
    customer_settings: {
      customer: { email: input.user.email, name: `${input.user.firstName} ${input.user.lastName ?? ""}`.trim() },
    },
    metadata: { paymentId: input.paymentId, userId: input.user.id },
    // Campo/formato de redirecionamento pos-pagamento nao confirmado na documentacao
    // publica (pode estar sob outro nome ou so configuravel pelo dashboard) - validar
    // no sandbox e ajustar antes de producao.
    checkout_settings: {
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing/sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing`,
    },
  };

  if (input.recurring) {
    body.cart_settings = { recurrences: [{ plan_id: input.pagarmePlanId, start_in: 0 }] };
  } else {
    body.cart_settings = { items: [{ amount: input.amountCents, name: input.name, default_quantity: 1 }] };
  }

  return pagarmeRequest<PagarmePaymentLink>("/paymentlinks", { method: "POST", body: JSON.stringify(body) });
}

export async function createCheckout(input: {
  user: User;
  tier: PlanTier;
  cycle: BillingCycle;
}): Promise<{ checkoutUrl: string; paymentId: string }> {
  let plan = await resolvePlan(input.tier, input.cycle);
  const recurring = isRecurringCycle(input.cycle);
  if (recurring) plan = await ensurePagarmePlan(plan);

  const payment = await prisma.payment.create({
    data: {
      userId: input.user.id,
      planId: plan.id,
      provider: "PAGARME",
      amountCents: plan.priceCents,
      status: "PENDING",
    },
  });

  const paymentLink = await createPagarmePaymentLink({
    paymentId: payment.id,
    amountCents: plan.priceCents,
    name: `Concurseiro+ ${plan.name}`,
    recurring,
    pagarmePlanId: plan.pagarmePlanId,
    user: input.user,
  });

  if (!paymentLink.url) throw new Error("Pagar.me did not return a checkout URL");
  await prisma.payment.update({
    where: { id: payment.id },
    data: { checkoutUrl: paymentLink.url, externalPaymentId: paymentLink.id },
  });
  return { checkoutUrl: paymentLink.url, paymentId: payment.id };
}
