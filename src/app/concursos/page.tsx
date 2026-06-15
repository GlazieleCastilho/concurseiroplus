import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function ConcursosPage() {
  await getCurrentDbUser();
  const provas = await prisma.prova.findMany({ orderBy: { dataProva: "asc" }, take: 50 });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Concursos</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {provas.map((prova) => (
          <Card key={prova.id}>
            <CardHeader><CardTitle>{prova.orgao} · {prova.cargo}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Banca: {prova.banca}</p>
              <p>Nivel: {prova.nivel}</p>
              <p>Data: {prova.dataProva ? prova.dataProva.toLocaleDateString("pt-BR") : "A definir"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
