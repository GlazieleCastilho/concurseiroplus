import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { rateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { plans } from "@/lib/product";
import { prisma } from "@/lib/prisma";
import { redacaoSubmissionSchema } from "@/schemas/app-schemas";
import { gradeEssay } from "@/services/ai-service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    await rateLimit("redacao", user.id);
    const body = redacaoSubmissionSchema.parse(await req.json());
    const plan = plans.find((item) => item.tier === user.planTier);
    if (!plan) return NextResponse.json({ error: "Plano invalido" }, { status: 403 });
    if (!plan.limits.essayPatterns.includes(body.bancaPattern)) {
      return NextResponse.json({ error: "Seu plano nao inclui este padrao de banca." }, { status: 403 });
    }
    if (plan.limits.essaysPerMonth !== null) {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const used = await prisma.redacao.count({ where: { userId: user.id, createdAt: { gte: start } } });
      if (used >= plan.limits.essaysPerMonth) {
        return NextResponse.json({ error: "Limite mensal de redacoes atingido." }, { status: 403 });
      }
    }

    const redacao = await prisma.redacao.create({
      data: {
        userId: user.id,
        tema: body.tema,
        texto: body.texto,
        bancaPattern: body.bancaPattern,
        simuladoId: body.simuladoId,
        status: "PROCESSING",
      },
    });

    const feedback = await gradeEssay(body);
    await prisma.redacao.update({
      where: { id: redacao.id },
      data: {
        status: "GRADED",
        totalScore: feedback.totalScore,
        feedback: {
          create: {
            criterios: feedback.criterios,
            trechos: feedback.trechos,
            sugestoes: feedback.sugestoes,
            versaoMelhorada: feedback.versaoMelhorada,
            feedbackGeral: feedback.feedbackGeral,
            rawResponse: feedback,
          },
        },
      },
    });
    await auditLog({ userId: user.id, action: "redacao.corrigir", entity: "Redacao", entityId: redacao.id });
    return NextResponse.json({ id: redacao.id, feedback });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao corrigir redacao" }, { status: 500 });
  }
}
