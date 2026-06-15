import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/clerk";

export default async function AdminQuestionsPage() {
  await requireRole(["admin", "super_admin"]);
  const provas = await prisma.prova.findMany({ include: { _count: { select: { questoes: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar questoes</h1>
      <Card>
        <CardHeader><CardTitle>Provas cadastradas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {provas.map((prova) => (
            <div key={prova.id} className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-5">
              <strong>{prova.titulo}</strong>
              <span>{prova.banca}</span>
              <span>{prova.orgao}</span>
              <span>{prova.cargo}</span>
              <span>{prova._count.questoes} questoes</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
