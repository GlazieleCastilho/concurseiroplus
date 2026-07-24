"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function StartSimuladoButton({ provaId }: { provaId: string }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function start() {
    if (starting) return;
    setStarting(true);
    try {
      const response = await fetch("/api/simulados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provaId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Nao foi possivel iniciar o simulado");
        return;
      }
      router.push(`/simulados/${payload.id}`);
    } finally {
      setStarting(false);
    }
  }

  return <Button onClick={start} disabled={starting}>{starting ? "Iniciando..." : "Iniciar"}</Button>;
}
