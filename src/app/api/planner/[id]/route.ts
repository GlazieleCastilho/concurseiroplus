import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { plannerTaskSchema } from "@/schemas/app-schemas";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentDbUser();
    const existing = await prisma.plannerTask.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 });

    const parsed = plannerTaskSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }

    const data = { ...parsed.data } as typeof parsed.data & { completedAt?: Date | null };
    if (parsed.data.status === "DONE" && existing.status !== "DONE") {
      data.completedAt = new Date();
    } else if (parsed.data.status && parsed.data.status !== "DONE") {
      data.completedAt = null;
    }

    const task = await prisma.plannerTask.update({ where: { id }, data });
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao editar tarefa" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentDbUser();
    const existing = await prisma.plannerTask.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 });
    await prisma.plannerTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao excluir tarefa" }, { status: 500 });
  }
}
