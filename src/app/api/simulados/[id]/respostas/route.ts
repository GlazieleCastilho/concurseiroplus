import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { simuladoAnswerSchema } from "@/schemas/app-schemas";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentDbUser();
    const body = simuladoAnswerSchema.parse(await req.json());
    const simulado = await prisma.simulado.findFirst({ where: { id, userId: user.id } });
    if (!simulado) return NextResponse.json({ error: "Simulado nao encontrado" }, { status: 404 });
    if (simulado.status !== "EM_ANDAMENTO") return NextResponse.json({ error: "Simulado nao aceita novas respostas" }, { status: 409 });
    if (simulado.expiradoEm && simulado.expiradoEm < new Date()) {
      await prisma.simulado.update({ where: { id }, data: { status: "EXPIRADO" } });
      return NextResponse.json({ error: "Tempo expirado" }, { status: 410 });
    }
    const questao = await prisma.questao.findUnique({ where: { id: body.questaoId } });
    if (!questao) return NextResponse.json({ error: "Questao nao encontrada" }, { status: 404 });

    const resposta = await prisma.resposta.upsert({
      where: { simuladoId_questaoId: { simuladoId: id, questaoId: body.questaoId } },
      update: {
        alternativaId: body.alternativaId,
        respostaTexto: body.respostaTexto,
        respostaDada: body.respostaDada,
        correta: questao.gabarito ? body.respostaDada === questao.gabarito : null,
      },
      create: {
        userId: user.id,
        simuladoId: id,
        questaoId: body.questaoId,
        alternativaId: body.alternativaId,
        respostaTexto: body.respostaTexto,
        respostaDada: body.respostaDada,
        correta: questao.gabarito ? body.respostaDada === questao.gabarito : null,
      },
    });
    return NextResponse.json({ resposta });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao salvar resposta" }, { status: 500 });
  }
}
