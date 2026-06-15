import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const signature = req.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      const userId = session.metadata?.userId;
      if (paymentId && userId) {
        await prisma.payment.update({ where: { id: paymentId }, data: { status: "APPROVED", paidAt: new Date(), rawPayload: event as unknown as object } });
        await prisma.user.update({ where: { id: userId }, data: { planTier: session.metadata?.tier as "ESSENCIAL" | "PRO" | "ELITE" } });
        await prisma.subscription.create({
          data: {
            userId,
            planTier: session.metadata?.tier as "ESSENCIAL" | "PRO" | "ELITE",
            billingCycle: session.metadata?.cycle as "MENSAL" | "TRIMESTRAL" | "ANUAL" | "VITALICIO",
            provider: "STRIPE",
            status: session.mode === "payment" ? "LIFETIME" : "ACTIVE",
            externalCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            externalSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          },
        });
      }
    }

    if (["charge.refunded", "charge.dispute.created", "checkout.session.expired"].includes(event.type)) {
      const status = event.type === "charge.dispute.created" ? "CHARGEBACK" : event.type === "charge.refunded" ? "REFUNDED" : "CANCELED";
      const externalPaymentId = "id" in event.data.object ? String(event.data.object.id) : undefined;
      if (externalPaymentId) {
        await prisma.payment.updateMany({ where: { externalPaymentId }, data: { status } });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error" }, { status: 400 });
  }
}
