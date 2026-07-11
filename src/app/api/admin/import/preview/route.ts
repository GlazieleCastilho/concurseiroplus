import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { csvRowsToImportPayload, parseCsv } from "@/lib/question-import";
import { draftProvaFromText, extractPdfText } from "@/services/question-extraction-service";

export const maxDuration = 60;

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
      draft = await draftProvaFromText(text, {
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
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar arquivo" }, { status: 500 });
  }
}
