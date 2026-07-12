import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { planExternalProductId } from "../src/lib/billing-period";
import { plans, priceForCycle, skills } from "../src/lib/product";
import { prf2021Prova, prf2021Questoes, prf2021Textos } from "./seed-data/prf-2021";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedPlans() {
  for (const plan of plans) {
    for (const cycle of ["MENSAL", "TRIMESTRAL", "ANUAL", "VITALICIO"] as const) {
      await prisma.plan.upsert({
        where: { tier_cycle: { tier: plan.tier, cycle } },
        update: {
          name: plan.name,
          description: plan.tagline,
          priceCents: priceForCycle(plan, cycle),
          essayLimit: plan.limits.essaysPerMonth,
          discursiveLimit: plan.limits.discursivePerMonth,
          skillsLimit: plan.limits.skills,
          features: plan.features,
          externalProductId: planExternalProductId(plan.tier, cycle),
          active: true,
        },
        create: {
          tier: plan.tier,
          cycle,
          name: plan.name,
          description: plan.tagline,
          priceCents: priceForCycle(plan, cycle),
          essayLimit: plan.limits.essaysPerMonth,
          discursiveLimit: plan.limits.discursivePerMonth,
          skillsLimit: plan.limits.skills,
          features: plan.features,
          externalProductId: planExternalProductId(plan.tier, cycle),
        },
      });
    }
  }
}

async function seedSkills() {
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {
        name: skill.name,
        discipline: skill.discipline,
        description: skill.description,
        systemPrompt: skill.systemPrompt,
        active: true,
      },
      create: {
        slug: skill.slug,
        name: skill.name,
        discipline: skill.discipline,
        description: skill.description,
        systemPrompt: skill.systemPrompt,
      },
    });
  }
}

async function seedProvas() {
  const provas = [
    { titulo: "Receita Federal 2024 - Auditor Fiscal", orgao: "Receita Federal", banca: "FGV", cargo: "Auditor Fiscal", ano: 2024, nivel: "SUPERIOR" as const, disciplina: "Direito Tributario", duracaoMin: 240 },
    { titulo: "TRT 2023 - Analista Judiciario", orgao: "TRT", banca: "FCC", cargo: "Analista Judiciario", ano: 2023, nivel: "SUPERIOR" as const, disciplina: "Direito Constitucional", duracaoMin: 210 },
    { titulo: "Policia Federal 2021 - Agente", orgao: "Policia Federal", banca: "CESPE", cargo: "Agente", ano: 2021, nivel: "SUPERIOR" as const, disciplina: "Conhecimentos Gerais", duracaoMin: 240 },
  ];

  for (const prova of provas) {
    const created = await prisma.prova.upsert({
      where: { id: `${prova.banca.toLowerCase()}-${prova.ano}-${prova.cargo.toLowerCase().replaceAll(" ", "-")}` },
      update: prova,
      create: {
        id: `${prova.banca.toLowerCase()}-${prova.ano}-${prova.cargo.toLowerCase().replaceAll(" ", "-")}`,
        ...prova,
        dataProva: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        popularidade: 100,
      },
    });

    for (let index = 1; index <= 5; index += 1) {
      const questao = await prisma.questao.upsert({
        where: { provaId_numero: { provaId: created.id, numero: index } },
        update: {},
        create: {
          provaId: created.id,
          numero: index,
          tipo: "OBJETIVA",
          enunciado: `Questao ${index}. Julgue o item conforme o estilo da banca ${created.banca}, considerando o conteudo de ${created.disciplina ?? "concursos publicos"}.`,
          disciplina: created.disciplina,
          assunto: "Simulado inicial",
          dificuldade: index % 2 === 0 ? "MEDIUM" : "EASY",
          gabarito: "A",
        },
      });

      for (const letra of ["A", "B", "C", "D", "E"]) {
        await prisma.alternativa.upsert({
          where: { questaoId_letra: { questaoId: questao.id, letra } },
          update: {},
          create: {
            questaoId: questao.id,
            letra,
            texto: letra === "A" ? "Alternativa correta conforme o gabarito oficial." : `Alternativa ${letra} com distrator plausivel.`,
            correta: letra === "A",
          },
        });
      }
    }
    await prisma.prova.update({ where: { id: created.id }, data: { totalQuestoes: 5 } });
  }
}

async function seedProvaReal() {
  const id = `${prf2021Prova.banca.toLowerCase()}-${prf2021Prova.ano}-${prf2021Prova.cargo.toLowerCase().replaceAll(/\s+/g, "-")}`;
  const prova = await prisma.prova.upsert({
    where: { id },
    update: prf2021Prova,
    create: { id, ...prf2021Prova },
  });

  const textoIdByChave = new Map<string, string>();
  for (const texto of prf2021Textos) {
    const registro = await prisma.textoApoio.upsert({
      where: { provaId_chave: { provaId: prova.id, chave: texto.chave } },
      update: { titulo: texto.titulo, conteudo: texto.conteudo },
      create: { provaId: prova.id, ...texto },
    });
    textoIdByChave.set(texto.chave, registro.id);
  }

  for (const questao of prf2021Questoes) {
    const { textoApoioChave, alternativas, ...rest } = questao;
    const textoApoioId = textoApoioChave ? textoIdByChave.get(textoApoioChave) : undefined;
    await prisma.questao.upsert({
      where: { provaId_numero: { provaId: prova.id, numero: rest.numero } },
      update: { ...rest, textoApoioId, alternativas: { deleteMany: {}, create: alternativas } },
      create: { ...rest, provaId: prova.id, textoApoioId, alternativas: { create: alternativas } },
    });
  }

  await prisma.prova.update({ where: { id: prova.id }, data: { totalQuestoes: prf2021Questoes.length } });
}

async function seedCourses() {
  await prisma.course.upsert({
    where: { slug: "direito-constitucional-essencial" },
    update: {},
    create: {
      title: "Direito Constitucional Essencial",
      slug: "direito-constitucional-essencial",
      description: "Material de revisao objetiva para concursos de nivel superior.",
      shortDescription: "CF/88, direitos fundamentais e organizacao do Estado.",
      thumbnail: "/window.svg",
      price: 0,
      status: "PUBLISHED",
      difficulty: "MEDIUM",
      modules: {
        create: [
          {
            title: "Fundamentos",
            description: "Principios e estrutura constitucional.",
            order: 1,
            lessons: {
              create: [
                { title: "Principios fundamentais", description: "Artigos 1 a 4 da CF/88.", durationInMs: 900000, order: 1 },
                { title: "Direitos e garantias", description: "Mapas de cobranca por banca.", durationInMs: 1200000, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });
}

async function main() {
  await seedPlans();
  await seedSkills();
  await seedProvas();
  await seedProvaReal();
  await seedCourses();
  console.log("Seed Concurseiro+ concluido.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
