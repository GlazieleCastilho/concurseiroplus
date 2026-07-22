import { describe, expect, it } from "vitest";
import { paymentStatusForPagarmeEvent, verifyPagarmeWebhookAuth } from "@/lib/pagarme";
import { accessPeriodEnd, isRecurringCycle, pagarmePlanInterval, planExternalProductId } from "@/lib/billing-period";

describe("Pagar.me billing", () => {
  it("calculates access periods for recurring, prepaid and lifetime cycles", () => {
    const start = new Date("2026-06-25T12:00:00.000Z");

    expect(accessPeriodEnd("MENSAL", start)?.toISOString()).toBe("2026-07-25T12:00:00.000Z");
    expect(accessPeriodEnd("TRIMESTRAL", start)?.toISOString()).toBe("2026-09-25T12:00:00.000Z");
    expect(accessPeriodEnd("ANUAL", start)?.toISOString()).toBe("2027-06-25T12:00:00.000Z");
    expect(accessPeriodEnd("VITALICIO", start)).toBeNull();
  });

  it("maps product cycles and plan intervals for Pagar.me", () => {
    expect(planExternalProductId("PRO", "MENSAL")).toBe("concurseiroplus-pro-mensal");
    expect(pagarmePlanInterval("MENSAL")).toEqual({ unit: "month", count: 1 });
    expect(pagarmePlanInterval("ANUAL")).toEqual({ unit: "year", count: 1 });
    expect(pagarmePlanInterval("TRIMESTRAL")).toBeNull();
    expect(isRecurringCycle("VITALICIO")).toBe(false);
  });

  it("validates Pagar.me webhook Basic Auth (URL-embedded credentials, no HMAC)", () => {
    process.env.PAGARME_WEBHOOK_USER = "webhook-user";
    process.env.PAGARME_WEBHOOK_PASSWORD = "webhook-password";
    const authHeader = `Basic ${Buffer.from("webhook-user:webhook-password").toString("base64")}`;

    expect(verifyPagarmeWebhookAuth(authHeader)).toBe(true);
    expect(verifyPagarmeWebhookAuth(`Basic ${Buffer.from("webhook-user:wrong").toString("base64")}`)).toBe(false);
    expect(verifyPagarmeWebhookAuth(null)).toBe(false);
  });

  it("maps Pagar.me events to internal payment statuses", () => {
    expect(paymentStatusForPagarmeEvent("order.paid")).toBe("APPROVED");
    expect(paymentStatusForPagarmeEvent("order.payment_failed")).toBe("FAILED");
    expect(paymentStatusForPagarmeEvent("order.canceled")).toBe("CANCELED");
    expect(paymentStatusForPagarmeEvent("charge.refunded")).toBe("REFUNDED");
    expect(paymentStatusForPagarmeEvent("chargeback.received")).toBe("CHARGEBACK");
    expect(paymentStatusForPagarmeEvent("unknown.event")).toBeNull();
  });
});
