"use client";

import { useEffect, useState } from "react";
import type { Alternativa, Questao } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuestaoComAlternativas = Questao & { alternativas: Alternativa[] };

export function SimuladoRunner({ simuladoId, expiradoEm, questoes }: { simuladoId: string; expiradoEm: string; questoes: QuestaoComAlternativas[] }) {
  const [remaining, setRemaining] = useState(Math.max(0, new Date(expiradoEm).getTime() - Date.now()));
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiradoEm).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiradoEm]);

  const hh = String(Math.floor(remaining / 3_600_000)).padStart(2, "0");
  const mm = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");

  return (
    <div className="grid gap-4">
      <div className="sticky top-[86px] z-20 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Tempo restante</p>
          <p className={`font-mono text-2xl font-bold ${remaining < 5 * 60_000 ? "text-red-400" : "text-accent"}`}>{hh}:{mm}:{ss}</p>
        </div>
        <Button>Finalizar simulado</Button>
      </div>
      {questoes.map((questao) => (
        <Card key={questao.id}>
          <CardHeader>
            <CardTitle>Questao {questao.numero}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-6">{questao.enunciado}</p>
            <div className="grid gap-2">
              {questao.alternativas.map((alternativa) => (
                <button
                  key={alternativa.id}
                  type="button"
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [questao.id]: alternativa.letra }));
                    void fetch(`/api/simulados/${simuladoId}/respostas`, {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ questaoId: questao.id, alternativaId: alternativa.id, respostaDada: alternativa.letra }),
                    });
                  }}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${answers[questao.id] === alternativa.letra ? "border-accent bg-accent/10" : "border-border"}`}
                >
                  <strong>{alternativa.letra}.</strong> {alternativa.texto}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
