import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { QuestionImportManager } from "@/components/admin/question-import-manager";

export default async function AdminImportQuestionsPage() {
  await requireRole(["admin", "super_admin"]);

  return (
    <AppShell>
      <div>
        <Link href="/admin/questions" className="text-sm text-muted-foreground hover:underline">← Provas</Link>
        <h1 className="font-display text-3xl font-bold">Importar questoes em massa</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Importar de PDF, CSV ou JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionImportManager />
        </CardContent>
      </Card>
    </AppShell>
  );
}
