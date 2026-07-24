import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { listProvas } from "@/repositories/questions-repository";
import { ProvaManager } from "@/components/admin/prova-manager";

export default async function AdminQuestionsPage() {
  await requireRole(["admin", "super_admin"]);
  const provas = await listProvas("QUESTOES");

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar questoes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Provas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <ProvaManager initialProvas={provas} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
