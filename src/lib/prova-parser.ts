export type AlternativaDraft = {
  letra: string;
  texto: string;
  correta: boolean;
  imagemUrl?: string;
};

export type QuestaoDraft = {
  numero: number;
  tipo: "OBJETIVA" | "CERTO_ERRADO";
  enunciado: string;
  imagemUrl?: string;
  gabarito?: string;
  alternativas: AlternativaDraft[];
};

const MAX_QUESTAO_NUMERO = 300;
const MAX_ALTERNATIVAS = 6;

const NOISE_LINE =
  /^(pcimarkpci\b|www\.\S+$|--\s*\d+\s+of\s+\d+\s*--$|espa[cç]o livre$|.*p[áa]gina\s+\d+\s*$)/i;

const EXAM_INSTRUCTION_LINE =
  /^\d{1,3}\s*[-–—]\s+\S/;

const ITEM_START_INLINE =
  /^\s*(?:quest[aã]o\s*)?0*(\d{1,3})\s*(?:[.)]|[-–—])\s+(?![-–—])(\S.*)$/i;

const ITEM_START_ALONE =
  /^\s*(?:quest[aã]o\s*)?0*(\d{1,3})\s*[.)]?\s*$/i;

const ALTERNATIVA_START =
  /^\s*(?:\(([A-Ea-e])\)|\[([A-Ea-e])\]|([A-Ea-e])\s*[).:\-–—])\s*(.*)$/;

const ALTERNATIVA_INLINE =
  /(?:^|\s)(?:\(([A-Ea-e])\)|\[([A-Ea-e])\]|([A-Ea-e])\s*[).:\-–—])\s*/g;

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isNoise(line: string): boolean {
  return NOISE_LINE.test(line.trim());
}

function isExamInstructionLine(line: string): boolean {
  return EXAM_INSTRUCTION_LINE.test(line.trim());
}

function isAllCapsLine(line: string): boolean {
  const value = line.trim();

  return (
    value.length > 0 &&
    value === value.toUpperCase() &&
    /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(value)
  );
}

function getItemNumber(line: string): number | null {
  const inline = ITEM_START_INLINE.exec(line);

  if (inline) {
    const numero = Number(inline[1]);
    return numero >= 1 && numero <= MAX_QUESTAO_NUMERO
      ? numero
      : null;
  }

  const alone = ITEM_START_ALONE.exec(line);

  if (alone) {
    const numero = Number(alone[1]);
    return numero >= 1 && numero <= MAX_QUESTAO_NUMERO
      ? numero
      : null;
  }

  return null;
}

function getInlineQuestionText(line: string): string | null {
  const match = ITEM_START_INLINE.exec(line);
  return match ? match[2].trim() : null;
}

function parseAlternativeMarker(line: string): {
  letra: string;
  texto: string;
} | null {
  const match = ALTERNATIVA_START.exec(line);

  if (!match) return null;

  const letra = (match[1] ?? match[2] ?? match[3]).toUpperCase();

  return {
    letra,
    texto: normalizeSpaces(match[4] ?? ""),
  };
}

function parseAlternativasFromText(text: string): AlternativaDraft[] {
  const matches = [...text.matchAll(ALTERNATIVA_INLINE)];

  if (matches.length === 0) {
    return [];
  }

  const alternativas: AlternativaDraft[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];

    const currentIndex = current.index ?? 0;
    const nextIndex = next?.index ?? text.length;

    const markerLength = current[0].length;
    const letra = (
      current[1] ??
      current[2] ??
      current[3]
    ).toUpperCase();

    const inicioTexto = currentIndex + markerLength;
    const fimTexto = nextIndex;

    const texto = normalizeSpaces(
      text.slice(inicioTexto, fimTexto),
    );

    alternativas.push({
      letra,
      texto,
      correta: false,
    });
  }

  return alternativas.slice(0, MAX_ALTERNATIVAS);
}

