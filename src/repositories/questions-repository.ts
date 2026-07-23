import { prisma } from "@/lib/prisma";
import type { Difficulty, ExamLevel, QuestionType } from "@/generated/prisma";

export type ProvaInput = {
  titulo: string;
  orgao: string;
  banca: string;
  cargo: string;
  ano: number;
  nivel: ExamLevel;
  disciplina?: string;
  dataProva?: Date;
  duracaoMin?: number;
};

export type AlternativaInput = { letra: string; texto: string; correta: boolean; imagemUrl?: string };

export type QuestaoInput = {
  numero: number;
  tipo: QuestionType;
  enunciado: string;
  imagemUrl?: string;
  disciplina?: string;
  assunto?: string;
  dificuldade: Difficulty;
  gabarito?: string;
  comentario?: string;
  alternativas: AlternativaInput[];
  textoApoioId?: string;
};

export type TextoApoioInput = { chave: string; titulo?: string; conteudo: string };

export type ProvaImportInput = ProvaInput & {
  questoes: (QuestaoInput & { textoApoioChave?: string })[];
  textosApoio?: TextoApoioInput[];
};

function resolveGabarito(alternativas: AlternativaInput[], gabarito?: string): string | undefined {
  return gabarito ?? alternativas.find((alternativa) => alternativa.correta)?.letra;
}

function provaSlug(input: Pick<ProvaInput, "banca" | "ano" | "cargo">): string {
  return `${input.banca.toLowerCase()}-${input.ano}-${input.cargo.toLowerCase().replaceAll(/\s+/g, "-")}`;
}

export async function listProvas() {
  return prisma.prova.findMany({
    include: { _count: { select: { questoes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProvaWithQuestoes(provaId: string) {
  return prisma.prova.findUnique({
    where: { id: provaId },
    include: {
      textosApoio: { orderBy: { createdAt: "asc" } },
      questoes: { include: { alternativas: true }, orderBy: { numero: "asc" } },
    },
  });
}

export async function createProva(input: ProvaInput) {
  return prisma.prova.create({ data: input });
}

export async function updateProva(provaId: string, input: Partial<ProvaInput>) {
  return prisma.prova.update({ where: { id: provaId }, data: input });
}

export async function deleteProva(provaId: string) {
  return prisma.prova.delete({ where: { id: provaId } });
}

export async function createTextoApoio(provaId: string, input: TextoApoioInput) {
  return prisma.textoApoio.create({ data: { provaId, ...input } });
}

export async function updateTextoApoio(textoApoioId: string, input: Partial<TextoApoioInput>) {
  return prisma.textoApoio.update({ where: { id: textoApoioId }, data: input });
}

export async function deleteTextoApoio(textoApoioId: string) {
  return prisma.textoApoio.delete({ where: { id: textoApoioId } });
}

export async function createQuestao(provaId: string, input: QuestaoInput) {
  return prisma.$transaction(async (tx) => {
    const questao = await tx.questao.create({
      data: {
        provaId,
        numero: input.numero,
        tipo: input.tipo,
        enunciado: input.enunciado,
        imagemUrl: input.imagemUrl,
        disciplina: input.disciplina,
        assunto: input.assunto,
        dificuldade: input.dificuldade,
        gabarito: resolveGabarito(input.alternativas, input.gabarito),
        comentario: input.comentario,
        textoApoioId: input.textoApoioId,
        alternativas: { create: input.alternativas },
      },
      include: { alternativas: true },
    });
    await tx.prova.update({ where: { id: provaId }, data: { totalQuestoes: { increment: 1 } } });
    return questao;
  });
}

export async function updateQuestao(questaoId: string, input: QuestaoInput) {
  return prisma.$transaction(async (tx) => {
    await tx.alternativa.deleteMany({ where: { questaoId } });
    return tx.questao.update({
      where: { id: questaoId },
      data: {
        numero: input.numero,
        tipo: input.tipo,
        enunciado: input.enunciado,
        imagemUrl: input.imagemUrl,
        disciplina: input.disciplina,
        assunto: input.assunto,
        dificuldade: input.dificuldade,
        gabarito: resolveGabarito(input.alternativas, input.gabarito),
        comentario: input.comentario,
        textoApoioId: input.textoApoioId ?? null,
        alternativas: { create: input.alternativas },
      },
      include: { alternativas: true },
    });
  });
}

export async function deleteQuestao(questaoId: string) {
  const questao = await prisma.questao.delete({ where: { id: questaoId } });
  await prisma.prova.update({ where: { id: questao.provaId }, data: { totalQuestoes: { decrement: 1 } } });
  return questao;
}

export async function bulkImportProvas(provas: ProvaImportInput[]) {
  const results: { provaId: string; titulo: string; questoesCriadas: number }[] = [];

  for (const provaInput of provas) {
    const { questoes, textosApoio = [], ...provaData } = provaInput;
    const id = provaSlug(provaData);

    const result = await prisma.$transaction(
      async (tx) => {
        const prova = await tx.prova.upsert({
          where: { id },
          update: provaData,
          create: { id, ...provaData },
        });

        const textoApoioIdByChave = new Map<string, string>();
        for (const texto of textosApoio) {
          const registro = await tx.textoApoio.upsert({
            where: { provaId_chave: { provaId: prova.id, chave: texto.chave } },
            update: { titulo: texto.titulo, conteudo: texto.conteudo },
            create: { provaId: prova.id, chave: texto.chave, titulo: texto.titulo, conteudo: texto.conteudo },
          });
          textoApoioIdByChave.set(texto.chave, registro.id);
        }

        for (const questao of questoes) {
          const data = {
            tipo: questao.tipo,
            enunciado: questao.enunciado,
            imagemUrl: questao.imagemUrl,
            disciplina: questao.disciplina,
            assunto: questao.assunto,
            dificuldade: questao.dificuldade,
            gabarito: resolveGabarito(questao.alternativas, questao.gabarito),
            comentario: questao.comentario,
            textoApoioId: questao.textoApoioChave ? textoApoioIdByChave.get(questao.textoApoioChave) : undefined,
          };
          await tx.questao.upsert({
            where: { provaId_numero: { provaId: prova.id, numero: questao.numero } },
            update: { ...data, alternativas: { deleteMany: {}, create: questao.alternativas } },
            create: { ...data, provaId: prova.id, numero: questao.numero, alternativas: { create: questao.alternativas } },
          });
        }

        await tx.prova.update({ where: { id: prova.id }, data: { totalQuestoes: questoes.length } });
        return { provaId: prova.id, titulo: prova.titulo, questoesCriadas: questoes.length };
      },
      { maxWait: 10_000, timeout: 60_000 }
    );

    results.push(result);
  }

  return results;
}
