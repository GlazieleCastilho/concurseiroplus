"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ConcursoStatus, Prova } from "@/generated/prisma";

const STATUS_LABELS: Record<ConcursoStatus, string> = {
  ABERTO: "Abertos",
  EM_ANDAMENTO: "Em andamento",
  PREVISTO: "Previstos",
  FECHADO: "Fechados",
};

const STATUS_ORDER: ConcursoStatus[] = ["ABERTO", "EM_ANDAMENTO", "PREVISTO", "FECHADO"];

export function ConcursosTabs({ provas }: { provas: Prova[] }) {
  return (
    <Tabs defaultValue="ABERTO">
      <TabsList>
        {STATUS_ORDER.map((status) => (
          <TabsTrigger key={status} value={status}>
            {STATUS_LABELS[status]} ({provas.filter((prova) => prova.status === status).length})
          </TabsTrigger>
        ))}
      </TabsList>
      {STATUS_ORDER.map((status) => (
        <TabsContent key={status} value={status} className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {provas
              .filter((prova) => prova.status === status)
              .map((prova) => (
                <Card key={prova.id}>
                  <CardHeader><CardTitle>{prova.orgao} · {prova.cargo}</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>Banca: {prova.banca}</p>
                    <p>Nivel: {prova.nivel}</p>
                    <p>Data da prova: {prova.dataProva ? prova.dataProva.toLocaleDateString("pt-BR") : "A definir"}</p>
                    {prova.vagas != null && <p>Vagas: {prova.vagas}</p>}
                    {prova.salario && <p>Salario: {prova.salario}</p>}
                    {(prova.inscricaoInicio || prova.inscricaoFim) && (
                      <p>
                        Inscricoes: {prova.inscricaoInicio ? prova.inscricaoInicio.toLocaleDateString("pt-BR") : "?"} a{" "}
                        {prova.inscricaoFim ? prova.inscricaoFim.toLocaleDateString("pt-BR") : "?"}
                      </p>
                    )}
                    {prova.editalUrl && (
                      <Link href={prova.editalUrl} target="_blank">
                        <Button size="sm" variant="outline" className="mt-2">Ver edital</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            {provas.filter((prova) => prova.status === status).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum concurso {STATUS_LABELS[status].toLowerCase()} no momento.</p>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
