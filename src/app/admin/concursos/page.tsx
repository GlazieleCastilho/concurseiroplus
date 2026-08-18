import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { listConcursos } from "@/repositories/concursos-repository";
import { ConcursoManager } from "@/components/admin/concurso-manager";

export default async function AdminConcursosPage() {
  await requireRole(["admin", "super_admin"]);
  const concursos = await listConcursos();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar concursos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Editais cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <ConcursoManager initialConcursos={concursos} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
