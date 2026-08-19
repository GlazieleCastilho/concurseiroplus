import { prisma } from "@/lib/prisma";
import type { ConcursoStatus, ExamLevel } from "@/generated/prisma";

export type ConcursoInput = {
  titulo: string;
  orgao: string;
  banca: string;
  cargo: string;
  ano: number;
  nivel: ExamLevel[];
  status?: ConcursoStatus;
  disciplina?: string;
  dataProva?: Date;
  inscricaoInicio?: Date;
  inscricaoFim?: Date;
  vagas?: number;
  salario?: string;
  editalUrl?: string;
};

export async function listConcursos() {
  return prisma.concurso.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listConcursosPublicos() {
  return prisma.concurso.findMany({ orderBy: { dataProva: "asc" }, take: 200 });
}

export async function createConcurso(input: ConcursoInput) {
  return prisma.concurso.create({ data: input });
}

export async function updateConcurso(concursoId: string, input: Partial<ConcursoInput>) {
  return prisma.concurso.update({ where: { id: concursoId }, data: input });
}

export async function deleteConcurso(concursoId: string) {
  return prisma.concurso.delete({ where: { id: concursoId } });
}
