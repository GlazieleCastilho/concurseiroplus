"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BillingCycle, PlanTier } from "@/generated/prisma";

export function CheckoutButton({ tier, cycle }: { tier: PlanTier; cycle: BillingCycle }) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier, cycle }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Erro ao criar checkout");
      window.location.href = payload.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar pagamento");
    } finally {
      setLoading(false);
    }
  }

  return <Button onClick={checkout} disabled={loading} className="w-full">{loading ? "Abrindo checkout..." : "Assinar com Pagar.me"}</Button>;
}
