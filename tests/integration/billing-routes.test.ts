import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { POST as abacatepayWebhookPost } from "@/app/api/webhooks/abacatepay/route";
import { auditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentDbUser } from "@/lib/clerk";
import { createCheckout } from "@/services/billing-service";
import { recordAndProcessAbacatePayWebhook } from "@/services/abacatepay-webhook-service";

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

vi.mock("@/services/abacatepay-webhook-service", () => ({
  recordAndProcessAbacatePayWebhook: vi.fn(),
}));

const mockedGetCurrentDbUser = vi.mocked(getCurrentDbUser);
const mockedRateLimit = vi.mocked(rateLimit);
const mockedAuditLog = vi.mocked(auditLog);
const mockedCreateCheckout = vi.mocked(createCheckout);
const mockedRecordAndProcessWebhook = vi.mocked(recordAndProcessAbacatePayWebhook);

describe("billing routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ABACATEPAY_WEBHOOK_SECRET = "webhook-secret";
    process.env.ABACATEPAY_WEBHOOK_HMAC_SECRET = "webhook-public-key";
    process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY = "webhook-public-key";
  });

  it("creates AbacatePay checkout without provider input", async () => {
    const user = {
      id: "user_1",
      clerkUserId: "clerk_1",
      firstName: "Glaziele",
      lastName: "Castilho",
      email: "glaziele@example.com",
      imageUrl: null,
      abacatepayCustomerId: null,
      role: "user",
      planTier: "ESSENCIAL",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const;

    mockedGetCurrentDbUser.mockResolvedValue(user);
    mockedRateLimit.mockResolvedValue(undefined);
    mockedAuditLog.mockResolvedValue(undefined);
    mockedCreateCheckout.mockResolvedValue({ checkoutUrl: "https://pay.abacatepay.com/checkout_123", paymentId: "pay_123" });

    const request = new Request("http://localhost:3000/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tier: "PRO", cycle: "MENSAL" }),
    });

    const response = await checkoutPost(request);
    await expect(response.json()).resolves.toEqual({ checkoutUrl: "https://pay.abacatepay.com/checkout_123", paymentId: "pay_123" });
    expect(response.status).toBe(200);
    expect(mockedCreateCheckout).toHaveBeenCalledWith({ user, tier: "PRO", cycle: "MENSAL" });
  });

  it("rejects AbacatePay webhook with invalid signature", async () => {
    const request = new Request("http://localhost:3000/api/webhooks/abacatepay?webhookSecret=webhook-secret", {
      method: "POST",
      headers: { "x-webhook-signature": "invalid" },
      body: JSON.stringify({ id: "evt_1", event: "checkout.completed" }),
    });

    const response = await abacatepayWebhookPost(request);
    await expect(response.json()).resolves.toEqual({ error: "Invalid webhook signature" });
    expect(response.status).toBe(401);
    expect(mockedRecordAndProcessWebhook).not.toHaveBeenCalled();
  });

  it("accepts signed duplicate AbacatePay webhook idempotently", async () => {
    const rawBody = JSON.stringify({ id: "evt_1", event: "checkout.completed", data: { checkout: { externalId: "pay_123" } } });
    const signature = crypto.createHmac("sha256", "webhook-public-key").update(Buffer.from(rawBody, "utf8")).digest("base64");
    mockedRecordAndProcessWebhook.mockResolvedValue({ duplicate: true });

    const request = new Request("http://localhost:3000/api/webhooks/abacatepay?webhookSecret=webhook-secret", {
      method: "POST",
      headers: { "x-webhook-signature": signature },
      body: rawBody,
    });

    const response = await abacatepayWebhookPost(request);
    await expect(response.json()).resolves.toEqual({ received: true, duplicate: true });
    expect(response.status).toBe(200);
    expect(mockedRecordAndProcessWebhook).toHaveBeenCalledWith(JSON.parse(rawBody));
  });
});
