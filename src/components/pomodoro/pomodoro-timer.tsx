"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePomodoroStore } from "@/stores/pomodoro-store";

export function PomodoroTimer() {
  const { fase, ativo, msRestantes, ciclosFeitos, iniciar, pausar, resetar, pular, tick } = usePomodoroStore();

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const mm = String(Math.floor(msRestantes / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((msRestantes % 60_000) / 1000)).padStart(2, "0");

  return (
    <Card>
      <CardHeader><CardTitle>Pomodoro</CardTitle></CardHeader>
      <CardContent className="text-center">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">{fase.replace("_", " ")}</p>
        <p className="font-display mt-2 text-6xl font-bold tabular-nums">{mm}:{ss}</p>
        <p className="mt-2 text-sm text-muted-foreground">{ciclosFeitos} ciclos concluidos</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={ativo ? pausar : iniciar}>{ativo ? "Pausar" : "Iniciar"}</Button>
          <Button onClick={resetar} variant="outline">Resetar</Button>
          <Button onClick={pular} variant="outline">Pular</Button>
        </div>
      </CardContent>
    </Card>
  );
}
