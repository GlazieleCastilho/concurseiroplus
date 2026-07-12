import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/clerk";
import { getProvaWithQuestoes } from "@/repositories/questions-repository";
import { QuestaoManager } from "@/components/admin/questao-manager";
import { TextoApoioManager } from "@/components/admin/texto-apoio-manager";

export default async function AdminProvaQuestionsPage({ params }: { params: Promise<{ provaId: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { provaId } = await params;
  const prova = await getProvaWithQuestoes(provaId);
  if (!prova) notFound();

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/admin/questions" className="text-sm text-muted-foreground hover:underline">← Provas</Link>
          <h1 className="font-display text-3xl font-bold">{prova.titulo}</h1>
          <p className="text-sm text-muted-foreground">{prova.banca} · {prova.orgao} · {prova.cargo} · {prova.ano} · {prova.questoes.length} questoes</p>
        </div>
        <Link href="/admin/questions/importar">
          <Button variant="outline">Importar em massa</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Textos de apoio</CardTitle>
        </CardHeader>
        <CardContent>
          <TextoApoioManager provaId={prova.id} initialTextos={prova.textosApoio} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Questoes</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestaoManager provaId={prova.id} initialQuestoes={prova.questoes} textosApoio={prova.textosApoio} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
