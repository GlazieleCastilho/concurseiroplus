import type { BillingCycle, PlanTier } from "@/generated/prisma";

export type PagarmePlanInterval = { unit: "month" | "year"; count: number };

export function planExternalProductId(tier: PlanTier, cycle: BillingCycle): string {
  return `concurseiroplus-${tier.toLowerCase()}-${cycle.toLowerCase()}`;
}

/**
 * Mapeia o ciclo interno pro par interval/interval_count exigido pelo Plans API do
 * Pagar.me (https://docs.pagar.me/reference/planos-1). Null para ciclos nao recorrentes.
 */
export function pagarmePlanInterval(cycle: BillingCycle): PagarmePlanInterval | null {
  if (cycle === "MENSAL") return { unit: "month", count: 1 };
  if (cycle === "ANUAL") return { unit: "year", count: 1 };
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
