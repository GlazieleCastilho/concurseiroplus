import type { BillingCycle, PlanTier } from "@/generated/prisma";

export type AbacatePayProductCycle = "MONTHLY" | "ANNUALLY";

export function planExternalProductId(tier: PlanTier, cycle: BillingCycle): string {
  return `concurseiroplus-${tier.toLowerCase()}-${cycle.toLowerCase()}`;
}

export function abacatepayProductCycle(cycle: BillingCycle): AbacatePayProductCycle | null {
  if (cycle === "MENSAL") return "MONTHLY";
  if (cycle === "ANUAL") return "ANNUALLY";
  return null;
}

export function isRecurringCycle(cycle: BillingCycle): boolean {
  return cycle === "MENSAL" || cycle === "ANUAL";
}

export function accessPeriodEnd(cycle: BillingCycle, from: Date): Date | null {
  if (cycle === "VITALICIO") return null;

  const end = new Date(from);
  if (cycle === "MENSAL") end.setMonth(end.getMonth() + 1);
  if (cycle === "TRIMESTRAL") end.setMonth(end.getMonth() + 3);
  if (cycle === "ANUAL") end.setFullYear(end.getFullYear() + 1);
  return end;
}
