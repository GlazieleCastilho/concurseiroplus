import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function SuportesPage() {
  const user = await getCurrentDbUser();
  const tickets = await prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Suporte</h1>
      <Card>
        <CardHeader><CardTitle>Seus chamados</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-md border border-border p-3">
              <div className="flex justify-between gap-3 text-sm">
                <strong>{ticket.subject}</strong>
                <span className="text-muted-foreground">{ticket.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ticket.message}</p>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-sm text-muted-foreground">Nenhum chamado aberto.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
