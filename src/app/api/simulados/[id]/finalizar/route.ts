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
        questoes: { include: { questao: true } },
        respostas: true,
      },
    });
    if (!simulado) return NextResponse.json({ error: "Simulado nao encontrado" }, { status: 404 });
    if (simulado.status === "FINALIZADO") {
      // O simulado ja foi finalizado de verdade (nota calculada e salva) - isso
      // acontece com frequencia quando o cliente clica em "Finalizar" de novo apos
      // um erro na PRIMEIRA chamada que na verdade ja tinha tido sucesso no banco
      // (ex.: o auditLog falhando depois da transacao principal ja ter commitado,
      // ver catch abaixo). Devolver so um erro aqui faria o aluno perder o resultado
      // que ja existe - devolve o resultado ja calculado em vez de tratar como falha.
      const resultadoExistente = await prisma.resultado.findUnique({ where: { simuladoId: id } });
      if (resultadoExistente) return NextResponse.json({ resultado: resultadoExistente });
      return NextResponse.json({ error: "Simulado ja foi finalizado" }, { status: 409 });
    }

    const questoes = simulado.questoes.map((item) => item.questao);
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

    // Log de auditoria e best-effort: a nota ja foi calculada e salva na transacao
    // acima, entao uma falha aqui (rede, conexao) nunca pode fazer a finalizacao
    // inteira parecer que deu erro pro aluno quando o resultado ja esta no banco.
    try {
      await auditLog({ userId: user.id, action: "simulado.finalizar", entity: "Simulado", entityId: id });
    } catch (auditError) {
      console.error("Falha ao gravar audit log de simulado.finalizar:", auditError);
    }
    return NextResponse.json({ resultado });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao finalizar simulado" }, { status: 500 });
  }
}
