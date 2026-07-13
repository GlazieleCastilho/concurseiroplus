import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { csvRowsToImportPayload, parseCsv } from "@/lib/question-import";
import { extractPdfText } from "@/services/question-extraction-service";
import { applyGabarito, buildProvaDraft, parseGabaritoText, parseProvaText } from "@/lib/prova-parser";

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo CSV, JSON ou PDF" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    let draft: unknown;

    if (name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractPdfText(buffer);
      if (text.trim().length < 40) {
        return NextResponse.json({ error: "Nao foi possivel extrair texto do PDF (pode ser um PDF escaneado sem OCR)" }, { status: 422 });
      }
      let questoes = parseProvaText(text);
      if (questoes.length === 0) {
        return NextResponse.json({ error: "Nao foi possivel identificar itens numerados no PDF. Use CSV/JSON ou cadastre manualmente." }, { status: 422 });
      }
      const gabaritoFile = form.get("gabaritoFile");
      if (gabaritoFile instanceof File) {
        const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());
        const gabaritoText = await extractPdfText(gabaritoBuffer);
        questoes = applyGabarito(questoes, parseGabaritoText(gabaritoText));
      }
      draft = buildProvaDraft(questoes, {
        banca: form.get("banca")?.toString(),
        orgao: form.get("orgao")?.toString(),
        cargo: form.get("cargo")?.toString(),
        ano: form.get("ano") ? Number(form.get("ano")) : undefined,
      });
    } else if (name.endsWith(".csv")) {
      const text = await file.text();
      draft = csvRowsToImportPayload(parseCsv(text));
    } else if (name.endsWith(".json")) {
      const text = await file.text();
      draft = JSON.parse(text);
    } else {
      return NextResponse.json({ error: "Formato nao suportado. Use .csv, .json ou .pdf" }, { status: 400 });
    }

    const validation = bulkImportSchema.safeParse(draft);
    return NextResponse.json({
      draft,
      valid: validation.success,
      errors: validation.success ? [] : validation.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      source: name.endsWith(".pdf") ? "pdf" : name.endsWith(".csv") ? "csv" : "json",
    });
  } catch (error) {
    return toErrorResponse(error, "Erro ao processar arquivo");
  }
}
