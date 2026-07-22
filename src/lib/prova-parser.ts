/**
 * Parser deterministico de provas a partir do texto extraido de PDFs oficiais (pdf-parse).
 * Nao usa IA: so texto -> JSON via padroes de formatacao comuns as bancas
 * (item numerado, alternativas A-E ou Certo/Errado, gabarito em grade numerica).
 * Cobre o caso comum; o admin sempre revisa o rascunho antes de confirmar o import.
 */

type AlternativaDraft = { letra: string; texto: string; correta: boolean; imagemUrl?: string };

type QuestaoDraft = {
  numero: number;
  tipo: "OBJETIVA" | "CERTO_ERRADO";
  enunciado: string;
  imagemUrl?: string;
  gabarito?: string;
  alternativas: AlternativaDraft[];
};

const NOISE_LINE = /^(pcimarkpci\b|www\.\S+$|--\s*\d+\s+of\s+\d+\s*--$|espa[cç]o livre$|.*P[ÁA]GINA\s+\d+\s*$)/i;
// Numero do item seguido de texto na mesma linha (ex.: CEBRASPE "9 Observe a charge...").
export const ITEM_START_INLINE = /^(\d{1,3})[ \t]+(\S.*)$/;
// Numero do item sozinho na linha, com o enunciado comecando na linha seguinte (ex.: FGV).
export const ITEM_START_ALONE = /^(\d{1,3})\s*$/;
// Alternativa "A) texto", "A. texto" ou "(A) texto" (com ou sem parenteses).
export const ALTERNATIVA_START = /^\(?([A-E])[).]\s+(.*)$/;

function isNoise(line: string): boolean {
  return NOISE_LINE.test(line.trim());
}

/**
 * Cabecalhos/rodapes institucionais (nome do orgao, banca, cargo) se repetem
 * identicos em toda pagina. Como variam de banca pra banca, nao da pra ter uma
 * lista fixa de regex — em vez disso, qualquer linha totalmente em maiusculas
 * que se repete varias vezes no documento e tratada como ruido de pagina.
 */
function findRepeatedHeaderLines(lines: string[]): Set<string> {
  const counts = new Map<string, number>();
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 4 || line.length > 160) continue;
    // Alternativas curtas do tipo "(C)  V – F – V." sao todas maiusculas e podem se
    // repetir varias vezes num mesmo caderno de prova (poucas combinacoes possiveis
    // entre varias questoes de V/F) — nunca sao cabecalho/rodape, entao ficam de fora.
    if (ALTERNATIVA_START.test(line) || ITEM_START_ALONE.test(line)) continue;
    const isAllCaps = line === line.toUpperCase() && /[A-ZÀ-Ú]/.test(line);
    if (!isAllCaps) continue;
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  const headers = new Set<string>();
  for (const [line, count] of counts) {
    if (count >= 3) headers.add(line);
  }
  return headers;
}

/**
 * Paginas de credito/encerramento (ex.: "Realização", logos de patrocinador, "FIM DA PROVA")
 * costumam vir depois da ultima alternativa sem nenhum item numerado depois, entao nao tem
 * como distingui-las por conteudo — mas sempre sao curtas, sem pontuacao de frase, e ficam
 * bem no final do documento. Caminha de tras pra frente coletando essas linhas ate achar a
 * primeira linha "de verdade" (longa ou terminada em pontuacao de frase).
 */
function findTrailingCreditsLines(lines: string[]): Set<string> {
  const trailing = new Set<string>();
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const looksLikeRealContent = line.length > 40 || /[.?!:;]$/.test(line) || ALTERNATIVA_START.test(line) || ITEM_START_ALONE.test(line);
    if (looksLikeRealContent) break;
    trailing.add(line);
  }
  return trailing;
}

/**
 * Titulos de secao (ex.: "Tópicos de Legislação", "Conhecimentos Específicos") aparecem
 * uma unica vez cada, entao a heuristica de linha repetida nao os pega. Mas sempre ficam
 * bem antes de um item numerado (a proxima questao da nova secao), separando-o da ultima
 * alternativa da secao anterior. Qualquer linha curta, sem pontuacao de frase, que aparece
 * logo antes de um "numero do item sozinho na linha" e tratada como titulo de secao.
 */
function findSectionTitleLines(lines: string[]): Set<string> {
  const titles = new Set<string>();
  for (let i = 0; i < lines.length; i += 1) {
    if (!ITEM_START_ALONE.test(lines[i].trim())) continue;
    for (let j = i - 1; j >= 0; j -= 1) {
      const candidate = lines[j].trim();
      if (!candidate) continue;
      const looksLikeRealContent =
        candidate.length > 60 || /[.?!:;]$/.test(candidate) || ALTERNATIVA_START.test(candidate) || ITEM_START_ALONE.test(candidate);
      if (looksLikeRealContent) break;
      titles.add(candidate);
      break;
    }
  }
  return titles;
}