function findRepeatedHeaders(lines: string[]): Set<string> {
  const counts = new Map<string, number>();

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length < 4 || line.length > 160) continue;
    if (isNoise(line)) continue;
    if (ITEM_START_ALONE.test(line)) continue;
    if (parseAlternativeMarker(line)) continue;
    if (!isAllCapsLine(line)) continue;

    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count >= 3)
      .map(([line]) => line),
  );
}

function findTrailingCredits(lines: string[]): Set<string> {
  const trailing = new Set<string>();

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index].trim();

    if (!line) continue;

    const isRealContent =
      line.length > 40 ||
      /[.?!:;]$/.test(line) ||
      ITEM_START_INLINE.test(line) ||
      ITEM_START_ALONE.test(line) ||
      parseAlternativeMarker(line) !== null;

    if (isRealContent) break;

    trailing.add(line);
  }

  return trailing;
}

function findFirstQuestionIndex(
  lines: string[],
  repeatedHeaders: Set<string>,
): number {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) continue;
    if (isNoise(line)) continue;
    if (repeatedHeaders.has(line)) continue;
    if (isExamInstructionLine(line)) continue;

    const inlineText = getInlineQuestionText(line);
    const numero = getItemNumber(line);

    if (numero !== 1) continue;

    // Caso: "1. Texto da questão"
    if (inlineText && inlineText.length > 0) {
      return index;
    }

    // Caso: "1" isolado e o enunciado começa depois.
    let encontrouTexto = false;
    let encontrouAlternativa = false;

    for (
      let nextIndex = index + 1;
      nextIndex < Math.min(lines.length, index + 100);
      nextIndex += 1
    ) {
      const nextLine = lines[nextIndex].trim();

      if (!nextLine) continue;
      if (isNoise(nextLine)) continue;
      if (repeatedHeaders.has(nextLine)) continue;
      if (isExamInstructionLine(nextLine)) continue;

      if (parseAlternativeMarker(nextLine)) {
        encontrouAlternativa = true;
        break;
      }

      const nextNumero = getItemNumber(nextLine);

      // Outro item inline significa que este "1" provavelmente não era questão.
      if (
        nextNumero !== null &&
        ITEM_START_INLINE.test(nextLine)
      ) {
        break;
      }

      // Números isolados podem ser números de linha ou página.
      if (
        nextNumero !== null &&
        ITEM_START_ALONE.test(nextLine)
      ) {
        continue;
      }

      if (!isAllCapsLine(nextLine)) {
        encontrouTexto = true;
      }
    }

    if (encontrouTexto || encontrouAlternativa) {
      return index;
    }
  }

  return -1;
}

function buildAlternativas(blockLines: string[]): {
  enunciado: string;
  alternativas: AlternativaDraft[];
} {
  const linhas = blockLines.map((line) => line.trim()).filter(Boolean);

  const firstAlternativeIndex = linhas.findIndex((line) =>
    parseAlternativeMarker(line),
  );

  // Alternativas podem estar todas dentro de um único parágrafo.
  const fullText = normalizeSpaces(linhas.join(" "));
  const inlineAlternativas = parseAlternativasFromText(fullText);

  if (inlineAlternativas.length >= 2) {
    const firstMarkerIndex = fullText.search(
      /(?:^|\s)(?:\([A-Ea-e]\)|\[([A-Ea-e])\]|[A-Ea-e]\s*[).:\-–—])\s*/,
    );

    const enunciado =
      firstMarkerIndex >= 0
        ? normalizeSpaces(fullText.slice(0, firstMarkerIndex))
        : "";

    return {
      enunciado,
      alternativas: inlineAlternativas,
    };
  }

  if (firstAlternativeIndex === -1) {
    return {
      enunciado: fullText,
      alternativas: [],
    };
  }

  const stemLines = linhas.slice(0, firstAlternativeIndex);
  const alternativeLines = linhas.slice(firstAlternativeIndex);

  const alternativas: AlternativaDraft[] = [];

  let alternativaAtual: AlternativaDraft | null = null;

  for (const line of alternativeLines) {
    const marker = parseAlternativeMarker(line);

    if (marker) {
      if (alternativaAtual) {
        alternativas.push(alternativaAtual);
      }

      alternativaAtual = {
        letra: marker.letra,
        texto: marker.texto,
        correta: false,
      };

      continue;
    }

    if (alternativaAtual) {
      alternativaAtual.texto = normalizeSpaces(
        `${alternativaAtual.texto} ${line}`,
      );
    }
  }

  if (alternativaAtual) {
    alternativas.push(alternativaAtual);
  }

  return {
    enunciado: normalizeSpaces(stemLines.join(" ")),
    alternativas: alternativas.slice(0, MAX_ALTERNATIVAS),
  };
}

