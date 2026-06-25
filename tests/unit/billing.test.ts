import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { paymentStatusForAbacatePayEvent, verifyAbacatePaySignature } from "@/lib/abacatepay";
import { abacatepayProductCycle, accessPeriodEnd, isRecurringCycle, planExternalProductId } from "@/lib/billing-period";

describe("AbacatePay billing", () => {
  it("calculates access periods for recurring, prepaid and lifetime cycles", () => {
    const start = new Date("2026-06-25T12:00:00.000Z");

    expect(accessPeriodEnd("MENSAL", start)?.toISOString()).toBe("2026-07-25T12:00:00.000Z");
    expect(accessPeriodEnd("TRIMESTRAL", start)?.toISOString()).toBe("2026-09-25T12:00:00.000Z");
    expect(accessPeriodEnd("ANUAL", start)?.toISOString()).toBe("2027-06-25T12:00:00.000Z");
    expect(accessPeriodEnd("VITALICIO", start)).toBeNull();
  });

  it("maps product cycles and external product ids for AbacatePay", () => {
    expect(planExternalProductId("PRO", "MENSAL")).toBe("concurseiroplus-pro-mensal");
    expect(abacatepayProductCycle("MENSAL")).toBe("MONTHLY");
    expect(abacatepayProductCycle("ANUAL")).toBe("ANNUALLY");
    expect(abacatepayProductCycle("TRIMESTRAL")).toBeNull();
    expect(isRecurringCycle("VITALICIO")).toBe(false);
  });

  it("validates AbacatePay HMAC signatures with timing-safe comparison", () => {
    const rawBody = JSON.stringify({ id: "log_123", event: "checkout.completed" });
    const publicKey = "test_public_key";
    const signature = crypto.createHmac("sha256", publicKey).update(Buffer.from(rawBody, "utf8")).digest("base64");

    expect(verifyAbacatePaySignature(rawBody, signature, publicKey)).toBe(true);
    expect(verifyAbacatePaySignature(rawBody, "invalid", publicKey)).toBe(false);
  });

  it("maps AbacatePay events to internal payment statuses", () => {
    expect(paymentStatusForAbacatePayEvent("checkout.completed")).toBe("APPROVED");
    expect(paymentStatusForAbacatePayEvent("subscription.renewed")).toBe("APPROVED");
    expect(paymentStatusForAbacatePayEvent("checkout.refunded")).toBe("REFUNDED");
    expect(paymentStatusForAbacatePayEvent("checkout.disputed")).toBe("CHARGEBACK");
    expect(paymentStatusForAbacatePayEvent("checkout.lost")).toBe("CANCELED");
    expect(paymentStatusForAbacatePayEvent("unknown.event")).toBeNull();
  });
});
