import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { getCurrentDbUser } from "@/lib/clerk";
import { formatCurrency, plans, priceForCycle } from "@/lib/product";

export default async function BillingPage() {
  const user = await getCurrentDbUser();
  const cycle = "MENSAL" as const;
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Seu plano atual: {user.planTier}</p>
        <h1 className="font-display text-3xl font-bold">Planos e cobranca</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.tier} className={plan.popular ? "border-accent" : ""}>
            <CardHeader>
              <div className="flex justify-between gap-3">
                <CardTitle>{plan.name}</CardTitle>
                {plan.tier === user.planTier ? <Badge>Atual</Badge> : plan.popular ? <Badge>Popular</Badge> : null}
              </div>
              <p className="text-3xl font-bold">{formatCurrency(priceForCycle(plan, cycle))}<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
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
