function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    return row;
  });
}

const CSV_COLUMNS = [
  "prova_titulo",
  "orgao",
  "banca",
  "cargo",
  "ano",
  "nivel",
  "duracaoMin",
  "questao_numero",
  "tipo",
  "enunciado",
  "disciplina",
  "assunto",
  "dificuldade",
  "gabarito",
  "comentario",
  "alt_a",
  "alt_b",
  "alt_c",
  "alt_d",
  "alt_e",
] as const;

export const CSV_TEMPLATE = [
  CSV_COLUMNS.join(","),
  [
    "Receita Federal 2024 - Auditor Fiscal",
    "Receita Federal",
    "FGV",
    "Auditor Fiscal",
    "2024",
    "SUPERIOR",
    "240",
    "1",
    "OBJETIVA",
    "Assinale a alternativa correta sobre o fato gerador do tributo.",
    "Direito Tributario",
    "Fato gerador",
    "MEDIUM",
    "C",
    "",
    "Texto da alternativa A",
    "Texto da alternativa B",
    "Texto da alternativa C (correta)",
    "Texto da alternativa D",
    "",
  ]
    .map((value) => (value.includes(",") ? `"${value}"` : value))
    .join(","),
].join("\n");

/** Groups flat CSV rows (one row per questao) into the nested { provas: [...] } shape expected by bulkImportSchema. */
export function csvRowsToImportPayload(rows: CsvRow[]): unknown {
  const provasByKey = new Map<string, { prova: Record<string, unknown>; questoes: Record<string, unknown>[] }>();

  for (const row of rows) {
    const key = `${row.banca}|${row.orgao}|${row.cargo}|${row.ano}`;
    if (!provasByKey.has(key)) {
      provasByKey.set(key, {
        prova: {
          titulo: row.prova_titulo,
          orgao: row.orgao,
          banca: row.banca,
          cargo: row.cargo,
          ano: row.ano,
          nivel: (row.nivel || "SUPERIOR").split(/[/;]+/).map((value) => value.trim()).filter(Boolean),
          duracaoMin: row.duracaoMin || "240",
        },
        questoes: [],
      });
    }

    const alternativas = ["a", "b", "c", "d", "e"]
      .map((letra) => ({ letra: letra.toUpperCase(), texto: row[`alt_${letra}`] }))
      .filter((alternativa) => alternativa.texto)
      .map((alternativa) => ({
        letra: alternativa.letra,
        texto: alternativa.texto,
        correta: alternativa.letra.toUpperCase() === (row.gabarito ?? "").toUpperCase().trim(),
      }));

    provasByKey.get(key)!.questoes.push({
      numero: row.questao_numero,
      tipo: row.tipo || "OBJETIVA",
      enunciado: row.enunciado,
      disciplina: row.disciplina || undefined,
      assunto: row.assunto || undefined,
      dificuldade: row.dificuldade || "MEDIUM",
      gabarito: row.gabarito || undefined,
      comentario: row.comentario || undefined,
      alternativas,
    });
  }

  return { provas: Array.from(provasByKey.values()).map(({ prova, questoes }) => ({ ...prova, questoes })) };
}
