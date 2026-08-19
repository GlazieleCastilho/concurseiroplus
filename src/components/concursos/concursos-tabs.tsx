"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Concurso, ConcursoStatus } from "@/generated/prisma";

const STATUS_LABELS: Record<ConcursoStatus, string> = {
  ABERTO: "Abertos",
  EM_ANDAMENTO: "Em andamento",
  PREVISTO: "Previstos",
  FECHADO: "Fechados",
};

const STATUS_ORDER: ConcursoStatus[] = ["ABERTO", "EM_ANDAMENTO", "PREVISTO", "FECHADO"];

export function ConcursosTabs({ concursos }: { concursos: Concurso[] }) {
  return (
    <Tabs defaultValue="ABERTO">
      <TabsList>
        {STATUS_ORDER.map((status) => (
          <TabsTrigger key={status} value={status}>
            {STATUS_LABELS[status]} ({concursos.filter((concurso) => concurso.status === status).length})
          </TabsTrigger>
        ))}
      </TabsList>
      {STATUS_ORDER.map((status) => (
        <TabsContent key={status} value={status} className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {concursos
              .filter((concurso) => concurso.status === status)
              .map((concurso) => (
                <Card key={concurso.id}>
                  <CardHeader><CardTitle>{concurso.orgao} · {concurso.cargo}</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>Banca: {concurso.banca}</p>
                    <p>Nivel: {concurso.nivel.join(", ")}</p>
                    <p>Data da prova: {concurso.dataProva ? concurso.dataProva.toLocaleDateString("pt-BR") : "A definir"}</p>
                    {concurso.vagas != null && <p>Vagas: {concurso.vagas}</p>}
                    {concurso.salario && <p>Salario: {concurso.salario}</p>}
                    {(concurso.inscricaoInicio || concurso.inscricaoFim) && (
                      <p>
                        Inscricoes: {concurso.inscricaoInicio ? concurso.inscricaoInicio.toLocaleDateString("pt-BR") : "?"} a{" "}
                        {concurso.inscricaoFim ? concurso.inscricaoFim.toLocaleDateString("pt-BR") : "?"}
                      </p>
                    )}
                    {concurso.editalUrl && (
                      <Link href={concurso.editalUrl} target="_blank">
                        <Button size="sm" variant="outline" className="mt-2">Ver edital</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            {concursos.filter((concurso) => concurso.status === status).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum concurso {STATUS_LABELS[status].toLowerCase()} no momento.</p>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
