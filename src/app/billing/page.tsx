import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { getCurrentDbUser } from "@/lib/clerk";
import { billingCycles, formatCurrency, plans, planTiers, priceForCycle } from "@/lib/product";
import type { BillingCycle, PlanTier } from "@/generated/prisma";

type BillingPageProps = {
  searchParams?: Promise<{
    tier?: string;
    cycle?: string;
  }>;
};

function parseCycle(value: string | undefined): BillingCycle {
  return billingCycles.includes(value as BillingCycle) ? value as BillingCycle : "MENSAL";
}

function parseTier(value: string | undefined): PlanTier | null {
  return planTiers.includes(value as PlanTier) ? value as PlanTier : null;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const user = await getCurrentDbUser();
  const params = await searchParams;
  const cycle = parseCycle(params?.cycle);
  const selectedTier = parseTier(params?.tier);
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Seu plano atual: {user.planTier}</p>
        <h1 className="font-display text-3xl font-bold">Planos e cobranca</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ciclo selecionado: {cycle.toLowerCase()}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.tier} className={selectedTier === plan.tier || plan.popular ? "border-accent" : ""}>
            <CardHeader>
              <div className="flex justify-between gap-3">
                <CardTitle>{plan.name}</CardTitle>
                {selectedTier === plan.tier ? <Badge>Selecionado</Badge> : plan.tier === user.planTier ? <Badge>Atual</Badge> : plan.popular ? <Badge>Popular</Badge> : null}
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(priceForCycle(plan, cycle))}
                <span className="text-sm font-normal text-muted-foreground">
                  {cycle === "MENSAL" ? "/mes" : cycle === "ANUAL" ? "/ano" : cycle === "TRIMESTRAL" ? "/trimestre" : " vitalicio"}
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <p className="text-xs text-muted-foreground">Checkout seguro via AbacatePay: cartao nas assinaturas e Pix/cartao nos planos pre-pagos, com parcelamento em ate 12x.</p>
              <CheckoutButton tier={plan.tier} cycle={cycle} />
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