export function parseProvaText(rawText: string): QuestaoDraft[] {
  const originalLines = rawText
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  const repeatedHeaders = findRepeatedHeaders(originalLines);
  const trailingCredits = findTrailingCredits(originalLines);

  const firstQuestionIndex = findFirstQuestionIndex(
    originalLines,
    repeatedHeaders,
  );

  if (firstQuestionIndex === -1) {
    throw new Error(
      "Não foi possível identificar o início das questões no PDF.",
    );
  }

  const questoes: QuestaoDraft[] = [];

  let current:
    | {
        numero: number;
        linhas: string[];
      }
    | null = null;

  let ultimoNumero = 0;

  function flushCurrent() {
    if (!current) return;

    const { enunciado, alternativas } = buildAlternativas(
      current.linhas,
    );

    const enunciadoFinal =
      enunciado.length > 0
        ? enunciado
        : `[Sem texto extraído — revisar questão ${current.numero} no PDF original.]`;

    questoes.push({
      numero: current.numero,
      tipo: "OBJETIVA",
      enunciado: enunciadoFinal,
      alternativas,
    });

    current = null;
  }

  for (
    let lineIndex = firstQuestionIndex;
    lineIndex < originalLines.length;
    lineIndex += 1
  ) {
    const rawLine = originalLines[lineIndex];
    const line = rawLine.trim();

    if (!line) continue;
    if (isNoise(line)) continue;
    if (repeatedHeaders.has(line)) continue;
    if (trailingCredits.has(line)) continue;

    const numero = getItemNumber(line);
    const inlineQuestion = ITEM_START_INLINE.test(line);
    const textoInline = getInlineQuestionText(line);

    const isPotentialQuestion =
      numero !== null &&
      (inlineQuestion || ITEM_START_ALONE.test(line));

    if (isPotentialQuestion) {
      const isNextQuestion =
        current === null
          ? numero === 1
          : numero > ultimoNumero &&
            numero <= ultimoNumero + 1;

      if (isNextQuestion) {
        flushCurrent();

        ultimoNumero = numero;

        current = {
          numero,
          linhas: textoInline ? [textoInline] : [],
        };

        continue;
      }
    }

    if (current) {
      current.linhas.push(line);
    }
  }

  flushCurrent();

  if (questoes.length === 0) {
    throw new Error(
      "Nenhuma questão foi encontrada no texto extraído do PDF.",
    );
  }

  const objetivas = questoes.filter(
    (questao) => questao.alternativas.length >= 2,
  ).length;

  const maioriaObjetiva = objetivas > questoes.length / 2;

  for (const questao of questoes) {
    if (questao.alternativas.length >= 2) continue;
    if (maioriaObjetiva) continue;

    questao.tipo = "CERTO_ERRADO";
    questao.alternativas = [
      {
        letra: "C",
        texto: "Certo",
        correta: false,
      },
      {
        letra: "E",
        texto: "Errado",
        correta: false,
      },
    ];
  }

  return questoes;
}