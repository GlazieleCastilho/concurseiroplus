import { NextResponse } from "next/server";
import { verifyPagarmeWebhookAuth } from "@/lib/pagarme";
import { recordAndProcessPagarmeWebhook } from "@/services/pagarme-webhook-service";

export async function POST(req: Request) {
  try {
    if (!verifyPagarmeWebhookAuth(req.headers.get("authorization"))) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const result = await recordAndProcessPagarmeWebhook(payload);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error" }, { status: 400 });
  }
}
