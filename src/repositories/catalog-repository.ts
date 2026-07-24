import { prisma } from "@/lib/prisma";

export async function getFeaturedProvas() {
  return prisma.prova.findMany({
    // Simulados sao para praticar com provas que ja tem banco de questoes
    // importado; editais cadastrados em /admin/concursos (previstos/abertos/
    // em andamento, geralmente sem questoes ainda) nao devem aparecer aqui.
    where: { questoes: { some: {} } },
    orderBy: [{ dataProva: "asc" }, { popularidade: "desc" }],
    take: 12,
    include: { _count: { select: { questoes: true, simulados: true } } },
  });
}

export async function getCourses() {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { modules: { include: { lessons: true }, orderBy: { order: "asc" } } },
  });
}

export async function getRanking(period = "global") {
  return prisma.ranking.findMany({
    where: { period },
    orderBy: { position: "asc" },
    take: 50,
    include: { user: true },
  });
}

export async function getFeed() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      likes: true,
    },
  });
}