export function parseProvaText(rawText: string): QuestaoDraft[] {
  const lines = rawText.split(/\r?\n/).map((line) => line.trimEnd());
  const repeatedHeaders = findRepeatedHeaderLines(lines);
  const trailingCredits = findTrailingCreditsLines(lines);
  const sectionTitles = findSectionTitleLines(lines);
  const questoes: QuestaoDraft[] = [];
  let current: { numero: number; linhas: string[] } | null = null;
  let lastNumero = 0;

  function flush() {
    if (!current) return;
    const blockLines = current.linhas.filter(
      (line) =>
        !isNoise(line.trim()) &&
        !repeatedHeaders.has(line.trim()) &&
        !trailingCredits.has(line.trim()) &&
        !sectionTitles.has(line.trim())
    );
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
      questoes.push({ numero: current.numero, tipo: "OBJETIVA", enunciado, alternativas });
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || isNoise(line) || repeatedHeaders.has(line) || trailingCredits.has(line) || sectionTitles.has(line)) continue;
    const inlineMatch = ITEM_START_INLINE.exec(rawLine);
    const aloneMatch = inlineMatch ? null : ITEM_START_ALONE.exec(line);
    const numero = inlineMatch ? Number(inlineMatch[1]) : aloneMatch ? Number(aloneMatch[1]) : null;
    if (numero !== null && numero > lastNumero && numero <= lastNumero + 30) {
      flush();
      lastNumero = numero;
      current = { numero, linhas: inlineMatch ? [inlineMatch[2]] : [] };
    } else if (current) {
      current.linhas.push(line);
    }
  }
  flush();

  // O tipo da questao e decidido olhando a prova inteira, nao cada questao isolada:
  // num caderno majoritariamente objetivo (A-E), uma questao sem alternativas quase
  // certamente e falha de parse — fabricar "Certo/Errado" nela mascararia o problema
  // com dado inventado. Ja num caderno onde quase nenhuma questao tem alternativas
  // (estilo CEBRASPE), itens sem alternativa SAO certo/errado de verdade.
  const comAlternativas = questoes.filter((questao) => questao.alternativas.length >= 2).length;
  const majoritariamenteObjetiva = comAlternativas > questoes.length / 2;
  for (const questao of questoes) {
    if (questao.alternativas.length >= 2) continue;
    if (majoritariamenteObjetiva) continue; // deixa OBJETIVA sem alternativas: a validacao do rascunho aponta a questao pro admin corrigir
    questao.tipo = "CERTO_ERRADO";
    questao.alternativas = [
      { letra: "C", texto: "Certo", correta: false },
      { letra: "E", texto: "Errado", correta: false },
    ];
  }

  return questoes;
}

// Teto absoluto: nenhuma questao legitima (nem estilo ENEM com texto de apoio longo
// embutido no proprio enunciado) deveria passar disso. Only usado como ultimo recurso,
// independente da contagem de alternativas.
const HARD_MAX_ENUNCIADO_LENGTH = 8000;

// Teto "suspeito": sozinho nao significa nada (questoes de concurso/ENEM com texto de
// apoio longo passam disso com frequencia) - so vira sinal de mesclagem quando combinado
// com uma contagem de alternativas fora do normal (ver isSuspiciousAlternativaCount).
const SUSPICIOUS_ENUNCIADO_LENGTH = 2500;

// Tamanho medio de questao usado so pra estimar quantas questoes um texto desse tamanho
// deveria render, na checagem de "poucas questoes pra um texto grande". Independente do
// teto por questao acima, pra nao afrouxar essa checagem quando o teto for ajustado.
const TYPICAL_QUESTAO_LENGTH_FOR_COVERAGE_CHECK = 2500;

function isSuspiciousAlternativaCount(count: number): boolean {
  // 0-1 alternativa: parser nao achou o bloco de alternativas (ou achou so uma).
  // >6: bate no maximo do schema - normalmente sinal de duas questoes "(A)...(E)"
  // coladas uma na outra.
  return count === 0 || count === 1 || count > 6;
}

/**
 * Alguns layouts de PDF (ex.: bancas que nao quebram linha entre o numero do item e o
 * enunciado, ou que escrevem as alternativas "(A) ... (B) ..." dentro do mesmo paragrafo)
 * fazem o parser por linha engolir varios itens dentro de um so bloco. O resultado passa
 * a ter poucas questoes com enunciados anormalmente longos, em vez de falhar. Detectamos
 * esse padrao aqui para recusar o rascunho em vez de devolver lixo como se fosse valido —
 * mas so quando o tamanho vem acompanhado de uma contagem de alternativas estranha, pra
 * nao recusar questoes genuinamente longas (textos de apoio embutidos, comuns em ENEM e
 * concursos) que tem uma quantidade normal de alternativas.
 */
