import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { simuladoStartSchema } from "@/schemas/app-schemas";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = simuladoStartSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "provaId invalido" }, { status: 400 });
    }
    const body = parsed.data;
    const prova = await prisma.prova.findUnique({
      where: { id: body.provaId },
      include: { questoes: { orderBy: { numero: "asc" } } },
    });
    if (!prova) return NextResponse.json({ error: "Prova nao encontrada" }, { status: 404 });
    const now = new Date();

    // Evita criar um simulado duplicado (ex: duplo clique, retry de rede) que
    // fragmentaria as respostas ja salvas entre dois simuladoId diferentes.
    const existente = await prisma.simulado.findFirst({
      where: { userId: user.id, provaId: prova.id, status: "EM_ANDAMENTO", expiradoEm: { gt: now } },
      orderBy: { createdAt: "desc" },
    });
    if (existente) {
      return NextResponse.json({ id: existente.id });
    }

    if (prova.questoes.length === 0) {
      return NextResponse.json({ error: "Esta prova ainda nao tem questoes cadastradas" }, { status: 422 });
    }

    const expiradoEm = new Date(now.getTime() + prova.duracaoMin * 60 * 1000);
    const simulado = await prisma.simulado.create({
      data: {
        userId: user.id,
        provaId: prova.id,
        titulo: prova.titulo,
        status: "EM_ANDAMENTO",
        duracaoMin: prova.duracaoMin,
        totalQuestoes: prova.questoes.length,
        iniciadoEm: now,
        expiradoEm,
        questoes: {
          create: prova.questoes.map((questao, index) => ({ questaoId: questao.id, ordem: index + 1 })),
        },
      },
    });
    await auditLog({ userId: user.id, action: "simulado.iniciar", entity: "Simulado", entityId: simulado.id });
    return NextResponse.json({ id: simulado.id });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao iniciar simulado" }, { status: 500 });
  }
}
