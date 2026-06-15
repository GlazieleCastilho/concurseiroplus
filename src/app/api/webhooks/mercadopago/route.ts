import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const paymentId = payload?.data?.id ? String(payload.data.id) : payload?.external_reference;
    if (!paymentId) return NextResponse.json({ received: true });

    const statusMap: Record<string, "APPROVED" | "FAILED" | "CANCELED" | "REFUNDED" | "CHARGEBACK" | "PENDING"> = {
      approved: "APPROVED",
      rejected: "FAILED",
      cancelled: "CANCELED",
      refunded: "REFUNDED",
      charged_back: "CHARGEBACK",
      pending: "PENDING",
    };
    const status = statusMap[payload.status as string] ?? "PENDING";

    const payment = await prisma.payment.updateMany({
      where: { OR: [{ id: paymentId }, { externalPaymentId: paymentId }] },
      data: { status, rawPayload: payload, paidAt: status === "APPROVED" ? new Date() : undefined },
    });

    return NextResponse.json({ received: true, updated: payment.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error" }, { status: 400 });
  }
}