export function detectParsingAnomaly(rawText: string, questoes: QuestaoDraft[]): string | null {
  const hardOversized = questoes.find((questao) => questao.enunciado.length > HARD_MAX_ENUNCIADO_LENGTH);
  if (hardOversized) {
    return `A questão ${hardOversized.numero} ficou com ${hardOversized.enunciado.length} caracteres, muito acima do que qualquer questão real costuma ter — mesmo com texto de apoio longo. Isso indica que o parser não conseguiu separar os itens corretamente neste PDF. Use CSV/JSON ou cadastre manualmente.`;
  }

  const suspicious = questoes.find(
    (questao) => questao.enunciado.length > SUSPICIOUS_ENUNCIADO_LENGTH && isSuspiciousAlternativaCount(questao.alternativas.length)
  );
  if (suspicious) {
    return `A questão ${suspicious.numero} ficou com ${suspicious.enunciado.length} caracteres e ${suspicious.alternativas.length} alternativa(s) — essa combinação sugere que duas ou mais questões foram mescladas por engano neste PDF (provavelmente o layout não quebra linha entre o número do item e o texto, ou as alternativas estão escritas em formato "(A) ... (B) ..." dentro do parágrafo). Use CSV/JSON ou cadastre manualmente.`;
  }

  const meaningfulLength = rawText.replace(/\s+/g, " ").trim().length;
  const expectedMinQuestoes = Math.floor(meaningfulLength / (TYPICAL_QUESTAO_LENGTH_FOR_COVERAGE_CHECK * 3));
  if (expectedMinQuestoes > 0 && questoes.length > 0 && questoes.length < expectedMinQuestoes) {
    return `Foram identificadas apenas ${questoes.length} questão(ões) para um texto de ${meaningfulLength} caracteres, bem menos do que o esperado. O parser provavelmente não conseguiu segmentar os itens neste layout de PDF. Use CSV/JSON ou cadastre manualmente.`;
  }
  return null;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Alguns editais publicam, num unico PDF, o gabarito de varias "versoes" da mesma
 * prova (PROVA 1, PROVA 2...) e/ou varios cargos, em blocos separados por um
 * cabecalho e formatados como pares de linhas "1 2 3 ... 20" / "B C A ... D".
 * Extrai cada bloco encontrado, mapeado pelo texto do cabecalho que o precede.
 */
function parseVersionedGrid(lines: string[]): Array<{ header: string; gabarito: Map<number, string> }> {
  const HEADER_LINE = /PROVA\s+0*(\d{1,2})\b/i;
  const NUMBERS_ROW = /^\d{1,3}(?:\s+\d{1,3}){2,}$/;
  const LETTERS_ROW = /^[A-E](?:\s+[A-E]){2,}$/;

  const sections: Array<{ header: string; gabarito: Map<number, string> }> = [];
  let current: { header: string; gabarito: Map<number, string> } | null = null;
  let pendingNumbers: number[] | null = null;

  for (const line of lines) {
    if (HEADER_LINE.test(line)) {
      if (current && current.gabarito.size > 0) sections.push(current);
      current = { header: line, gabarito: new Map() };
      pendingNumbers = null;
      continue;
    }
    if (!current) continue;
    if (NUMBERS_ROW.test(line)) {
      pendingNumbers = line.split(/\s+/).map(Number);
      continue;
    }
    if (pendingNumbers && LETTERS_ROW.test(line)) {
      const letras = line.split(/\s+/);
      pendingNumbers.forEach((numero, idx) => {
        if (letras[idx]) current!.gabarito.set(numero, letras[idx]);
      });
      pendingNumbers = null;
      continue;
    }
    pendingNumbers = null;
  }
  if (current && current.gabarito.size > 0) sections.push(current);

  return sections;
}

export type GabaritoSelector = { provaVersao?: string; cargo?: string };

/** Extrai pares {numero -> letra} de um PDF de gabarito oficial (grade numerica, lista simples ou grade versionada). */
export function parseGabaritoText(rawText: string, selector?: GabaritoSelector): Map<number, string> {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const versionedSections = parseVersionedGrid(lines);
  if (versionedSections.length > 0) {
    const wantedVersao = selector?.provaVersao?.match(/\d+/)?.[0];
    const wantedCargo = selector?.cargo ? normalize(selector.cargo) : null;

    const byVersaoAndCargo = versionedSections.filter((section) => {
      const versaoMatch = wantedVersao ? new RegExp(`PROVA\\s+0*${wantedVersao}\\b`, "i").test(section.header) : true;
      const cargoMatch = wantedCargo ? normalize(section.header).includes(wantedCargo) : true;
      return versaoMatch && cargoMatch;
    });

    const chosen = byVersaoAndCargo[0]
      ?? versionedSections.find((section) => (wantedVersao ? new RegExp(`PROVA\\s+0*${wantedVersao}\\b`, "i").test(section.header) : true))
      ?? versionedSections[0];
    return chosen.gabarito;
  }

  const gabarito = new Map<number, string>();

  // Formato "1 - A" / "1. B" / "1) C", uma linha por item.
  const simpleLine = /^(\d{1,3})\s*[-–.)]\s*([A-E])$/;

  // Formato "grade CEBRASPE": uma linha so de digitos (numeros dos itens colados, sem
  // separador, ex. "12345678000000000000") seguida de uma linha so de letras/zeros na
  // mesma largura (ex. "CCECECCE000000000000"). Nao da pra decodificar os numeros
  // colados de forma confiavel (numeros de 1 e 2+ digitos ficam ambiguos), mas cada
  // POSICAO da linha de letras corresponde a um item sequencial, e os "0" finais sao so
  // preenchimento da grade ate a largura fixa (20 no caso do CEBRASPE) - entao um
  // contador sequencial resolve.
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

/** Aplica URLs de imagem extraidas do PDF as questoes/alternativas correspondentes. */
export function applyImages(
  questoes: QuestaoDraft[],
  assignments: Array<{ numero: number; letra: string | null; url: string }>
): QuestaoDraft[] {
  return questoes.map((questao) => {
    const questaoImage = assignments.find((a) => a.numero === questao.numero && a.letra === null);
    const alternativas = questao.alternativas.map((alt) => {
      const altImage = assignments.find((a) => a.numero === questao.numero && a.letra?.toUpperCase() === alt.letra.toUpperCase());
      return altImage ? { ...alt, imagemUrl: altImage.url } : alt;
    });
    return questaoImage ? { ...questao, imagemUrl: questaoImage.url, alternativas } : { ...questao, alternativas };
  });
}

export type ProvaHints = { banca?: string; orgao?: string; cargo?: string; ano?: number };

// Nomes de bancas organizadoras conhecidas, do mais especifico pro mais generico.
// "CESPE" por ultimo entre os parecidos para nao capturar antes de "CEBRASPE".
const BANCAS_CONHECIDAS = [
  "CEBRASPE",
  "FGV",
  "FCC",
  "VUNESP",
  "FUNDATEC",
  "CESGRANRIO",
  "IBFC",
  "QUADRIX",
  "AOCP",
  "IADES",
  "IDECAN",
  "CONSULPLAN",
  "FEPESE",
  "FAURGS",
  "INSTITUTO AOCP",
  "CESPE",
];

/**
 * Infere banca e ano do texto extraido do PDF, apenas quando ha sinal explicito
 * (nome de banca conhecida no documento; ano em "Edital ... 2021" / "Concurso Publico 2025").
 * Nao tenta advinhar por frequencia: o corpo das provas cita anos de leis e obras
 * (ex.: prova de 2025 cujo ano mais frequente no texto e 2021), entao qualquer
 * heuristica estatistica marcaria a prova com o ano errado.
 */
export function inferProvaHints(rawText: string): Pick<ProvaHints, "banca" | "ano"> {
  const upper = rawText.toUpperCase();
  const banca = BANCAS_CONHECIDAS.find((nome) => new RegExp(`(^|[^A-Z])${nome}($|[^A-Z])`).test(upper));

  const anoMatch = /EDITAL[^\d]{0,30}\b((?:19|20)\d{2})\b/.exec(upper) ?? /CONCURSO\s+P[ÚU]BLICO[^\d]{0,10}\b((?:19|20)\d{2})\b/.exec(upper);
  const ano = anoMatch ? Number(anoMatch[1]) : undefined;

  return { banca, ano };
}

export function buildProvaDraft(questoes: QuestaoDraft[], hints: ProvaHints) {
  // Sem placeholders: campo nao informado nem inferido fica vazio e reprova na
  // validacao do rascunho (o preview lista o que falta). Placeholder silencioso
  // ("BANCA", "Cargo") gerava o mesmo slug pra provas diferentes e o import em
  // massa sobrescrevia uma prova com a outra.
  const banca = hints.banca?.trim() ?? "";
  const orgao = hints.orgao?.trim() ?? "";
  const cargo = hints.cargo?.trim() ?? "";
  const ano = hints.ano;
  const titulo = banca && ano && cargo ? `${banca} ${ano} - ${cargo}` : "";
  return {
    provas: [
      {
        titulo,
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
          imagemUrl: questao.imagemUrl,
          dificuldade: "MEDIUM" as const,
          gabarito: questao.gabarito,
          alternativas: questao.alternativas,
        })),
      },
    ],
  };
}
