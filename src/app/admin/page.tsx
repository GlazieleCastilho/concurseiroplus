import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { getAdminDashboard } from "@/repositories/dashboard-repository";
import { formatCurrency } from "@/lib/product";

export default async function AdminPage() {
  await requireRole(["admin", "super_admin"]);
  const data = await getAdminDashboard();
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Operacao, receita, IA e conteudo</p>
        <h1 className="font-display text-3xl font-bold">Admin</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Usuarios" value={data.users} />
        <Metric title="Assinaturas ativas" value={data.activeSubscriptions} />
        <Metric title="MRR" value={formatCurrency(data.mrr)} />
        <Metric title="ARR" value={formatCurrency(data.arr)} />
        <Metric title="Redacoes" value={data.essays} />
        <Metric title="Mensagens IA" value={data.skillMessages} />
        <Metric title="LTV" value={formatCurrency(data.ltv)} />
        <Metric title="Churn" value={`${data.churn}%`} />
      </section>
      <Card>
        <CardHeader><CardTitle>Provas mais acessadas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.provas.map((prova) => (
            <div key={prova.id} className="flex justify-between rounded-md border border-border p-3 text-sm">
              <span>{prova.titulo}</span>
              <span className="text-muted-foreground">{prova.popularidade} acessos</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
