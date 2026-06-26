import crypto from "node:crypto";
import type { PaymentStatus } from "@/generated/prisma";

export const ABACATEPAY_API_BASE_URL = "https://api.abacatepay.com/v2";

type AbacatePayEnvelope<T> = {
  data: T;
  success: boolean;
  error: string | null;
};

export type AbacatePayProduct = {
  id: string;
  externalId: string;
  name: string;
  price: number;
  currency: "BRL";
  cycle: string | null;
};

export type AbacatePayCustomer = {
  id: string;
  email: string;
  name?: string | null;
};

export type AbacatePayCheckout = {
  id: string;
  externalId: string | null;
  url: string;
  amount: number;
  status: string;
  customerId: string | null;
};

export class AbacatePayError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AbacatePayError";
  }
}

export function verifyAbacatePaySignature(
  rawBody: string,
  signatureFromHeader: string | null,
  signingSecret = process.env.ABACATEPAY_WEBHOOK_HMAC_SECRET ?? process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY
): boolean {
  if (!signatureFromHeader || !signingSecret) return false;
  const expectedSignature = crypto.createHmac("sha256", signingSecret).update(Buffer.from(rawBody, "utf8")).digest("base64");
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signatureFromHeader);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function paymentStatusForAbacatePayEvent(event: string): PaymentStatus | null {
  if (event === "checkout.completed" || event === "subscription.completed" || event === "subscription.renewed") return "APPROVED";
  if (event === "checkout.refunded") return "REFUNDED";
  if (event === "checkout.disputed") return "CHARGEBACK";
  if (event === "checkout.lost") return "CANCELED";
  return null;
}

export async function abacatepayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.ABACATEPAY_API_KEY;
  if (!token) throw new Response("ABACATEPAY_API_KEY is not configured", { status: 503 });
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${ABACATEPAY_API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as AbacatePayEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new AbacatePayError(payload?.error ?? `AbacatePay request failed: ${path}`, response.status);
  }

  return payload.data;
}
