/**
 * Parser deterministico de provas a partir do texto extraido de PDFs oficiais (pdf-parse).
 * Nao usa IA: so texto -> JSON via padroes de formatacao comuns as bancas
 * (item numerado, alternativas A-E ou Certo/Errado, gabarito em grade numerica).
 * Cobre o caso comum; o admin sempre revisa o rascunho antes de confirmar o import.
 */

type AlternativaDraft = { letra: string; texto: string; correta: boolean };

type QuestaoDraft = {
  numero: number;
  tipo: "OBJETIVA" | "CERTO_ERRADO";
  enunciado: string;
  gabarito?: string;
  alternativas: AlternativaDraft[];
};

const NOISE_LINE = /^(pcimarkpci\b|www\.\S+$|--\s*\d+\s+of\s+\d+\s*--$|espa[cç]o livre$)/i;
const ITEM_START = /^(\d{1,3})[ \t]+(\S.*)$/;
const ALTERNATIVA_START = /^([A-E])[).]\s+(.*)$/;

function isNoise(line: string): boolean {
  return NOISE_LINE.test(line.trim());
}

export function parseProvaText(rawText: string): QuestaoDraft[] {
  const lines = rawText.split(/\r?\n/).map((line) => line.trimEnd());
  const questoes: QuestaoDraft[] = [];
  let current: { numero: number; linhas: string[] } | null = null;
  let lastNumero = 0;

  function flush() {
    if (!current) return;
    const blockLines = current.linhas.filter((line) => !isNoise(line.trim()));
    const altStartIdx = blockLines.findIndex((line) => ALTERNATIVA_START.test(line.trim()));
    const stemLines = altStartIdx === -1 ? blockLines : blockLines.slice(0, altStartIdx);
    const enunciado = stemLines.join(" ").replace(/\s+/g, " ").trim();

    const alternativas: AlternativaDraft[] = [];
    if (altStartIdx !== -1) {
      let letraAtual: string | null = null;
      let textoAtual = "";
      for (const line of blockLines.slice(altStartIdx)) {
        const match = ALTERNATIVA_START.exec(line.trim());
        if (match) {
          if (letraAtual) alternativas.push({ letra: letraAtual, texto: textoAtual.replace(/\s+/g, " ").trim(), correta: false });
          letraAtual = match[1];
          textoAtual = match[2];
        } else if (letraAtual) {
          textoAtual += ` ${line.trim()}`;
        }
      }
      if (letraAtual) alternativas.push({ letra: letraAtual, texto: textoAtual.replace(/\s+/g, " ").trim(), correta: false });
    }

    if (enunciado.length > 0) {
      questoes.push({
        numero: current.numero,
        tipo: alternativas.length >= 2 ? "OBJETIVA" : "CERTO_ERRADO",
        enunciado,
        alternativas: alternativas.length >= 2 ? alternativas : [
          { letra: "C", texto: "Certo", correta: false },
          { letra: "E", texto: "Errado", correta: false },
        ],
      });
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || isNoise(line)) continue;
    const match = ITEM_START.exec(rawLine);
    const numero = match ? Number(match[1]) : null;
    if (numero !== null && numero > lastNumero && numero <= lastNumero + 30) {
      flush();
      lastNumero = numero;
      current = { numero, linhas: [match![2]] };
    } else if (current) {
      current.linhas.push(line);
    }
  }
  flush();

  return questoes;
}

/** Extrai pares {numero -> letra} de um PDF de gabarito oficial (grade numerica ou lista simples). */
export function parseGabaritoText(rawText: string): Map<number, string> {
  const gabarito = new Map<number, string>();
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  // Formato "1 - A" / "1. B" / "1) C", uma linha por item.
  const simpleLine = /^(\d{1,3})\s*[-–.)]\s*([A-E])$/;

  // Formato "grade": uma linha so de digitos (numeros dos itens colados, sem separador,
  // ex. "12345678000000000000") seguida de uma linha so de letras/zeros na mesma largura
  // (ex. "CCECECCE000000000000"). Nao da pra decodificar os numeros colados de forma
  // confiavel (numeros de 1 e 2+ digitos ficam ambiguos), mas cada POSICAO da linha de
  // letras corresponde a um item sequencial, e os "0" finais sao so preenchimento da grade
  // ate a largura fixa (20 no caso do CEBRASPE) - entao um contador sequencial resolve.
  const digitsOnly = /^\d+$/;
  const lettersOrPadding = /^[A-E0]+$/;

  let sequential = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const simpleMatch = simpleLine.exec(line);
    if (simpleMatch) {
      gabarito.set(Number(simpleMatch[1]), simpleMatch[2]);
      continue;
    }
    const next = lines[i + 1];
    if (digitsOnly.test(line) && next && lettersOrPadding.test(next) && /[A-E]/.test(next)) {
      const semPadding = next.replace(/0+$/, "");
      for (const letra of semPadding) {
        sequential += 1;
        gabarito.set(sequential, letra);
      }
    }
  }

  return gabarito;
}

export function applyGabarito(questoes: QuestaoDraft[], gabarito: Map<number, string>): QuestaoDraft[] {
  return questoes.map((questao) => {
    const letra = gabarito.get(questao.numero);
    if (!letra) return questao;
    return {
      ...questao,
      gabarito: letra,
      alternativas: questao.alternativas.map((alt) => ({ ...alt, correta: alt.letra.toUpperCase() === letra.toUpperCase() })),
    };
  });
}

export type ProvaHints = { banca?: string; orgao?: string; cargo?: string; ano?: number };

export function buildProvaDraft(questoes: QuestaoDraft[], hints: ProvaHints) {
  const banca = hints.banca?.trim() || "BANCA";
  const orgao = hints.orgao?.trim() || "Orgao";
  const cargo = hints.cargo?.trim() || "Cargo";
  const ano = hints.ano ?? new Date().getFullYear();
  return {
    provas: [
      {
        titulo: `${banca} ${ano} - ${cargo}`,
        orgao,
        banca,
        cargo,
        ano,
        nivel: "SUPERIOR" as const,
        duracaoMin: 240,
        questoes: questoes.map((questao) => ({
          numero: questao.numero,
          tipo: questao.tipo,
          enunciado: questao.enunciado,
          dificuldade: "MEDIUM" as const,
          gabarito: questao.gabarito,
          alternativas: questao.alternativas,
        })),
      },
    ],
  };
}
