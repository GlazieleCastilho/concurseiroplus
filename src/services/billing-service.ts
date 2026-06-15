import Stripe from "stripe";
import { MercadoPagoConfig, Preference } from "mercadopago";
import type { BillingCycle, PaymentProvider, PlanTier, User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { plans, priceForCycle } from "@/lib/product";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function stripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Response("STRIPE_SECRET_KEY is not configured", { status: 503 });
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function mercadoPagoPreference(): Preference {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Response("MERCADO_PAGO_ACCESS_TOKEN is not configured", { status: 503 });
  }
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
  return new Preference(client);
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
    },
  });
}

export async function createCheckout(input: {
  user: User;
  tier: PlanTier;
  cycle: BillingCycle;
  provider: PaymentProvider;
}): Promise<{ checkoutUrl: string; paymentId: string }> {
  const plan = await resolvePlan(input.tier, input.cycle);
  const payment = await prisma.payment.create({
    data: {
      userId: input.user.id,
      planId: plan.id,
      provider: input.provider,
      amountCents: plan.priceCents,
      status: "PENDING",
    },
  });

  if (input.provider === "STRIPE") {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: input.cycle === "VITALICIO" ? "payment" : "subscription",
      customer_email: input.user.email,
      client_reference_id: input.user.id,
      success_url: `${baseUrl()}/billing/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/billing/cancelado`,
      metadata: {
        paymentId: payment.id,
        userId: input.user.id,
        tier: input.tier,
        cycle: input.cycle,
      },
      line_items: [
        plan.stripePriceId
          ? { price: plan.stripePriceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "brl",
                unit_amount: plan.priceCents,
                recurring: input.cycle === "VITALICIO" ? undefined : { interval: input.cycle === "ANUAL" ? "year" : "month", interval_count: input.cycle === "TRIMESTRAL" ? 3 : 1 },
                product_data: { name: `Concurseiro+ ${plan.name} ${input.cycle.toLowerCase()}` },
              },
            },
      ],
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: session.url, externalPaymentId: session.id },
    });
    if (!session.url) throw new Error("Stripe did not return checkout URL");
    return { checkoutUrl: session.url, paymentId: payment.id };
  }

  const preference = mercadoPagoPreference();
  const response = await preference.create({
    body: {
      external_reference: payment.id,
      back_urls: {
        success: `${baseUrl()}/billing/sucesso`,
        pending: `${baseUrl()}/billing/pendente`,
        failure: `${baseUrl()}/billing/cancelado`,
      },
      notification_url: `${baseUrl()}/api/webhooks/mercadopago`,
      items: [
        {
          id: plan.id,
          title: `Concurseiro+ ${plan.name} ${input.cycle.toLowerCase()}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: plan.priceCents / 100,
        },
      ],
      payer: { email: input.user.email, name: `${input.user.firstName} ${input.user.lastName ?? ""}`.trim() },
      metadata: {
        paymentId: payment.id,
        userId: input.user.id,
        tier: input.tier,
        cycle: input.cycle,
      },
    },
  });

  const checkoutUrl = response.init_point ?? response.sandbox_init_point;
  if (!checkoutUrl) throw new Error("Mercado Pago did not return checkout URL");
  await prisma.payment.update({
    where: { id: payment.id },
    data: { checkoutUrl, externalPaymentId: String(response.id) },
  });
  return { checkoutUrl, paymentId: payment.id };
}
