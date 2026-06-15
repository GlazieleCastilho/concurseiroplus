import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/clerk";

export default async function AdminUsersPage() {
  await requireRole(["admin", "super_admin"]);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar usuarios</h1>
      <Card>
        <CardHeader><CardTitle>Usuarios recentes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-5">
              <strong>{user.firstName} {user.lastName}</strong>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <span>{user.planTier}</span>
              <span>{user.createdAt.toLocaleDateString("pt-BR")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
