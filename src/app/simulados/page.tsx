import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentDbUser } from "@/lib/clerk";
import { getFeaturedProvas } from "@/repositories/catalog-repository";
import { StartSimuladoButton } from "@/components/simulados/start-simulado-button";

export default async function SimuladosPage() {
  await getCurrentDbUser();
  const provas = await getFeaturedProvas();

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Banco de provas com cronometro, auto save e revisao</p>
        <h1 className="font-display text-3xl font-bold">Simulados</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {provas.map((prova) => {
          const urgent = prova.dataProva ? prova.dataProva.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 : false;
          return (
            <Card key={prova.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">{prova.banca}</Badge>
                  {urgent && <Badge>Prova proxima</Badge>}
                </div>
                <CardTitle>{prova.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <span>Orgao: {prova.orgao}</span>
                  <span>Cargo: {prova.cargo}</span>
                  <span>Ano: {prova.ano}</span>
                  <span>Questoes: {prova._count.questoes}</span>
                  <span>Nivel: {prova.nivel.join(", ")}</span>
                  <span>Tempo: {prova.duracaoMin} min</span>
                </div>
                <StartSimuladoButton provaId={prova.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
      {provas.length === 0 && (
        <Card>
          <CardContent className="pt-0 text-sm text-muted-foreground">Nenhuma prova cadastrada ainda. Administradores podem importar provas pelo painel.</CardContent>
        </Card>
      )}
    </AppShell>
  );
}
