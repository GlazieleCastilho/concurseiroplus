import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { customSimuladoSchema } from "@/schemas/app-schemas";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = customSimuladoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const { disciplinas, bancas, anos, quantidade } = parsed.data;

    const pool = await prisma.questao.findMany({
      where: {
        ...(disciplinas.length > 0 ? { disciplina: { in: disciplinas } } : {}),
        prova: {
          origem: "QUESTOES",
          ...(bancas.length > 0 ? { banca: { in: bancas } } : {}),
          ...(anos.length > 0 ? { ano: { in: anos } } : {}),
        },
      },
      select: { id: true },
    });

    if (pool.length === 0) {
      return NextResponse.json({ error: "Nenhuma questao encontrada com esses filtros" }, { status: 422 });
    }

    const selecionadas = shuffle(pool).slice(0, quantidade);
    const now = new Date();
    const duracaoMin = Math.max(10, selecionadas.length * 3);
    const expiradoEm = new Date(now.getTime() + duracaoMin * 60 * 1000);

    const filtrosLabel = [
      disciplinas.length > 0 ? disciplinas.join(", ") : null,
      bancas.length > 0 ? bancas.join(", ") : null,
      anos.length > 0 ? anos.join(", ") : null,
    ].filter(Boolean);
    const titulo = filtrosLabel.length > 0 ? `Simulado personalizado - ${filtrosLabel.join(" · ")}` : "Simulado personalizado - misturado";

    const simulado = await prisma.simulado.create({
      data: {
        userId: user.id,
        provaId: null,
        titulo,
        status: "EM_ANDAMENTO",
        duracaoMin,
        totalQuestoes: selecionadas.length,
        iniciadoEm: now,
        expiradoEm,
        questoes: {
          create: selecionadas.map((questao, index) => ({ questaoId: questao.id, ordem: index + 1 })),
        },
      },
    });

    await auditLog({ userId: user.id, action: "simulado.iniciar_personalizado", entity: "Simulado", entityId: simulado.id });
    return NextResponse.json({ id: simulado.id, quantidadeEncontrada: selecionadas.length });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao gerar simulado personalizado" }, { status: 500 });
  }
}
