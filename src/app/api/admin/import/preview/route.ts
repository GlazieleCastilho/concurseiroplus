import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { csvRowsToImportPayload, parseCsv } from "@/lib/question-import";
import { extractPdfText, extractItemPositions } from "@/services/question-extraction-service";
import { applyGabarito, applyImages, buildProvaDraft, detectParsingAnomaly, findAlternativaCountWarnings, inferProvaHints, parseGabaritoText, parseProvaText } from "@/lib/prova-parser";
import { assignImagesToQuestions, extractImagePlacements } from "@/lib/pdf-image-extractor";
import { extractFigureCrops } from "@/lib/pdf-figure-extractor";
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
    let parsingWarnings: string[] = [];

    if (name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractPdfText(buffer);
      if (text.trim().length < 40) {
        return NextResponse.json({ error: "Nao foi possivel extrair texto do PDF (pode ser um PDF escaneado sem OCR)" }, { status: 422 });
      }
      const parsed = parseProvaText(text);
      let questoes = parsed.questoes;
      const textosApoio = parsed.textosApoio;
      if (questoes.length === 0) {
        return NextResponse.json({ error: "Nao foi possivel identificar itens numerados no PDF. Use CSV/JSON ou cadastre manualmente." }, { status: 422 });
      }
      const anomaly = detectParsingAnomaly(text, questoes);
      if (anomaly) {
        return NextResponse.json({ error: anomaly }, { status: 422 });
      }
      // Diferente da anomalia acima (indica que o parse inteiro provavelmente falhou),
      // questoes com mais de 6 alternativas normalmente sao um problema isolado (ex.:
      // itens fora de ordem numerica no PDF de origem) - nao vale travar o rascunho
      // inteiro por causa de 1-2 questoes ruins quando o resto parseou certo.
      parsingWarnings = findAlternativaCountWarnings(questoes);
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
            assignments.map(async (assignment) => {
              const ext = assignment.format === "png" ? "png" : "jpg";
              const contentType = assignment.format === "png" ? "image/png" : "image/jpeg";
              return {
                numero: assignment.numero,
                letra: assignment.letra,
                url: await uploadQuestionImage(assignment.bytes, `q${assignment.numero}${assignment.letra ?? ""}.${ext}`, contentType),
              };
            })
          );
          questoes = applyImages(questoes, uploaded);
        }
      } catch (imageError) {
        // Extracao de imagem e um extra (best-effort): se falhar (ex.: storage nao
        // configurado), o rascunho de texto continua valido - mas sem avisar aqui, o
        // admin so via "a imagem nao apareceu" sem nenhum sinal do motivo real (ex.:
        // env var de storage faltando em producao), o que e indistinguivel de "essa
        // questao nunca teve imagem nenhuma".
        console.error("Falha ao extrair/subir imagens do PDF:", imageError);
        parsingWarnings.push(
          `Falha ao extrair/subir imagens do PDF: ${imageError instanceof Error ? imageError.message : String(imageError)}`,
        );
      }

      try {
        // Diagramas desenhados com vetores (linhas/caixas, ex.: esboço de classe UML,
        // rede de cronograma) nao sao objeto /Subtype /Image - extractImagePlacements
        // acima nunca os encontra. So verifica questoes que ainda ficaram sem imagem
        // (a extracao real de imagem embutida, quando existe, tem prioridade).
        const numerosSemImagem = questoes.filter((questao) => !questao.imagemUrl).map((questao) => questao.numero);
        const figureCrops = extractFigureCrops(buffer, questoes, numerosSemImagem);
        if (figureCrops.length > 0) {
          const uploaded = await Promise.all(
            figureCrops.map(async (crop) => ({
              numero: crop.numero,
              letra: null,
              url: await uploadQuestionImage(crop.bytes, `q${crop.numero}-figura.png`, "image/png"),
            }))
          );
          questoes = applyImages(questoes, uploaded);
        }
      } catch (figureError) {
        // Mesma logica best-effort do bloco de imagem acima: se falhar, o rascunho de
        // texto continua valido - mas o admin precisa de um sinal do motivo real (ver
        // comentario no catch de imagem acima).
        console.error("Falha ao extrair figuras vetoriais do PDF:", figureError);
        parsingWarnings.push(
          `Falha ao extrair figuras vetoriais do PDF: ${figureError instanceof Error ? figureError.message : String(figureError)}`,
        );
      }

      const inferred = inferProvaHints(text);
      draft = buildProvaDraft(
        questoes,
        {
          banca: form.get("banca")?.toString() || inferred.banca,
          orgao: form.get("orgao")?.toString(),
          cargo,
          ano: form.get("ano") ? Number(form.get("ano")) : inferred.ano,
          nivel: inferred.nivel,
        },
        textosApoio
      );
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
    const schemaErrors = validation.success ? [] : validation.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    const errors = [...parsingWarnings, ...schemaErrors];
    return NextResponse.json({
      draft,
      valid: validation.success && parsingWarnings.length === 0,
      errors,
      source: name.endsWith(".pdf") ? "pdf" : name.endsWith(".csv") ? "csv" : "json",
    });
  } catch (error) {
    return toErrorResponse(error, "Erro ao processar arquivo");
  }
}
