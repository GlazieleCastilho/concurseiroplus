import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { csvRowsToImportPayload, parseCsv } from "@/lib/question-import";
import { extractPdfText, extractItemPositions } from "@/services/question-extraction-service";
import { applyGabarito, applyImages, buildProvaDraft, detectParsingAnomaly, parseGabaritoText, parseProvaText } from "@/lib/prova-parser";
import { assignImagesToQuestions, extractImagePlacements } from "@/lib/pdf-image-extractor";
import { uploadQuestionImage } from "@/lib/supabase-storage";

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
      const anomaly = detectParsingAnomaly(text, questoes);
      if (anomaly) {
        return NextResponse.json({ error: anomaly }, { status: 422 });
      }
      const gabaritoFile = form.get("gabaritoFile");
      const cargo = form.get("cargo")?.toString();
      if (gabaritoFile instanceof File) {
        const gabaritoBuffer = Buffer.from(await gabaritoFile.arrayBuffer());
        const gabaritoText = await extractPdfText(gabaritoBuffer);
        questoes = applyGabarito(
          questoes,
          parseGabaritoText(gabaritoText, { provaVersao: form.get("provaVersao")?.toString(), cargo })
        );
      }

      try {
        const placements = extractImagePlacements(buffer);
        if (placements.length > 0) {
          const itemPositions = await extractItemPositions(buffer);
          const assignments = assignImagesToQuestions(placements, itemPositions);
          const uploaded = await Promise.all(
            assignments.map(async (assignment) => ({
              numero: assignment.numero,
              letra: assignment.letra,
              url: await uploadQuestionImage(assignment.bytes, `q${assignment.numero}${assignment.letra ?? ""}.jpg`),
            }))
          );
          questoes = applyImages(questoes, uploaded);
        }
      } catch (imageError) {
        // Extracao de imagem e um extra (best-effort): se falhar (ex.: storage nao
        // configurado), o rascunho de texto continua valido e o admin so nao vera imagens.
        console.error("Falha ao extrair/subir imagens do PDF:", imageError);
      }

      draft = buildProvaDraft(questoes, {
        banca: form.get("banca")?.toString(),
        orgao: form.get("orgao")?.toString(),
        cargo,
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
