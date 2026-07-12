import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { rateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { billingCheckoutSchema } from "@/schemas/app-schemas";
import { createCheckout } from "@/services/billing-service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    await rateLimit("publicApi", user.id);
    const body = billingCheckoutSchema.parse(await req.json());
    const checkout = await createCheckout({ user, tier: body.tier, cycle: body.cycle });
    await auditLog({ userId: user.id, action: "billing.checkout", entity: "Payment", entityId: checkout.paymentId, metadata: body });
    return NextResponse.json(checkout);
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro no checkout" }, { status: 500 });
  }
}
