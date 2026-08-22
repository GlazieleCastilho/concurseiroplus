import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { listLibraryDocuments } from "@/repositories/library-repository";
import { LibraryManager } from "@/components/admin/library-manager";

export default async function AdminLibraryPage() {
  await requireRole(["admin", "super_admin"]);
  const documents = await listLibraryDocuments();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar biblioteca</h1>
      <Card>
        <CardHeader>
          <CardTitle>Documentos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <LibraryManager initialDocuments={documents} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
