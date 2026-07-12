import { NextResponse } from "next/server";
import { verifyAbacatePaySignature } from "@/lib/abacatepay";
import { recordAndProcessAbacatePayWebhook } from "@/services/abacatepay-webhook-service";

export async function POST(req: Request) {
  try {
    const webhookSecret = new URL(req.url).searchParams.get("webhookSecret");
    if (!process.env.ABACATEPAY_WEBHOOK_SECRET || webhookSecret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    if (!verifyAbacatePaySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const result = await recordAndProcessAbacatePayWebhook(payload);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error" }, { status: 400 });
  }
}
