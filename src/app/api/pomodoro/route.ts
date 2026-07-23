import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { pomodoroSessionSchema } from "@/schemas/app-schemas";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = pomodoroSessionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    if (parsed.data.plannerTaskId) {
      const task = await prisma.plannerTask.findFirst({ where: { id: parsed.data.plannerTaskId, userId: user.id } });
      if (!task) return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 });
    }
    const session = await prisma.pomodoroSession.create({ data: { ...parsed.data, userId: user.id } });
    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao registrar sessao de pomodoro" }, { status: 500 });
  }
}
