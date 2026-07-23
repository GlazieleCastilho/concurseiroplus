import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { listProvas } from "@/repositories/questions-repository";
import { ConcursoManager } from "@/components/admin/concurso-manager";

export default async function AdminConcursosPage() {
  await requireRole(["admin", "super_admin"]);
  const provas = await listProvas();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar concursos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Editais cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <ConcursoManager initialProvas={provas} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
