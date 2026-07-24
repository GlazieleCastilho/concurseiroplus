"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Alternativa, Questao, TextoApoio } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuestaoComAlternativas = Questao & { alternativas: Alternativa[]; textoApoio: TextoApoio | null };

type ResultadoResumo = { acertos: number; erros: number; naoRespondidas: number; percentual: number };

export function SimuladoRunner({
  simuladoId,
  expiradoEm,
  questoes,
  initialAnswers,
  finalizado,
}: {
  simuladoId: string;
  expiradoEm: string;
  questoes: QuestaoComAlternativas[];
  initialAnswers: Record<string, string>;
  finalizado: boolean;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(Math.max(0, new Date(expiradoEm).getTime() - Date.now()));
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [finalizing, setFinalizing] = useState(false);
  const [resultado, setResultado] = useState<ResultadoResumo | null>(null);
  const jaFinalizado = finalizado || resultado !== null;

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiradoEm).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiradoEm]);

  const hh = String(Math.floor(remaining / 3_600_000)).padStart(2, "0");
  const mm = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");

  async function finalizarSimulado() {
    const naoRespondidas = questoes.length - Object.keys(answers).length;
    if (naoRespondidas > 0) {
      const confirmado = window.confirm(
        `Voce ainda nao respondeu ${naoRespondidas} questao(oes). Elas serao contadas como erradas. Finalizar mesmo assim?`
      );
      if (!confirmado) return;
    }
    setFinalizing(true);
    try {
      const response = await fetch(`/api/simulados/${simuladoId}/finalizar`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!data) throw new Error(`Erro ao finalizar simulado (status ${response.status}). Tente novamente.`);
      if (!response.ok) throw new Error(data.error ?? "Erro ao finalizar simulado");
      setResultado(data.resultado);
      toast.success(`Simulado finalizado: ${data.resultado.acertos}/${questoes.length} acertos.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao finalizar simulado");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="sticky top-[86px] z-20 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Tempo restante</p>
          <p className={`font-mono text-2xl font-bold ${remaining < 5 * 60_000 ? "text-red-400" : "text-accent"}`}>{hh}:{mm}:{ss}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/simulados">
            <Button variant="outline">Sair e continuar depois</Button>
          </Link>
          {!jaFinalizado && (
            <Button onClick={finalizarSimulado} disabled={finalizing}>
              {finalizing ? "Finalizando..." : "Finalizar simulado"}
            </Button>
          )}
        </div>
      </div>
      {resultado && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm">
            <p><strong>{resultado.acertos}</strong> acertos</p>
            <p><strong>{resultado.erros}</strong> erros</p>
            <p><strong>{resultado.naoRespondidas}</strong> nao respondidas</p>
            <p><strong>{resultado.percentual.toFixed(1)}%</strong> de aproveitamento</p>
          </CardContent>
        </Card>
      )}
      {jaFinalizado && !resultado && (
        <Card className="border-accent">
          <CardContent className="pt-6 text-sm text-muted-foreground">Este simulado ja foi finalizado.</CardContent>
        </Card>
      )}
      {questoes.map((questao, index) => (
        <div key={questao.id} className="space-y-4">
          {questao.textoApoio && questao.textoApoio.id !== questoes[index - 1]?.textoApoio?.id && (
            <Card className="border-dashed bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">{questao.textoApoio.titulo ?? "Texto de apoio"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{questao.textoApoio.conteudo}</p>
              </CardContent>
            </Card>
          )}
          <Card>
          <CardHeader>
            <CardTitle>Questao {questao.numero}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-6">{questao.enunciado}</p>
            {questao.imagemUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={questao.imagemUrl} alt={`Imagem da questao ${questao.numero}`} className="max-w-full rounded-md border border-border" />
            )}
            <div className="grid gap-2">
              {questao.alternativas.map((alternativa) => (
                <button
                  key={alternativa.id}
                  type="button"
                  disabled={jaFinalizado}
                  onClick={() => {
                    if (jaFinalizado) return;
                    setAnswers((current) => ({ ...current, [questao.id]: alternativa.letra }));
                    void fetch(`/api/simulados/${simuladoId}/respostas`, {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ questaoId: questao.id, alternativaId: alternativa.id, respostaDada: alternativa.letra }),
                    });
                  }}
                  className={`rounded-md border px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 ${answers[questao.id] === alternativa.letra ? "border-accent bg-accent/10" : "border-border"}`}
                >
                  <strong>{alternativa.letra}.</strong> {alternativa.texto}
                  {alternativa.imagemUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={alternativa.imagemUrl} alt={`Imagem da alternativa ${alternativa.letra}`} className="mt-2 max-w-full rounded-md border border-border" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
