import { z } from "zod";

export const bancaPatternSchema = z.enum(["ENEM", "CESPE", "FCC", "FGV"]);
export const skillSlugSchema = z.enum([
  "juridica",
  "gestao",
  "linguagem",
  "redacao",
  "digital",
  "logica",
  "contabil",
]);

export const billingCheckoutSchema = z.object({
  tier: z.enum(["ESSENCIAL", "PRO", "ELITE"]),
  cycle: z.enum(["MENSAL", "TRIMESTRAL", "ANUAL", "VITALICIO"]),
});

export const redacaoSubmissionSchema = z.object({
  tema: z.string().min(8).max(240),
  texto: z.string().min(400).max(12000),
  bancaPattern: bancaPatternSchema,
  simuladoId: z.string().cuid().optional(),
});

export const skillChatSchema = z.object({
  chatId: z.string().cuid().optional(),
  message: z.string().min(2).max(5000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .max(20)
    .default([]),
});

export const plannerTaskSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional(),
  discipline: z.string().max(120).optional(),
  goal: z.string().max(240).optional(),
  status: z.enum(["TODO", "DOING", "DONE", "CANCELED"]).default("TODO"),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).default("NONE"),
  startsAt: z.coerce.date().optional(),
  dueAt: z.coerce.date().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5).max(160),
  message: z.string().min(20).max(4000),
});

export const postSchema = z.object({
  content: z.string().min(3).max(2400),
  mediaUrl: z.string().url().optional(),
  tags: z.array(z.string().min(2).max(40)).max(6).default([]),
});

export const simuladoStartSchema = z.object({
  provaId: z.string().cuid(),
});

export const simuladoAnswerSchema = z.object({
  questaoId: z.string().cuid(),
  alternativaId: z.string().cuid().optional(),
  respostaTexto: z.string().max(8000).optional(),
  respostaDada: z.string().max(8).optional(),
});

export const examLevelSchema = z.enum(["FUNDAMENTAL", "MEDIO", "SUPERIOR"]);
export const questionTypeSchema = z.enum(["OBJETIVA", "CERTO_ERRADO", "DISSERTATIVA"]);
export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const provaSchema = z.object({
  titulo: z.string().min(3).max(200),
  orgao: z.string().min(2).max(160),
  banca: z.string().min(2).max(80),
  cargo: z.string().min(2).max(160),
  ano: z.coerce.number().int().min(1990).max(2100),
  nivel: examLevelSchema.default("SUPERIOR"),
  disciplina: z.string().max(120).optional(),
  dataProva: z.coerce.date().optional(),
  duracaoMin: z.coerce.number().int().min(30).max(600).default(240),
});

export const alternativaSchema = z.object({
  letra: z.string().min(1).max(2),
  texto: z.string().min(1).max(2000),
  correta: z.boolean().default(false),
});

export const textoApoioSchema = z.object({
  chave: z.string().min(1).max(80),
  titulo: z.string().max(200).optional(),
  conteudo: z.string().min(1),
});

export const questaoSchema = z
  .object({
    numero: z.coerce.number().int().min(1),
    tipo: questionTypeSchema.default("OBJETIVA"),
    enunciado: z.string().min(3),
    disciplina: z.string().max(120).optional(),
    assunto: z.string().max(120).optional(),
    dificuldade: difficultySchema.default("MEDIUM"),
    gabarito: z.string().max(20).optional(),
    comentario: z.string().max(4000).optional(),
    alternativas: z.array(alternativaSchema).max(6).default([]),
    textoApoioId: z.string().cuid().optional(),
    textoApoioChave: z.string().max(80).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.tipo === "DISSERTATIVA") return;
    if (value.alternativas.length < 2) {
      ctx.addIssue({ code: "custom", message: "Questoes objetivas ou certo/errado precisam de ao menos 2 alternativas", path: ["alternativas"] });
    }
    if (!value.alternativas.some((alternativa) => alternativa.correta) && !value.gabarito) {
      ctx.addIssue({ code: "custom", message: "Marque a alternativa correta ou informe o gabarito", path: ["gabarito"] });
    }
  });

export const provaImportSchema = provaSchema.extend({
  textosApoio: z.array(textoApoioSchema).max(60).optional().default([]),
  questoes: z.array(questaoSchema).min(1).max(500),
});

export const bulkImportSchema = z.object({
  provas: z.array(provaImportSchema).min(1).max(50),
});
