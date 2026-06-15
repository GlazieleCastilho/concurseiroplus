import type { BancaPattern } from "@/generated/prisma";

type ChatMessage = { role: "user" | "assistant"; content: string };

export type EssayFeedback = {
  totalScore: number;
  criterios: Array<{ nome: string; nota: number; max: number; justificativa: string }>;
  trechos: Array<{ trecho: string; problema: string; sugestao: string }>;
  sugestoes: string[];
  versaoMelhorada: string;
  feedbackGeral: string;
};

const essayCriteria: Record<BancaPattern, string> = {
  ENEM: "C1, C2, C3, C4 e C5, cada uma de 0 a 200, total maximo 1000.",
  CESPE: "Adequacao ao tema, estrutura argumentativa, clareza e objetividade, norma culta, cada uma de 0 a 10, total maximo 40.",
  FCC: "Conteudo e pertinencia, organizacao textual, expressao e linguagem, cada uma de 0 a 10, total maximo 30.",
  FGV: "Desenvolvimento argumentativo, coerencia logica e adequacao ao comando, cada uma de 0 a 10, total maximo 30.",
};

function requireKey(name: string): string {
  const value = process.env[name];
  if (!value) throw new Response(`${name} is not configured`, { status: 503 });
  return value;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response did not contain JSON");
  return JSON.parse(match[0]);
}

async function callAnthropic(system: string, messages: ChatMessage[], maxTokens = 2500): Promise<string> {
  const apiKey = requireKey("ANTHROPIC_API_KEY");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: maxTokens,
      temperature: 0.2,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error ${response.status}: ${await response.text()}`);
  }
  const payload = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  return payload.content?.find((item) => item.type === "text")?.text ?? "";
}

async function callOpenAI(system: string, messages: ChatMessage[], maxTokens = 2500): Promise<string> {
  const apiKey = requireKey("OPENAI_API_KEY");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
  }
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content ?? "";
}

export async function completeWithFallback(system: string, messages: ChatMessage[], maxTokens = 2500): Promise<string> {
  try {
    return await callAnthropic(system, messages, maxTokens);
  } catch (anthropicError) {
    if (!process.env.OPENAI_API_KEY) throw anthropicError;
    return callOpenAI(system, messages, maxTokens);
  }
}

export async function gradeEssay(input: {
  tema: string;
  texto: string;
  bancaPattern: BancaPattern;
}): Promise<EssayFeedback> {
  const system = [
    "Voce e um agente senior de correcao de redacoes para concursos publicos brasileiros.",
    "Avalie com rigor, clareza e foco em melhoria acionavel.",
    `Padrao selecionado: ${input.bancaPattern}. Criterios: ${essayCriteria[input.bancaPattern]}`,
    "Retorne apenas JSON valido, sem markdown, seguindo exatamente:",
    '{"totalScore":number,"criterios":[{"nome":string,"nota":number,"max":number,"justificativa":string}],"trechos":[{"trecho":string,"problema":string,"sugestao":string}],"sugestoes":string[],"versaoMelhorada":string,"feedbackGeral":string}',
  ].join("\n");

  const content = `Tema: ${input.tema}\n\nRedacao:\n${input.texto}`;
  const result = await completeWithFallback(system, [{ role: "user", content }], 4000);
  const parsed = extractJson(result) as EssayFeedback;
  if (typeof parsed.totalScore !== "number" || !Array.isArray(parsed.criterios)) {
    throw new Error("Invalid essay feedback payload");
  }
  return parsed;
}

export async function* streamSkillAnswer(input: {
  systemPrompt: string;
  history: ChatMessage[];
  message: string;
}): AsyncGenerator<string> {
  const apiKey = requireKey("ANTHROPIC_API_KEY");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 1800,
      temperature: 0.25,
      stream: true,
      system: input.systemPrompt,
      messages: [...input.history, { role: "user", content: input.message }],
    }),
  });

  if (!response.ok || !response.body) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`Anthropic stream error ${response.status}: ${await response.text()}`);
    }
    const fallback = await completeWithFallback(input.systemPrompt, [...input.history, { role: "user", content: input.message }], 1800);
    yield fallback;
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      const data = dataLine.slice(6);
      if (data === "[DONE]") return;
      const parsed = JSON.parse(data) as { type?: string; delta?: { type?: string; text?: string } };
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
        yield parsed.delta.text;
      }
    }
  }
}
