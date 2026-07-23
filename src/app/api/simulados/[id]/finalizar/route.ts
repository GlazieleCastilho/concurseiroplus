import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentDbUser();
    const simulado = await prisma.simulado.findFirst({
      where: { id, userId: user.id },
      include: {
        prova: { include: { questoes: true } },
        respostas: true,
      },
    });
    if (!simulado) return NextResponse.json({ error: "Simulado nao encontrado" }, { status: 404 });
    if (simulado.status === "FINALIZADO") {
      return NextResponse.json({ error: "Simulado ja foi finalizado" }, { status: 409 });
    }

    const questoes = simulado.prova?.questoes ?? [];
    const respostaByQuestaoId = new Map(simulado.respostas.map((resposta) => [resposta.questaoId, resposta]));

    let acertos = 0;
    let erros = 0;
    let naoRespondidas = 0;
    const porDisciplina: Record<string, { acertos: number; erros: number; naoRespondidas: number }> = {};

    for (const questao of questoes) {
      const chave = questao.disciplina ?? "Geral";
      porDisciplina[chave] ??= { acertos: 0, erros: 0, naoRespondidas: 0 };
      const resposta = respostaByQuestaoId.get(questao.id);
      if (!resposta) {
        naoRespondidas += 1;
        porDisciplina[chave].naoRespondidas += 1;
      } else if (resposta.correta === true) {
        acertos += 1;
        porDisciplina[chave].acertos += 1;
      } else {
        erros += 1;
        porDisciplina[chave].erros += 1;
      }
    }

    const total = questoes.length || 1;
    const percentual = (acertos / total) * 100;
    const tempoGastoSec = simulado.iniciadoEm
      ? Math.max(0, Math.round((Date.now() - simulado.iniciadoEm.getTime()) / 1000))
      : 0;

    const [resultado] = await prisma.$transaction([
      prisma.resultado.upsert({
        where: { simuladoId: id },
        update: { acertos, erros, naoRespondidas, percentual, porDisciplina, tempoGastoSec },
        create: { userId: user.id, simuladoId: id, acertos, erros, naoRespondidas, percentual, porDisciplina, tempoGastoSec },
      }),
      prisma.simulado.update({
        where: { id },
        data: { status: "FINALIZADO", finalizadoEm: new Date(), pontuacao: percentual },
      }),
    ]);

    await auditLog({ userId: user.id, action: "simulado.finalizar", entity: "Simulado", entityId: id });
    return NextResponse.json({ resultado });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao finalizar simulado" }, { status: 500 });
  }
}
