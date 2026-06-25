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
