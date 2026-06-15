import Link from "next/link";
import { BarChart3, Brain, Clock, FileText, Trophy } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCurrentDbUser } from "@/lib/clerk";
import { getStudentDashboard } from "@/repositories/dashboard-repository";

export default async function DashboardPage() {
  const user = await getCurrentDbUser();
  const data = await getStudentDashboard(user.id);
  const completed = data.simulados.filter((simulado) => simulado.status === "FINALIZADO");
  const avg = completed.length ? Math.round(completed.reduce((sum, simulado) => sum + (simulado.pontuacao ?? 0), 0) / completed.length) : 0;

  return (
    <AppShell>
      <section className="grid gap-2">
        <p className="text-sm text-muted-foreground">Plano {user.planTier}</p>
        <h1 className="font-display text-3xl font-bold">Boa sessao de estudos, {user.firstName}</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Simulados feitos" value={completed.length} icon={FileText} />
        <Metric title="Media geral" value={`${avg}%`} icon={BarChart3} />
        <Metric title="Redacoes corrigidas" value={data.redacoes.filter((redacao) => redacao.status === "GRADED").length} icon={Brain} />
        <Metric title="Horas focadas" value={`${Math.round(data.focusMinutes / 60)}h`} icon={Clock} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evolucao recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.statistics.length === 0 ? (
              <EmptyState href="/simulados" label="Iniciar primeiro simulado" text="Seus graficos aparecem assim que voce conclui simulados, redacoes ou sessoes de foco." />
            ) : (
              data.statistics.slice(-8).map((item) => {
                const value = item.questionsDone ? Math.round((item.correctAnswers / item.questionsDone) * 100) : 0;
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.discipline ?? "Geral"}</span>
                      <span className="text-muted-foreground">{value}%</span>
                    </div>
                    <Progress value={value} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ranking ? (
              <div className="flex items-center gap-4">
                <div className="rounded-lg border border-accent/40 bg-accent/10 p-4"><Trophy className="h-8 w-8 text-accent" /></div>
                <div>
                  <p className="text-3xl font-bold">#{data.ranking.position}</p>
                  <p className="text-sm text-muted-foreground">{data.ranking.score} pontos no periodo {data.ranking.period}</p>
                </div>
              </div>
            ) : (
              <EmptyState href="/ranking" label="Ver ranking" text="Complete atividades para entrar no ranking competitivo." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ultimos simulados</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.simulados.length === 0 ? <EmptyState href="/simulados" label="Escolher prova" text="Nenhum simulado iniciado ainda." /> : data.simulados.map((simulado) => (
              <Link key={simulado.id} href={`/simulados/${simulado.id}`} className="flex items-center justify-between rounded-md border border-border p-3 transition hover:border-accent">
                <span>{simulado.titulo}</span>
                <span className="text-sm text-muted-foreground">{simulado.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ultimas redacoes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.redacoes.length === 0 ? <EmptyState href="/redacao" label="Corrigir redacao" text="Envie sua primeira redacao para receber feedback por IA." /> : data.redacoes.map((redacao) => (
              <Link key={redacao.id} href="/redacao" className="flex items-center justify-between rounded-md border border-border p-3 transition hover:border-accent">
                <span>{redacao.tema}</span>
                <span className="text-sm text-muted-foreground">{redacao.totalScore ?? "-"} pts</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-0">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-accent" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
      <p>{text}</p>
      <Button asChild size="sm" className="mt-4"><Link href={href}>{label}</Link></Button>
    </div>
  );
}
