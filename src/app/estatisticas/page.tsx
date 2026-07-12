import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function EstatisticasPage() {
  const user = await getCurrentDbUser();
  const stats = await prisma.studyStatistic.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Estatisticas</h1>
      <Card>
        <CardHeader><CardTitle>Desempenho por disciplina</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {stats.map((item) => {
            const score = item.questionsDone ? Math.round((item.correctAnswers / item.questionsDone) * 100) : 0;
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between text-sm"><span>{item.discipline ?? "Geral"}</span><span>{score}%</span></div>
                <Progress value={score} />
              </div>
            );
          })}
          {stats.length === 0 && <p className="text-sm text-muted-foreground">Conclua simulados, redacoes e pomodoros para gerar estatisticas.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
