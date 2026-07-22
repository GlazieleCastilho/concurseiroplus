import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { POST as pagarmeWebhookPost } from "@/app/api/webhooks/pagarme/route";
import { auditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentDbUser } from "@/lib/clerk";
import { createCheckout } from "@/services/billing-service";
import { recordAndProcessPagarmeWebhook } from "@/services/pagarme-webhook-service";

vi.mock("@/lib/clerk", () => ({
  getCurrentDbUser: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  auditLog: vi.fn(),
}));

vi.mock("@/services/billing-service", () => ({
  createCheckout: vi.fn(),
}));

vi.mock("@/services/pagarme-webhook-service", () => ({
  recordAndProcessPagarmeWebhook: vi.fn(),
}));

const mockedGetCurrentDbUser = vi.mocked(getCurrentDbUser);
const mockedRateLimit = vi.mocked(rateLimit);
const mockedAuditLog = vi.mocked(auditLog);
const mockedCreateCheckout = vi.mocked(createCheckout);
const mockedRecordAndProcessWebhook = vi.mocked(recordAndProcessPagarmeWebhook);

function basicAuthHeader(user: string, password: string): string {
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

describe("billing routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAGARME_WEBHOOK_USER = "webhook-user";
    process.env.PAGARME_WEBHOOK_PASSWORD = "webhook-password";
  });

  it("creates Pagar.me checkout without provider input", async () => {
    const user = {
      id: "user_1",
      clerkUserId: "clerk_1",
      firstName: "Glaziele",
      lastName: "Castilho",
      email: "glaziele@example.com",
      imageUrl: null,
      pagarmeCustomerId: null,
      role: "user",
      planTier: "ESSENCIAL",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const;

    mockedGetCurrentDbUser.mockResolvedValue(user);
    mockedRateLimit.mockResolvedValue(undefined);
    mockedAuditLog.mockResolvedValue(undefined);
    mockedCreateCheckout.mockResolvedValue({ checkoutUrl: "https://payment-link.pagar.me/pl_123", paymentId: "pay_123" });

    const request = new Request("http://localhost:3000/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tier: "PRO", cycle: "MENSAL" }),
    });

    const response = await checkoutPost(request);
    await expect(response.json()).resolves.toEqual({ checkoutUrl: "https://payment-link.pagar.me/pl_123", paymentId: "pay_123" });
    expect(response.status).toBe(200);
    expect(mockedCreateCheckout).toHaveBeenCalledWith({ user, tier: "PRO", cycle: "MENSAL" });
  });

  it("rejects Pagar.me webhook without valid Basic Auth", async () => {
    const request = new Request("http://localhost:3000/api/webhooks/pagarme", {
      method: "POST",
      headers: { authorization: basicAuthHeader("wrong-user", "wrong-password") },
      body: JSON.stringify({ id: "evt_1", type: "order.paid" }),
    });

    const response = await pagarmeWebhookPost(request);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized webhook" });
    expect(response.status).toBe(401);
    expect(mockedRecordAndProcessWebhook).not.toHaveBeenCalled();
  });

  it("accepts authenticated duplicate Pagar.me webhook idempotently", async () => {
    const rawBody = JSON.stringify({ id: "evt_1", type: "order.paid", data: { metadata: { paymentId: "pay_123" } } });
    mockedRecordAndProcessWebhook.mockResolvedValue({ duplicate: true });

    const request = new Request("http://localhost:3000/api/webhooks/pagarme", {
      method: "POST",
      headers: { authorization: basicAuthHeader("webhook-user", "webhook-password") },
      body: rawBody,
    });

    const response = await pagarmeWebhookPost(request);
    await expect(response.json()).resolves.toEqual({ received: true, duplicate: true });
    expect(response.status).toBe(200);
    expect(mockedRecordAndProcessWebhook).toHaveBeenCalledWith(JSON.parse(rawBody));
  });
});
