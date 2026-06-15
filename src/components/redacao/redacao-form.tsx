"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EssayFeedback } from "@/services/ai-service";

const patterns = ["ENEM", "CESPE", "FCC", "FGV"] as const;

export function RedacaoForm() {
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [bancaPattern, setBancaPattern] = useState<(typeof patterns)[number]>("ENEM");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/redacao/corrigir", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tema, texto, bancaPattern }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Nao foi possivel corrigir a redacao");
      setFeedback(payload.feedback);
      toast.success("Redacao corrigida e salva no historico.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao corrigir redacao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Enviar redacao</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input value={tema} onChange={(event) => setTema(event.target.value)} placeholder="Tema da redacao" minLength={8} required />
            <div className="flex flex-wrap gap-2">
              {patterns.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBancaPattern(item)}
                  className={`rounded-md border px-3 py-2 text-sm ${bancaPattern === item ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              className="min-h-[360px] w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Cole ou escreva sua redacao aqui..."
              minLength={400}
              maxLength={12000}
              required
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{texto.length}/12000 caracteres</span>
              <Button type="submit" disabled={loading}>{loading ? "Corrigindo..." : "Corrigir com IA"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback da IA</CardTitle>
        </CardHeader>
        <CardContent>
          {!feedback ? (
            <p className="text-sm text-muted-foreground">A correcao aparece aqui e tambem fica salva no seu historico.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Nota total</p>
                <p className="font-display text-5xl font-bold text-accent">{feedback.totalScore}</p>
              </div>
              <div className="space-y-3">
                {feedback.criterios.map((criterio) => (
                  <div key={criterio.nome} className="rounded-md border border-border p-3">
                    <div className="flex justify-between gap-3">
                      <strong>{criterio.nome}</strong>
                      <span>{criterio.nota}/{criterio.max}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{criterio.justificativa}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold">Sugestoes</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {feedback.sugestoes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Versao melhorada</h3>
                <p className="mt-2 whitespace-pre-wrap rounded-md border border-border p-3 text-sm text-muted-foreground">{feedback.versaoMelhorada}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
