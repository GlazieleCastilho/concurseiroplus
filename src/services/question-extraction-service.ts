import { completeWithFallback } from "@/services/ai-service";
import { bulkImportSchema } from "@/schemas/app-schemas";

const MAX_CHARS = 40000;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("A IA nao retornou um JSON valido a partir do PDF");
  return JSON.parse(match[0]);
}

export type ExtractionHints = { banca?: string; orgao?: string; cargo?: string; ano?: number };

/**
 * Faz um rascunho estruturado da prova a partir do texto extraido do PDF.
 * Nunca deve ser persistido diretamente: o admin precisa revisar (principalmente gabaritos)
 * antes de confirmar o import, pois a IA pode nao capturar 100% do layout do PDF.
 */
export async function draftProvaFromText(rawText: string, hints?: ExtractionHints) {
  const text = rawText.slice(0, MAX_CHARS);
  const system = [
    "Voce estrutura provas de concursos publicos brasileiros a partir de texto extraido de um PDF oficial.",
    "Extraia apenas o que estiver explicito no texto. Nunca invente questoes, alternativas ou gabaritos.",
    "Se o gabarito de uma questao nao estiver explicito no texto, deixe o campo gabarito vazio e nao marque nenhuma alternativa como correta.",
    "Retorne apenas JSON valido, sem markdown e sem comentarios, exatamente no formato:",
    '{"provas":[{"titulo":string,"orgao":string,"banca":string,"cargo":string,"ano":number,"nivel":"FUNDAMENTAL"|"MEDIO"|"SUPERIOR","duracaoMin":number,"questoes":[{"numero":number,"tipo":"OBJETIVA"|"CERTO_ERRADO"|"DISSERTATIVA","enunciado":string,"disciplina":string,"gabarito":string,"alternativas":[{"letra":string,"texto":string,"correta":boolean}]}]}]}',
  ].join("\n");

  const hintLine = hints && Object.values(hints).some(Boolean) ? `Dados ja conhecidos sobre esta prova: ${JSON.stringify(hints)}\n\n` : "";
  const content = `${hintLine}Texto extraido do PDF:\n${text}`;

  const raw = await completeWithFallback(system, [{ role: "user", content }], 8000);
  const parsed = extractJson(raw);
  return parsed;
}

export type BulkImportDraft = ReturnType<typeof bulkImportSchema.parse>;
