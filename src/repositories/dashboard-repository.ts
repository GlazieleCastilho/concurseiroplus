import { prisma } from "@/lib/prisma";

export async function getStudentDashboard(userId: string) {
  const [simulados, redacoes, pomodoros, ranking, statistics] = await Promise.all([
    prisma.simulado.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { prova: true, resultados: true },
    }),
    prisma.redacao.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { feedback: true },
    }),
    prisma.pomodoroSession.aggregate({
      where: { userId, completado: true },
      _sum: { duracaoMin: true },
    }),
    prisma.ranking.findFirst({
      where: { userId, period: "global" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.studyStatistic.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 30,
    }),
  ]);

  return {
    simulados,
    redacoes,
    focusMinutes: pomodoros._sum.duracaoMin ?? 0,
    ranking,
    statistics,
  };
}

export async function getAdminDashboard() {
  const [users, activeSubscriptions, payments, essays, skillMessages, provas] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: { in: ["ACTIVE", "LIFETIME"] } } }),
    prisma.payment.findMany({ where: { status: "APPROVED" }, select: { amountCents: true, createdAt: true } }),
    prisma.redacao.count(),
    prisma.skillMessage.count(),
    prisma.prova.findMany({ orderBy: { popularidade: "desc" }, take: 8 }),
  ]);

  const mrr = payments
    .filter((payment) => payment.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, payment) => sum + payment.amountCents, 0);

  return {
    users,
    activeSubscriptions,
    mrr,
    arr: mrr * 12,
    churn: 0,
    ltv: activeSubscriptions > 0 ? Math.round(payments.reduce((sum, payment) => sum + payment.amountCents, 0) / activeSubscriptions) : 0,
    cac: 0,
    essays,
    skillMessages,
    provas,
  };
}
