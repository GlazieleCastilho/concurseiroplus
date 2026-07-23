"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                  <CardContent className="text-sm text-muted-foreground">
                    <p>Banca: {prova.banca}</p>
                    <p>Nivel: {prova.nivel}</p>
                    <p>Data: {prova.dataProva ? prova.dataProva.toLocaleDateString("pt-BR") : "A definir"}</p>
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
