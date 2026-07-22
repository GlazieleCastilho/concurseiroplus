import crypto from "node:crypto";
import type { PaymentStatus } from "@/generated/prisma";

export const PAGARME_API_BASE_URL = "https://api.pagar.me/core/v5";

export class PagarmeError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "PagarmeError";
  }
}

export type PagarmePlan = {
  id: string;
  name: string;
  status: string;
};

export type PagarmePaymentLink = {
  id: string;
  url: string;
  status: string;
};

/**
 * Pagar.me v5 usa Basic Auth com a secret key como usuario e senha vazia
 * (https://docs.pagar.me/reference/autenticacao), diferente do Bearer token do AbacatePay.
 */
function authHeader(): string {
  const secretKey = process.env.PAGARME_SECRET_KEY;
  if (!secretKey) throw new Response("PAGARME_SECRET_KEY is not configured", { status: 503 });
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function pagarmeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("authorization", authHeader());

  const response = await fetch(`${PAGARME_API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (payload as { message?: string })?.message ?? `Pagar.me request failed: ${path}`;
    throw new PagarmeError(message, response.status);
  }
  return payload as T;
}

/**
 * Pagar.me v5 nao assina o corpo do webhook com HMAC (diferente do AbacatePay). A
 * autenticidade e garantida por Basic Auth cadastrado na propria URL do webhook
 * (https://usuario:senha@dominio.com/webhook), que o Pagar.me reenvia como header
 * Authorization em toda chamada. Validamos comparando esse header, nao um HMAC.
 * https://docs.pagar.me/reference/visao-geral-sobre-webhooks
 */
export function verifyPagarmeWebhookAuth(authorizationHeader: string | null): boolean {
  const user = process.env.PAGARME_WEBHOOK_USER;
  const password = process.env.PAGARME_WEBHOOK_PASSWORD;
  if (!authorizationHeader || !user || !password) return false;
  const expected = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(authorizationHeader);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Eventos documentados em https://docs.pagar.me/reference/eventos-de-webhook-1.
 * charge.refunded/chargeback.received substituem checkout.refunded/checkout.disputed
 * do AbacatePay; nao ha um evento explicito de "renovacao" separado - cada cobranca
 * recorrente da assinatura chega como um novo order.paid vinculado ao subscription id.
 */
export function paymentStatusForPagarmeEvent(event: string): PaymentStatus | null {
  if (event === "order.paid") return "APPROVED";
  if (event === "order.payment_failed") return "FAILED";
  if (event === "order.canceled") return "CANCELED";
  if (event === "charge.refunded") return "REFUNDED";
  if (event === "chargeback.received") return "CHARGEBACK";
  return null;
}
