import { AppShell } from "@/components/shared/app-shell";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function PlannerPage() {
  const user = await getCurrentDbUser();
  const tasks = await prisma.plannerTask.findMany({ where: { userId: user.id }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }] });
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Calendario, metas, recorrencia e foco</p>
        <h1 className="font-display text-3xl font-bold">Planner</h1>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Tarefas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada ainda.</p> : tasks.map((task) => (
              <div key={task.id} className="rounded-md border border-border p-3">
                <div className="flex justify-between gap-3">
                  <strong>{task.title}</strong>
                  <span className="text-sm text-muted-foreground">{task.status}</span>
                </div>
                {task.description && <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
        <PomodoroTimer />
      </section>
    </AppShell>
  );
}
