/**
 * Parser deterministico de provas a partir do texto extraido de PDFs oficiais (pdf-parse).
 * Nao usa IA: so texto -> JSON via padroes de formatacao comuns as bancas
 * (item numerado, alternativas A-E ou Certo/Errado, gabarito em grade numerica).
 * Cobre o caso comum; o admin sempre revisa o rascunho antes de confirmar o import.
 */

type AlternativaDraft = {
  letra: string;
  texto: string;
  correta: boolean;
  imagemUrl?: string;
};

type QuestaoDraft = {
  numero: number;
  tipo: "OBJETIVA" | "CERTO_ERRADO";
  enunciado: string;
  imagemUrl?: string;
  gabarito?: string;
  alternativas: AlternativaDraft[];
  textoApoioChave?: string;
};

export type TextoApoioDraft = { chave: string; titulo?: string; conteudo: string };

const NOISE_LINE =
  /^(pcimarkpci\b|www\.\S+$|--\s*\d+\s+of\s+\d+\s*--$|espa[cç]o livre$|rascunho$|.*P[ÁA]GINA\s+\d+\s*$)/i;
// Numero do item seguido de texto na mesma linha.
// Aceita formatos comuns como:
//   9 Observe a charge...
//   9. Observe a charge...
//   9) Observe a charge...
//
// O lookahead evita tratar linhas de instrucoes como:
//   01 - Voce recebeu do fiscal...
// como se fossem questoes.
export const ITEM_START_INLINE =
  /^(\d{1,3})(?:[.)]\s*|[ \t]+)(?![-–—]\s)(\S.*)$/;

// Numero do item sozinho na linha, com o enunciado comecando na linha seguinte.
// Aceita tambem o numero seguido de ponto ou parenteses, comum em alguns PDFs.
export const ITEM_START_ALONE = /^(\d{1,3})\s*[.)]?\s*$/;
// Alternativa "A) texto", "A. texto", "A: texto", "A- texto" ou "(A) texto" (com ou
// sem parenteses, com ou sem espaco depois do separador).
export const ALTERNATIVA_START = /^\(?([A-E])[).:-]\s*(.*)$/;

// Titulo de texto de apoio: "Texto I", "TEXTO", "Texto 1A18-I", ou "Text I"/"Text II"
// (secoes de lingua estrangeira, ex.: Cesgranrio/Petrobras) etc. Exige a palavra com
// maiuscula (nunca minusculo dentro de uma frase corrida, ex.: "o texto abaixo") e a
// linha inteira curta (so o titulo, sem mais nada) - um titulo de verdade nunca
// continua como uma frase na mesma linha.
const TEXTO_APOIO_TITLE = /^(?:Texto|TEXTO|Text)\s*([IVXLC\d][\w-]*)?\s*$/;

function isNoise(line: string): boolean {
  return NOISE_LINE.test(line.trim());
}

// Linhas numeradas com hifen/travessao no inicio do caderno normalmente sao
// instrucoes ao candidato, e nao questoes. Ex.: "01 - Voce recebeu...".
// Mantemos essa regra separada do regex principal para nao bloquear formatos
// legitimos de questao que usam numero + texto.
const EXAM_INSTRUCTION_LINE = /^\d{1,3}\s*[-–—]\s+\S/;

function isExamInstructionLine(line: string): boolean {
  return EXAM_INSTRUCTION_LINE.test(line.trim());
}

// Sub-itens de instrucao ao candidato costumam vir em letra minuscula: "a) este
// caderno...", "b) CARTAO-RESPOSTA...". Alternativas de questao de verdade sao
// SEMPRE maiusculas (ver ALTERNATIVA_START), entao esse padrao nunca colide com
// uma alternativa real - so serve pra nao confundir texto de instrucao com
// "conteudo plausivel de questao" na busca do primeiro item (findFirstQuestionIndex).
const INSTRUCTION_SUBITEM_LINE = /^[a-e][).]\s/;

function isInstructionSubitemLine(line: string): boolean {
  return INSTRUCTION_SUBITEM_LINE.test(line.trim());
}

function isAllCapsLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length > 0 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-ZÀ-Ú]/.test(trimmed)
  );
}

/**
 * Encontra o primeiro item real da prova.
 *
 * Alguns PDFs colocam, antes das questoes, uma pagina de instrucoes numeradas
 * (01, 02, 03...) e tambem o numero da propria pagina como uma linha isolada.
 * Como ambos podem coincidir com ITEM_START_INLINE/ITEM_START_ALONE, nao basta
 * olhar apenas para o numero.
 *
 * A primeira questao real costuma ser o item 1 e vem acompanhada de texto de
 * enunciado. Para evitar confundir o numero da pagina ou uma instrucao com a
 * questao 1, procuramos o primeiro "1" que tenha uma linha de conteudo plausivel
 * logo depois. Se houver alternativas A-E proximas, o sinal fica ainda mais forte.
 */
function findFirstQuestionIndex(
  lines: string[],
  repeatedHeaders: Set<string>,
): number {
  const MAX_LOOKAHEAD = 80;

  // Documentos com pagina de instrucoes numeradas ("01 - ...", "02 - ...") tem o
  // texto de cada instrucao QUEBRADO em varias linhas pelo pdf-parse - so a
  // primeira linha de cada instrucao bate com isExamInstructionLine; as linhas de
  // continuacao ("transparente de tinta na cor preta.", por exemplo) sao texto
  // corrido comum, minusculo, indistinguivel linha a linha do enunciado de uma
  // questao real. Por isso, quando o documento tem esse tipo de instrucao em
  // algum lugar, o sinal fraco de "conteudo plausivel" (so "nao e caixa alta")
  // deixa de ser suficiente sozinho - so uma alternativa real (A)-(E) no inicio
  // da linha confirma que achamos a primeira questao de verdade.
  const documentHasNumberedInstructions = lines.some((rawLine) => isExamInstructionLine(rawLine.trim()));

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || isNoise(line) || repeatedHeaders.has(line)) continue;
    if (isExamInstructionLine(line)) continue;

    const inlineMatch = ITEM_START_INLINE.exec(line);
    const aloneMatch = inlineMatch ? null : ITEM_START_ALONE.exec(line);
    const numero = inlineMatch
      ? Number(inlineMatch[1])
      : aloneMatch
        ? Number(aloneMatch[1])
        : null;

    // As provas deste tipo normalmente comecam no item 1. Usamos esse marco
    // apenas para atravessar o material inicial (instrucoes/cabecalhos).
    if (numero !== 1) continue;

    // Descarta de cara o formato inline sem nenhum texto depois do numero (nao tem
    // como ser uma questao real). O restante da validacao (lookahead abaixo) vale
    // tanto pro formato inline quanto pro "numero sozinho": tabelas de distribuicao
    // de pontos ("1 a 10   1,0 cada   11 a 20...", comuns no topo de provas Cesgranrio)
    // tambem batem no formato inline "numero + texto" e precisam da mesma checagem,
    // senao qualquer numero "1" seguido de texto vira um falso item 1.
    if (inlineMatch && !inlineMatch[2].trim()) continue;

    // Para confirmar o candidato, precisamos diferenciar o numero da pagina (ou de
    // uma tabela/referencia de edital) de uma questao real. O numero da pagina 1
    // costuma aparecer antes dos cabecalhos e, mais adiante, surge novamente o
    // numero 1 da primeira questao. Se encontramos outro item 1 antes de qualquer
    // alternativa, o candidato atual nao era a questao 1 de verdade.
    let sawPlausibleContent = false;
    let sawAlternative = false;

    for (let j = i + 1; j < Math.min(lines.length, i + MAX_LOOKAHEAD); j += 1) {
      const next = lines[j].trim();
      if (!next || isNoise(next) || repeatedHeaders.has(next)) continue;
      if (isExamInstructionLine(next) || isInstructionSubitemLine(next)) continue;

      const nextInline = ITEM_START_INLINE.exec(next);
      const nextAlone = nextInline ? null : ITEM_START_ALONE.exec(next);
      const nextNumero = nextInline
        ? Number(nextInline[1])
        : nextAlone
          ? Number(nextAlone[1])
          : null;

      if (ALTERNATIVA_START.test(next)) {
        sawAlternative = true;
        break;
      }

      if (nextNumero !== null) {
        // Outro item 1 antes das alternativas indica que o primeiro "1" era
        // provavelmente o numero da pagina, nao o inicio da prova.
        if (nextNumero === 1) {
          sawPlausibleContent = false;
          sawAlternative = false;
          break;
        }
        // Um outro numero diferente de 1 tambem indica que este candidato
        // provavelmente nao e o inicio da primeira questao.
        break;
      }

      // Cabecalhos institucionais/disciplinas em caixa alta nao contam como
      // enunciado da questao. Continuamos procurando por conteudo real.
      if (!isAllCapsLine(next)) sawPlausibleContent = true;
    }

    if (sawAlternative || (sawPlausibleContent && !documentHasNumberedInstructions)) return i;
  }

  // Fallback para PDFs incomuns que nao possuem um marcador claro de inicio.
  // Retornar 0 preserva o comportamento anterior em vez de descartar o documento.
  return 0;
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
    const looksLikeRealContent =
      line.length > 40 ||
      /[.?!:;]$/.test(line) ||
      ALTERNATIVA_START.test(line) ||
      ITEM_START_ALONE.test(line);
    if (looksLikeRealContent) break;
    trailing.add(line);
  }
  return trailing;
}

/**
 * Titulos/subtitulos de secao (ex.: "Conhecimentos Específicos", "Bloco 1", "Língua
 * Estrangeira") aparecem uma unica vez cada, entao a heuristica de linha repetida nao
 * os pega. Mas sempre ficam bem antes de um item numerado OU de um titulo de texto de
 * apoio (a proxima questao/texto da nova secao), separando-os da ultima alternativa da
 * secao anterior. Qualquer RUN de linhas curtas, sem pontuacao de frase, que aparece
 * logo antes de um "numero do item sozinho na linha" ou de um titulo de texto de apoio
 * e tratado como titulo de secao - podem vir MAIS DE UM em sequencia (ex.: "Conhecimentos
 * Específicos" seguido de "Bloco 1"), entao caminha pra tras coletando todos, nao so o
 * mais proximo.
 */
// Quantas linhas consecutivas, no maximo, um "run" de titulo/subtitulo de secao pode
// ter (ex.: "Conhecimentos Específicos" + "Bloco 1" = 2). Sem um teto, uma caminhada
// pra tras a partir de um titulo de texto de apoio DISTANTE (paginas depois de onde a
// secao de verdade terminou) podia atravessar dezenas de linhas curtas e engolir um
// item de verdade no meio do caminho (ex.: um item em formato inline cuja primeira
// linha nao termina em pontuacao por quebrar no meio da frase).
const MAX_SECTION_TITLE_RUN = 3;

function findSectionTitleLines(lines: string[]): Set<string> {
  const titles = new Set<string>();
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!ITEM_START_ALONE.test(trimmed) && !TEXTO_APOIO_TITLE.test(trimmed)) continue;
    let collected = 0;
    for (let j = i - 1; j >= 0 && collected < MAX_SECTION_TITLE_RUN; j -= 1) {
      const candidate = lines[j].trim();
      if (!candidate) continue;
      // Um titulo de texto de apoio ("Texto I", "Text II"...) pode legitimamente
      // aparecer bem antes de um "numero sozinho" (ex.: margem/anotacao de linha
      // logo apos o titulo) e bate no mesmo padrao "curto, sem pontuacao" usado
      // abaixo pra reconhecer titulo de secao. Nunca descarta um titulo de texto
      // de apoio aqui - quem decide o destino dele e o parser principal. Tambem para
      // a caminhada pra tras (o texto de apoio anterior nao faz parte desta secao).
      if (TEXTO_APOIO_TITLE.test(candidate)) break;
      // Uma palavra quebrada por hifen de justificacao no fim da linha anterior (ex.:
      // "organiza-" / "cional") deixa a linha seguinte ("cional") curta e sem
      // pontuacao - o mesmo padrao usado abaixo pra reconhecer titulo de secao. Sem
      // essa checagem, esse tipo de continuacao de palavra e engolido como se fosse
      // titulo, cortando o conteudo real da questao (ex.: a legenda de uma questao
      // "associe", ver splitAssociationLegend). So conta como continuacao quando a
      // linha AINDA MAIS pra tras (j-1) termina com hifen colado a uma letra.
      const previousLine = j > 0 ? lines[j - 1].trim() : "";
      const isHyphenContinuation = /\p{L}-$/u.test(previousLine);
      const looksLikeRealContent =
        candidate.length > 60 ||
        /[.?!:;]$/.test(candidate) ||
        ALTERNATIVA_START.test(candidate) ||
        ITEM_START_ALONE.test(candidate) ||
        isHyphenContinuation;
      if (looksLikeRealContent) break;
      titles.add(candidate);
      collected += 1;
    }
  }
  return titles;
}

/**
 * Alguns textos de apoio do CEBRASPE trazem numeros de linha na margem (ex.: "1", "4",
 * "7", "10"... a cada 3 linhas, pra permitir que questoes referenciem "a linha 15 do
 * texto" ou citem "(R.9)" no proprio enunciado). O pdf-parse extrai essa coluna de
 * margem separada do texto principal, entao esses numeros aparecem sozinhos numa linha
 * - as vezes isolados por linhas em branco (edicoes mais recentes), as vezes
 * intercalados no meio do texto corrido sem nenhuma linha em branco (edicoes mais
 * antigas). De um jeito ou de outro, isso bate com o padrao de ITEM_START_ALONE e faz o
 * parser tratar cada numero de linha como se fosse um item novo, corrompendo a
 * contagem (o item real de mesmo numero, mais tarde, deixa de conseguir abrir um bloco
 * novo porque "numero > lastNumero" ja falhou).
 *
 * O sinal confiavel pra distinguir dos itens de verdade nao e "tem conteudo real entre
 * eles ou nao" (varia por edicao), e sim o PASSO da sequencia: item real "sozinho na
 * linha" (formato FGV) SEMPRE incrementa de 1 em 1, nunca pula. Anotacao de margem usa
 * um passo maior que 1 (normalmente 3, uma anotacao a cada 3 linhas do texto). Uma
 * sequencia de 4+ numeros com passo constante e MAIOR QUE 1 e tratada como anotacao de
 * margem, nao item de verdade - independente do que tiver entre eles.
 *
 * Retorna INDICES no array de linhas, nao o texto: um documento de 120 itens
 * inevitavelmente repete valores pequenos como "24" ou "25" como numero de item de
 * verdade em outro ponto do mesmo PDF, entao filtrar por conteudo de string apagaria
 * itens reais por coincidencia. Cada ocorrencia so pode ser avaliada pela posicao em
 * que apareceu.
 */
function findLineNumberAnnotationIndices(lines: string[]): Set<number> {
  const annotationIndices = new Set<number>();

  // Passo 1: coleta TODAS as ocorrencias de "numero sozinho na linha", na ordem em que
  // aparecem no documento, independente do que tiver entre uma e outra.
  const aloneNumbers: Array<{ numero: number; index: number }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const match = ITEM_START_ALONE.exec(line);
    if (match) aloneNumbers.push({ numero: Number(match[1]), index: i });
  }

  // Passo 2: acha sequencias maximas com passo constante > 1 dentro dessa lista.
  let run: Array<{ numero: number; index: number }> = [];
  let currentStep: number | null = null;
  function flushRun() {
    if (run.length >= 4 && currentStep !== null && currentStep > 1) {
      for (const item of run) annotationIndices.add(item.index);
    }
    run = [];
    currentStep = null;
  }
  for (const entry of aloneNumbers) {
    if (run.length === 0) {
      run.push(entry);
    } else if (run.length === 1) {
      currentStep = entry.numero - run[0].numero;
      run.push(entry);
    } else if (entry.numero - run[run.length - 1].numero === currentStep) {
      run.push(entry);
    } else {
      flushRun();
      run.push(entry);
    }
  }
  flushRun();

  return annotationIndices;
}

// Um titulo seguido de menos que isso de conteudo normalmente e um cabecalho de
// secao vazio (ex.: "TEXTO" seguido so de "BLOCO III" e uma instrucao curta), nao um
// texto de apoio de verdade — descartado silenciosamente em vez de virar uma entidade
// vazia/inutil no rascunho.
const MIN_TEXTO_APOIO_LENGTH = 100;

/**
 * PDFs com texto justificado quebram palavras longas no fim da linha com um hifen
 * (ex.: "engala-" numa linha, "nado" na proxima - a palavra real e "engalanado").
 * Juntar essas linhas com espaco simples (como o resto do texto) deixa o hifen e o
 * espaco no meio da palavra ("engala- nado"), visivel em qualquer parte da prova que
 * tenha texto corrido. So junta sem espaco (removendo o hifen) quando ha um sinal
 * forte de que e quebra de justificacao, nao um hifen de verdade: a linha termina
 * exatamente num hifen colado a uma letra (sem espaco antes) E a proxima comeca com
 * letra minuscula (continuacao da mesma palavra/frase, nunca uma sigla ou palavra
 * nova em maiusculo como em "CARTÃO-RESPOSTA", que fica intacto). Um hifen de verdade
 * (composto, enclise) que por acaso cair bem numa quebra de linha tambem bate nesse
 * padrao e acaba sem hifen (ex.: "guarda-" + "chuva" > "guardachuva") - sem dicionario
 * nao da pra distinguir os dois casos com certeza, mas quebra de justificacao e o caso
 * disparadamente mais comum (quase toda linha longa do texto corrido de um PDF
 * justificado tem uma), entao e a leitura correta por padrao.
 */
function joinDehyphenated(rawLines: string[]): string {
  let result = "";
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!result) {
      result = line;
      continue;
    }
    const hyphenMatch = /^(.*\p{L})-$/u.exec(result);
    const nextStartsLowercase = /^\p{Ll}/u.test(line);
    if (hyphenMatch && nextStartsLowercase) {
      result = `${hyphenMatch[1]}${line}`;
      continue;
    }
    result = `${result} ${line}`;
  }
  return result;
}

// Questoes do tipo "associe" (ex.: "Associe as perspectivas com os focos relacionados
// a seguir") trazem, no LAYOUT VISUAL da pagina, uma legenda em duas colunas lado a
// lado - uma lista em algarismos romanos ("I - Atividades", "II - ...") e uma lista em
// letras maiusculas ("P - Perspectiva funcional", "Q - ...") - posicionada ENTRE o
// comando da questao e as alternativas (A)-(E). Mas o texto extraido do PDF LINEARIZA
// esse layout de duas colunas: em vez de preservar a posicao visual, ele imprime as
// duas listas inteiras DEPOIS das alternativas, nao antes. Sem reconhecer esse padrao,
// a legenda inteira e tratada como texto comum e fica grudada na ultima alternativa -
// nao e um vazamento de outra questao, e sim o proprio comando desta questao impresso
// fora de ordem. Reconhecida pelo marcador "I" (primeiro algarismo romano da lista,
// sempre presente) seguido de mais pelo menos um outro marcador do mesmo tipo mais
// adiante (II, III...) - uma unica linha comecando com "I -" sozinha e fraca demais
// como sinal (podia ser coincidencia de alguma alternativa real).
// O "I" as vezes fica sozinho na sua propria linha, com o hifen e a descricao so na
// linha seguinte (variacao de quebra de linha observada no mesmo PDF, ex.: questao 43
// vs. questao 40) - aceita tanto "I - Atividades" quanto "I" isolado.
const ASSOCIATION_LEGEND_START = /^I(\s*[-–—]\s*\S.*)?$/;
// "II" (dois "I" literais) seguido do mesmo separador da primeira marca ("I -") e um
// sinal bem mais forte e especifico que qualquer algarismo romano isolado - aparecer
// como o INICIO de uma linha propria, logo depois de uma linha "I -", e praticamente
// exclusivo desse padrao de legenda (nao ha frase comum em portugues que comece assim).
const ASSOCIATION_LEGEND_SECOND_ITEM = /^II\s*[-–—]?\s*\S/;

// A PRIMEIRA linha de "lines" e sempre o comeco de verdade da propria alternativa (o
// texto logo apos a letra, ex.: "(E)") - numa questao "associe", a resposta de uma
// alternativa costuma ser justamente "I – S , II – P..." e bateria por engano no mesmo
// padrao "I -" do inicio da legenda. So procura o INICIO da legenda a partir da SEGUNDA
// linha em diante (uma legenda de verdade sempre comeca numa linha propria nova do PDF,
// nunca colada ao resto da resposta da alternativa na mesma linha).
function splitAssociationLegend(lines: string[]): { altLines: string[]; legendLines: string[] } {
  if (lines.length < 2) return { altLines: lines, legendLines: [] };
  const searchStart = 1;
  const relativeIdx = lines.slice(searchStart).findIndex((line) => ASSOCIATION_LEGEND_START.test(line));
  if (relativeIdx === -1) return { altLines: lines, legendLines: [] };
  const startIdx = searchStart + relativeIdx;
  const hasSecondItem = lines.slice(startIdx + 1).some((line) => ASSOCIATION_LEGEND_SECOND_ITEM.test(line));
  if (!hasSecondItem) return { altLines: lines, legendLines: [] };
  return { altLines: lines.slice(0, startIdx), legendLines: lines.slice(startIdx) };
}

// Questoes com afirmativas em algarismos romanos pra julgar ("I - ...", "II - ...",
// "III - ...", comum em enunciados do tipo "analise as afirmativas abaixo") ou com uma
// legenda em letras maiusculas (a segunda coluna de uma questao "associe", ver
// splitAssociationLegend: "P - ...", "Q - ...") tem cada item numa linha propria no PDF
// de origem, mas o texto inteiro e achatado numa unica linha corrida ao juntar as
// linhas do bloco - fica dificil de ler, tudo misturado sem separacao visual nenhuma.
// Insere quebra de paragrafo antes de cada item reconhecido (romano OU letra), preser-
// vando a separacao visual que o PDF original ja tinha, sem alterar uma palavra do
// conteudo. So dispara com pelo menos dois marcadores do mesmo tipo (ex.: I seguido de
// II mais adiante) - mesmo criterio de especificidade ja usado em splitAssociationLegend,
// pra nao quebrar paragrafo por engano numa frase comum que comece com uma letra ou
// algarismo romano por coincidencia.
const LIST_ITEM_MARKER_INLINE = /^(?:[IVXLC]{1,4}|[A-Z])\s*[-–—]\s*\S/;
// O marcador (mais comumente "I", o mais curto, mas tambem observado em letras como
// "P"/"Q") as vezes fica sozinho na propria linha, com o hifen e o texto do item so na
// linha seguinte - mesma variacao de quebra de linha ja tratada em ASSOCIATION_LEGEND_START.
const LIST_ITEM_MARKER_BARE = /^(?:[IVXLC]{1,4}|[A-Z])$/;
const DASH_CONTINUATION_LINE = /^[-–—]\s*\S/;

function findListItemIndexes(lines: string[]): number[] {
  const indexes: number[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (LIST_ITEM_MARKER_INLINE.test(lines[i])) {
      indexes.push(i);
    } else if (LIST_ITEM_MARKER_BARE.test(lines[i]) && i + 1 < lines.length && DASH_CONTINUATION_LINE.test(lines[i + 1])) {
      indexes.push(i);
    }
  }
  return indexes;
}

function formatWithItemBreaks(rawLines: string[]): string {
  const lines = rawLines.map((line) => line.trim()).filter((line) => line.length > 0);
  const itemIndexes = findListItemIndexes(lines);
  if (itemIndexes.length < 2) return joinDehyphenated(lines).replace(/\s+/g, " ").trim();

  const segments: string[][] = [];
  let segmentStart = 0;
  for (const idx of itemIndexes) {
    if (idx > segmentStart) segments.push(lines.slice(segmentStart, idx));
    segmentStart = idx;
  }
  segments.push(lines.slice(segmentStart));

  return segments
    .map((segment) => joinDehyphenated(segment).replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 0)
    .join("\n\n");
}

export function parseProvaText(rawText: string): { questoes: QuestaoDraft[]; textosApoio: TextoApoioDraft[] } {
  const lines = rawText.split(/\r?\n/).map((line) => line.trimEnd());
  const repeatedHeaders = findRepeatedHeaderLines(lines);
  const trailingCredits = findTrailingCreditsLines(lines);
  const sectionTitles = findSectionTitleLines(lines);

  // Encontra o primeiro item real ANTES de apagar os numeros de margem.
  // Isso evita que a heuristica de anotacoes de linha remova justamente o primeiro
  // numero da prova antes de sabermos onde o caderno de questoes realmente comeca.
  const firstQuestionIndex = findFirstQuestionIndex(lines, repeatedHeaders);

  // Apaga na origem (por indice, nao por conteudo): um numero pequeno como "24" ou "25"
  // e reaproveitado como item de verdade em outro ponto do mesmo PDF, entao so a posicao
  // exata identificada como anotacao de margem pode ser descartada com seguranca.
  for (const index of findLineNumberAnnotationIndices(lines)) lines[index] = "";

  const questoes: QuestaoDraft[] = [];
  let current: {
    numero: number;
    linhas: string[];
    textoApoioChave?: string;
    // Indices (em `linhas`) de linhas que vieram logo depois de uma quebra de pagina
    // (marca d'agua "pcimarkpci", rodape "www...", "Pagina N"...). Usado em flush()
    // pra recuperar o caso em que o texto de apoio retoma sem titulo repetido depois
    // da quebra e acaba grudado na ultima alternativa em aberto (ver comentario la).
    pageBreakIdx: number[];
  } | null = null;
  let lastNumero = 0;
  let lastRealLine: string | null = null;
  let justCrossedPageBreak = false;

  // Texto de apoio: um titulo tipo "Texto I" antes de um grupo de questoes, cujo
  // conteudo (o texto/charge/reportagem em si) e compartilhado por todas as questoes
  // seguintes ate o proximo titulo de texto de apoio.
  const textosApoio: TextoApoioDraft[] = [];
  let currentTexto: { titulo: string; linhas: string[] } | null = null;
  let activeTextoApoioChave: string | undefined;
  let textoApoioSeq = 0;
  // Fica true quando um titulo de secao e cruzado ENQUANTO currentTexto ainda esta
  // acumulando (caso real: um numero de item "abre" cedo demais por engano - ex.: uma
  // citacao "(line 19)" dentro do proprio texto de apoio bate no padrao de item sozinho
  // - entao o texto de apoio so termina de acumular e e flushado bem mais tarde, DEPOIS
  // do titulo de secao que devia separa-lo do proximo bloco). Sem isso, o flushTexto()
  // tardio reatribuiria activeTextoApoioChave ao texto que acabou de fechar, desfazendo
  // a limpeza feita no cruzamento do titulo de secao e vazando o texto de apoio pras
  // questoes do bloco seguinte (que nao tem nenhuma relacao de conteudo com ele).
  let sectionBoundaryPending = false;

  function flushTexto() {
    if (!currentTexto) return;
    const conteudo = joinDehyphenated(currentTexto.linhas).replace(/\s+/g, " ").trim();
    // Um titulo isolado sem NENHUM conteudo depois (ex.: cabecalho de secao vazio
    // que por coincidencia bateu no regex) nao vira entidade - nao ha nada pra um
    // admin revisar. Mas um titulo com algum conteudo, mesmo curto (charge com
    // legenda, citacao curta, texto cujo corpo principal esta numa imagem), e
    // preservado com um aviso em vez de descartado silenciosamente: as questoes que
    // o referenciam nao podem ficar sem chave so porque o PDF extraiu pouco texto.
    if (conteudo.length > 0) {
      textoApoioSeq += 1;
      const chave = `texto-${textoApoioSeq}`;
      textosApoio.push({
        chave,
        titulo: currentTexto.titulo,
        conteudo:
          conteudo.length >= MIN_TEXTO_APOIO_LENGTH
            ? conteudo
            : `[Texto de apoio curto ou baseado em imagem — revisar PDF original e completar manualmente.] ${conteudo}`,
      });
      if (!sectionBoundaryPending) activeTextoApoioChave = chave;
    }
    currentTexto = null;
    sectionBoundaryPending = false;
  }
  // Alguns PDFs (layout em colunas) trazem itens fora de ordem numerica no proprio
  // documento - ex.: ...15, 18, 19, 20, 16, 17... Sem isso, "16" e "17" nunca abririam
  // bloco proprio (16 e 17 nao sao > lastNumero=20) e ficariam grudados como texto
  // dentro da questao 20. Guarda quais numeros ja viraram questao pra permitir reabrir
  // um numero MENOR que lastNumero quando ele ainda nao foi usado.
  const usedNumeros = new Set<number>();

  function flush() {
    if (!current) return;
    // current.linhas ja vem sem ruido/cabecalho/credito/titulo de secao: essas linhas
    // sao descartadas com "continue" no loop principal antes de chegar aqui, entao
    // filtrar de novo seria redundante.
    const blockLines = current.linhas;
    const altStartIdx = blockLines.findIndex((line) =>
      ALTERNATIVA_START.test(line.trim()),
    );
    let associationLegend = "";
    const stemLines =
      altStartIdx === -1 ? blockLines : blockLines.slice(0, altStartIdx);
    const enunciado = formatWithItemBreaks(stemLines);

    const alternativas: AlternativaDraft[] = [];
    if (altStartIdx !== -1) {
      let letraAtual: string | null = null;
      let linhasAtual: string[] = [];
      for (const line of blockLines.slice(altStartIdx)) {
        const match = ALTERNATIVA_START.exec(line.trim());
        if (match) {
          if (letraAtual)
            alternativas.push({
              letra: letraAtual,
              texto: joinDehyphenated(linhasAtual).replace(/\s+/g, " ").trim(),
              correta: false,
            });
          letraAtual = match[1];
          linhasAtual = [match[2]];
        } else if (letraAtual) {
          linhasAtual.push(line.trim());
        }
      }
      if (letraAtual) {
        const { altLines, legendLines } = splitAssociationLegend(linhasAtual);
        alternativas.push({
          letra: letraAtual,
          texto: joinDehyphenated(altLines).replace(/\s+/g, " ").trim(),
          correta: false,
        });
        if (legendLines.length > 0) associationLegend = formatWithItemBreaks(legendLines);
      }
    }

    // Alguns PDFs em coluna dupla (ex.: secao de lingua estrangeira da Cesgranrio)
    // retomam o texto de apoio bem no meio de uma pagina seguinte SEM repetir o
    // titulo ("Texto I"/"Text I"...) - a passagem so reaparece depois da marca
    // d'agua/rodape de pagina. Sem marcador nenhum pra abrir um novo bloco, esse
    // conteudo orfao fica grudado na ultima alternativa que estava em aberto no
    // momento da quebra, inflando-a com um paragrafo inteiro sem relacao com ela.
    // So tenta recortar quando ha um sinal forte de que algo vazou (a ultima
    // alternativa ficou bem maior que as demais) E existe uma quebra de pagina
    // registrada dentro do intervalo de linhas dela - alternativas legitimas que
    // simplesmente quebram de pagina no meio de uma frase normal nunca disparam a
    // combinacao das duas condicoes.
    if (alternativas.length >= 2 && current.pageBreakIdx.length > 0) {
      let lastAltLineStart = -1;
      for (let i = blockLines.length - 1; i >= 0; i -= 1) {
        if (ALTERNATIVA_START.test(blockLines[i].trim())) {
          lastAltLineStart = i;
          break;
        }
      }
      const breakInLastAlt = current.pageBreakIdx.find((idx) => idx > lastAltLineStart);
      if (lastAltLineStart !== -1 && breakInLastAlt !== undefined) {
        const lastAlt = alternativas[alternativas.length - 1];
        const outrasLens = alternativas.slice(0, -1).map((alt) => alt.texto.length);
        const maiorOutra = outrasLens.length > 0 ? Math.max(...outrasLens) : 0;
        if (lastAlt.texto.length > 800 && lastAlt.texto.length > maiorOutra * 3) {
          const keptLines = blockLines.slice(lastAltLineStart, breakInLastAlt);
          const leakedLines = blockLines.slice(breakInLastAlt);
          const rebuiltMatch = ALTERNATIVA_START.exec(keptLines[0].trim());
          if (rebuiltMatch) {
            const linhasReconstruido = [rebuiltMatch[2], ...keptLines.slice(1).map((linha) => linha.trim())];
            lastAlt.texto = joinDehyphenated(linhasReconstruido).replace(/\s+/g, " ").trim();
          }
          const leaked = joinDehyphenated(leakedLines).replace(/\s+/g, " ").trim();
          if (leaked.length > 0 && current.textoApoioChave) {
            const texto = textosApoio.find((item) => item.chave === current!.textoApoioChave);
            if (texto) texto.conteudo = `${texto.conteudo} ${leaked}`.trim();
          }
        }
      }
    }

    // Algumas questoes (comuns em provas com figura) nao tem nenhum texto proprio alem
    // do comando compartilhado ja consumido pelo item anterior - ex.: "24. [julgue com
    // base na figura]" sem mais nada. Descartar silenciosamente perderia o item (e o
    // gabarito dele) sem o admin nem saber que ele existiu. Em vez disso, entra com um
    // placeholder visivel que aponta pra revisao manual.
    const enunciadoBase =
      enunciado.length > 0
        ? enunciado
        : `[Sem texto extraído — questão baseada em figura/imagem. Revisar o PDF original e completar o enunciado da questão ${current.numero}.]`;
    // A legenda de uma questao "associe" (ver splitAssociationLegend) e o proprio
    // comando da questao impresso fora de ordem no PDF - anexada aqui, no fim do
    // enunciado, e nao antes das alternativas: preservar a ordem exata em que ela
    // aparece no PDF de origem evita reescrever/reordenar conteudo da questao.
    const enunciadoFinal = associationLegend ? `${enunciadoBase}\n\n${associationLegend}` : enunciadoBase;
    questoes.push({
      numero: current.numero,
      tipo: "OBJETIVA",
      enunciado: enunciadoFinal,
      alternativas,
      textoApoioChave: current.textoApoioChave,
    });
  }

  // O loop comeca do inicio do documento (nao de firstQuestionIndex) porque o
  // texto de apoio da questao 1 quase sempre vem ANTES dela (ex.: "Texto I" no
  // topo da pagina 2, antes da pagina de instrucoes terminar) - comecando so em
  // firstQuestionIndex, esse texto nunca seria visto e a questao 1 ficaria sem
  // texto de apoio. So a ABERTURA de item (isForwardOpen/isOutOfOrderReopen) fica
  // proibida antes de firstQuestionIndex: sem essa barreira, PDFs como o da
  // Cesgranrio/Petrobras (pagina de instrucoes numeradas "01 - ...", "02 - ..." ate
  // "12 - ...") teriam essas instrucoes transformadas em questoes 1..12 e, quando
  // a pagina 2 chegasse, as questoes reais 1..12 ficariam menores que lastNumero e
  // seriam anexadas a "questao 12".
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();

    if (isNoise(line)) {
      // Marca que a proxima linha de conteudo real vem logo depois de uma quebra de
      // pagina (marca d'agua/rodape/numero de pagina) - ver uso em flush().
      justCrossedPageBreak = true;
      continue;
    }
    if (!line || repeatedHeaders.has(line) || trailingCredits.has(line)) continue;

    // Titulo de texto de apoio ("Texto I", "TEXTO", "Texto 1A18-I"...): fecha
    // qualquer questao aberta (o titulo nunca faz parte do enunciado de uma questao)
    // e passa a acumular o conteudo do texto de apoio em vez do enunciado de questao.
    // activeTextoApoioChave so e atualizada quando o corpo capturado for substancial
    // (flushTexto) - zera aqui pra nao deixar questoes seguintes herdarem por engano
    // a chave de um texto de apoio anterior quando este aqui falha por ser curto
    // demais (ex.: cabecalho de secao vazio). Verificado ANTES de sectionTitles: um
    // titulo de texto de apoio nunca deve ser tratado como titulo de secao generico,
    // mesmo no caso (hoje nao observado em nenhum fixture real, mas defensivo) de
    // um PDF cujo layout faca o titulo cair bem antes de um "numero sozinho".
    if (TEXTO_APOIO_TITLE.test(line)) {
      flush();
      current = null;
      flushTexto();
      activeTextoApoioChave = undefined;
      currentTexto = { titulo: line, linhas: [] };
      lastRealLine = line;
      justCrossedPageBreak = false;
      continue;
    }

    if (sectionTitles.has(line)) {
      // Um titulo de secao ("CONHECIMENTOS ESPECIFICOS", "BLOCO 1"...) marca a
      // fronteira entre um bloco de questoes (ex.: interpretacao de texto, com
      // texto de apoio compartilhado) e o proximo bloco, tipicamente de assunto
      // totalmente diferente. Sem limpar aqui, activeTextoApoioChave continuaria
      // valendo por posicao pras questoes do bloco seguinte, atribuindo a elas o
      // texto de apoio do bloco anterior mesmo sem nenhuma relacao de conteudo.
      activeTextoApoioChave = undefined;
      if (currentTexto) sectionBoundaryPending = true;
      justCrossedPageBreak = false;
      continue;
    }

    // Linhas de instrucao com hifen nao casam com ITEM_START_INLINE. Se ja estivermos
    // dentro de uma questao, elas permanecem como texto do bloco em vez de abrirem um item.

    const inlineMatch = ITEM_START_INLINE.exec(rawLine);
    const aloneMatch = inlineMatch ? null : ITEM_START_ALONE.exec(line);
    const numero = inlineMatch
      ? Number(inlineMatch[1])
      : aloneMatch
        ? Number(aloneMatch[1])
        : null;

    // Um numero que da inicio a um item de verdade no formato inline sempre vem
    // depois de conteudo que "fechou" (pontuacao de frase no fim da ultima linha
    // real) - o proprio numero do item so aparece apos a alternativa/enunciado
    // anterior terminar. Um numero que e so um dado dentro de uma frase corrida
    // (ex.: "...grow from about" quebra de linha e o pdf-parse extrai "10 per
    // cent of GDP..." como se fosse uma linha nova) aparece no meio de uma frase
    // que ainda nao terminou. So aplica essa exigencia ao formato inline: o
    // formato "numero sozinho" ja e menos ambiguo (a linha inteira e so o numero).
    const previousLineEndedSentence =
      lastRealLine === null || /[.?!:;]$/.test(lastRealLine);
    const isPlausibleItemStart = aloneMatch !== null || previousLineEndedSentence;
    const isForwardOpen =
      lineIndex >= firstQuestionIndex &&
      numero !== null && numero > lastNumero && numero <= lastNumero + 30 && isPlausibleItemStart;
    // So reabre pra tras no formato "numero sozinho" (o menos ambiguo: a linha inteira
    // e so o numero, sem risco de ser um dado no meio de uma frase) e so quando esse
    // numero especifico ainda nao apareceu como questao - um numero ja usado quase
    // certamente e uma referencia dentro do enunciado (ex.: "questao 16" citada em
    // outro contexto), nao uma reabertura legitima.
    const isOutOfOrderReopen =
      lineIndex >= firstQuestionIndex &&
      numero !== null &&
      aloneMatch !== null &&
      numero > 0 &&
      numero < lastNumero &&
      lastNumero - numero <= 30 &&
      !usedNumeros.has(numero);

    // Numero de pagina "cru" (so o digito, sem "Pagina"/"PÁGINA" na frente - por isso
    // NOISE_LINE nao pega) logo apos a marca d'agua/rodape de quebra de pagina. Quando
    // esse numero coincide com uma questao ja usada antes, nao abre nem reabre nada
    // (isForwardOpen e isOutOfOrderReopen ambos falham) e cairia como texto solto
    // dentro do que estiver aberto no momento - ex.: "(E) II e III" ganhando um "8"
    // grudado no final so porque a pagina 8 comecava logo ali. Descarta em vez de
    // acumular: um numero de pagina nunca e conteudo real de questao.
    const isStrayPageNumber =
      aloneMatch !== null && justCrossedPageBreak && !isForwardOpen && !isOutOfOrderReopen;

    if (isForwardOpen || isOutOfOrderReopen) {
      flush();
      // O texto de apoio (se houver um sendo acumulado) termina aqui: agora que sabemos
      // o corpo completo dele, decide se vira uma entidade de verdade e atualiza a
      // chave que esta questao (e as seguintes) vao referenciar.
      flushTexto();
      lastNumero = numero as number;
      usedNumeros.add(numero as number);
      current = {
        numero: numero as number,
        linhas: inlineMatch ? [inlineMatch[2]] : [],
        textoApoioChave: activeTextoApoioChave,
        pageBreakIdx: [],
      };
    } else if (isStrayPageNumber) {
      // Descarta silenciosamente - nao acumula em current nem currentTexto, e nao
      // conta como "ultima linha real" (mesmo tratamento das linhas de isNoise).
      continue;
    } else if (current) {
      if (justCrossedPageBreak) current.pageBreakIdx.push(current.linhas.length);
      current.linhas.push(line);
    } else if (currentTexto) {
      currentTexto.linhas.push(line);
    }

    justCrossedPageBreak = false;
    lastRealLine = line;
  }
  flush();
  flushTexto();

  // O tipo da questao e decidido olhando a prova inteira, nao cada questao isolada:
  // num caderno majoritariamente objetivo (A-E), uma questao sem alternativas quase
  // certamente e falha de parse — fabricar "Certo/Errado" nela mascararia o problema
  // com dado inventado. Ja num caderno onde quase nenhuma questao tem alternativas
  // (estilo CEBRASPE), itens sem alternativa SAO certo/errado de verdade.
  const comAlternativas = questoes.filter(
    (questao) => questao.alternativas.length >= 2,
  ).length;
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

  // textoApoioChave e atribuida por posicao (o texto de apoio mais recente antes da
  // questao no fluxo linearizado do PDF) - o que falha quando o layout em colunas
  // intercala paginas (ex.: uma pagina com 2 colunas, uma ainda terminando questoes
  // do texto anterior enquanto a outra ja comecou o titulo do texto seguinte). Como
  // e comum a questao citar o titulo do texto de apoio explicitamente no proprio
  // enunciado ("Segundo o Texto I...", "Considere o trecho do Texto II..."), uma
  // mencao explicita e um sinal mais confiavel que a posicao e sobrescreve o valor
  // atribuido por posicao quando os dois divergem.
  for (const questao of questoes) {
    for (const texto of textosApoio) {
      if (texto.chave === questao.textoApoioChave) continue;
      if (!texto.titulo) continue;
      const escaped = texto.titulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`).test(questao.enunciado)) {
        questao.textoApoioChave = texto.chave;
        break;
      }
    }
  }

  // Nem toda questao cita o titulo do texto de apoio por extenso ("Segundo o Texto
  // II..."); e comum citar um TRECHO ENTRE ASPAS do proprio texto sem nomea-lo (ex.:
  // “Não me consta que já houvesse um ‘diferenciado’ negativamente marcado.”). Quando
  // esse trecho aparece, literalmente, dentro do conteudo de um texto de apoio que NAO
  // e o atribuido por posicao, isso e um sinal tao confiavel quanto a mencao explicita
  // ao titulo (o mesmo tipo de vazamento de layout em colunas: uma coluna ja mostra o
  // titulo do texto seguinte enquanto a outra ainda tem questoes do anterior).
  const QUOTED_SPAN = /[“"]([^”"]{15,}?)[”"]/gu;
  const normalizeForQuoteMatch = (value: string) =>
    value.replace(/[‘’“”"']/g, "").replace(/\s+/g, " ").trim();
  for (const questao of questoes) {
    const quotes = Array.from(questao.enunciado.matchAll(QUOTED_SPAN), (match) =>
      normalizeForQuoteMatch(match[1]),
    ).filter((quote) => quote.length >= 15);
    if (quotes.length === 0) continue;
    for (const texto of textosApoio) {
      if (texto.chave === questao.textoApoioChave) continue;
      const conteudoNormalizado = normalizeForQuoteMatch(texto.conteudo);
      if (quotes.some((quote) => conteudoNormalizado.includes(quote))) {
        questao.textoApoioChave = texto.chave;
        break;
      }
    }
  }

  // O array reflete a ordem em que cada questao foi reconhecida no texto linearizado
  // do PDF (necessario internamente pra recuperar itens fora de ordem numerica, ver
  // isOutOfOrderReopen acima) - itens como 16/17, que aparecem fisicamente depois do
  // 20 no PDF de origem (layout em colunas), ficam fora de ordem no array resultante.
  // Isso e correto pra reconstruir o conteudo de cada questao, mas nao faz sentido
  // como ordem de EXIBICAO pro admin revisar - ordena por numero so no final, depois
  // que toda a recuperacao/atribuicao de texto de apoio ja aconteceu.
  questoes.sort((a, b) => a.numero - b.numero);

  return { questoes, textosApoio };
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
export function detectParsingAnomaly(
  rawText: string,
  questoes: QuestaoDraft[],
): string | null {
  const hardOversized = questoes.find(
    (questao) => questao.enunciado.length > HARD_MAX_ENUNCIADO_LENGTH,
  );
  if (hardOversized) {
    return `A questão ${hardOversized.numero} ficou com ${hardOversized.enunciado.length} caracteres, muito acima do que qualquer questão real costuma ter — mesmo com texto de apoio longo. Isso indica que o parser não conseguiu separar os itens corretamente neste PDF. Use CSV/JSON ou cadastre manualmente.`;
  }

  const suspicious = questoes.find(
    (questao) =>
      questao.enunciado.length > SUSPICIOUS_ENUNCIADO_LENGTH &&
      isSuspiciousAlternativaCount(questao.alternativas.length),
  );
  if (suspicious) {
    return `A questão ${suspicious.numero} ficou com ${suspicious.enunciado.length} caracteres e ${suspicious.alternativas.length} alternativa(s) — essa combinação sugere que duas ou mais questões foram mescladas por engano neste PDF (provavelmente o layout não quebra linha entre o número do item e o texto, ou as alternativas estão escritas em formato "(A) ... (B) ..." dentro do parágrafo). Use CSV/JSON ou cadastre manualmente.`;
  }

  const meaningfulLength = rawText.replace(/\s+/g, " ").trim().length;
  const expectedMinQuestoes = Math.floor(
    meaningfulLength / (TYPICAL_QUESTAO_LENGTH_FOR_COVERAGE_CHECK * 3),
  );
  if (
    expectedMinQuestoes > 0 &&
    questoes.length > 0 &&
    questoes.length < expectedMinQuestoes
  ) {
    return `Foram identificadas apenas ${questoes.length} questão(ões) para um texto de ${meaningfulLength} caracteres, bem menos do que o esperado. O parser provavelmente não conseguiu segmentar os itens neste layout de PDF. Use CSV/JSON ou cadastre manualmente.`;
  }
  return null;
}

/**
 * Diferente de detectParsingAnomaly (que bloqueia o import inteiro quando o problema
 * indica que o parse como um todo provavelmente falhou), isso e um aviso pontual: mais
 * de 6 alternativas so pode acontecer numa questao especifica que foi mesclada com
 * outra (nenhuma questao objetiva real tem mais que 5, A-E) - mas normalmente e um
 * problema ISOLADO a uma ou duas questoes num PDF grande que, fora isso, parseou bem.
 * Bloquear o rascunho inteiro por causa de 1-2 questoes ruins obrigaria o admin a
 * cadastrar tudo de novo via CSV/JSON em vez de so corrigir as questoes marcadas na
 * revisao - por isso isso retorna avisos em vez de travar o preview.
 */
export function findAlternativaCountWarnings(questoes: QuestaoDraft[]): string[] {
  const countWarnings = questoes
    .filter((questao) => questao.alternativas.length > 6)
    .map(
      (questao) =>
        `Questão ${questao.numero}: ficou com ${questao.alternativas.length} alternativas — nenhuma questão objetiva real tem mais que 5 (A-E). Provavelmente duas ou mais questões foram mescladas (o PDF pode ter itens fora de ordem numérica). Revise ou refaça essa questão manualmente antes de confirmar.`,
    );

  // Alem da contagem, uma unica alternativa MUITO maior que as irmas tambem indica
  // mesclagem - tipico de tabela/legenda de questao "associe" (ex.: "I - P, II - Q...")
  // que o PDF imprime fora de ordem, longe do proprio enunciado, e acaba grudada na
  // ultima alternativa de outra questao qualquer que estiver em aberto naquele ponto
  // do texto. Diferente do vazamento por quebra de pagina (ja tratado e recortado
  // automaticamente em flush()), esse nao tem um marcador de pagina pra ancorar um
  // recorte automatico com seguranca - so avisa, nao tenta consertar sozinho.
  const lengthWarnings = questoes
    .filter((questao) => questao.alternativas.length >= 2)
    .filter((questao) => {
      const lengths = questao.alternativas.map((alt) => alt.texto.length);
      const maxLength = Math.max(...lengths);
      const otherLengths = lengths.filter((length) => length !== maxLength);
      const maxOther = otherLengths.length > 0 ? Math.max(...otherLengths) : 0;
      return maxLength > 150 && maxLength > maxOther * 3;
    })
    .map(
      (questao) =>
        `Questão ${questao.numero}: uma das alternativas ficou muito maior que as demais — provavelmente uma tabela/legenda de outra questão (comum em questões "associe") grudou nela por engano. Revise essa questão manualmente antes de confirmar.`,
    );

  return [...countWarnings, ...lengthWarnings];
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
function parseVersionedGrid(
  lines: string[],
): Array<{ header: string; gabarito: Map<number, string> }> {
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
export function parseGabaritoText(
  rawText: string,
  selector?: GabaritoSelector,
): Map<number, string> {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const versionedSections = parseVersionedGrid(lines);
  if (versionedSections.length > 0) {
    const wantedVersao = selector?.provaVersao?.match(/\d+/)?.[0];
    const wantedCargo = selector?.cargo ? normalize(selector.cargo) : null;

    const byVersaoAndCargo = versionedSections.filter((section) => {
      const versaoMatch = wantedVersao
        ? new RegExp(`PROVA\\s+0*${wantedVersao}\\b`, "i").test(section.header)
        : true;
      const cargoMatch = wantedCargo
        ? normalize(section.header).includes(wantedCargo)
        : true;
      return versaoMatch && cargoMatch;
    });

    const chosen =
      byVersaoAndCargo[0] ??
      versionedSections.find((section) =>
        wantedVersao
          ? new RegExp(`PROVA\\s+0*${wantedVersao}\\b`, "i").test(
              section.header,
            )
          : true,
      ) ??
      versionedSections[0];
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
    if (
      digitsOnly.test(line) &&
      next &&
      lettersOrPadding.test(next) &&
      /[A-E]/.test(next)
    ) {
      const semPadding = next.replace(/0+$/, "");
      for (const letra of semPadding) {
        sequential += 1;
        gabarito.set(sequential, letra);
      }
    }
  }

  return gabarito;
}

export function applyGabarito(
  questoes: QuestaoDraft[],
  gabarito: Map<number, string>,
): QuestaoDraft[] {
  return questoes.map((questao) => {
    const letra = gabarito.get(questao.numero);
    if (!letra) return questao;
    return {
      ...questao,
      gabarito: letra,
      alternativas: questao.alternativas.map((alt) => ({
        ...alt,
        correta: alt.letra.toUpperCase() === letra.toUpperCase(),
      })),
    };
  });
}

/** Aplica URLs de imagem extraidas do PDF as questoes/alternativas correspondentes. */
export function applyImages(
  questoes: QuestaoDraft[],
  assignments: Array<{ numero: number; letra: string | null; url: string }>,
): QuestaoDraft[] {
  return questoes.map((questao) => {
    const questaoImage = assignments.find(
      (a) => a.numero === questao.numero && a.letra === null,
    );
    const alternativas = questao.alternativas.map((alt) => {
      const altImage = assignments.find(
        (a) =>
          a.numero === questao.numero &&
          a.letra?.toUpperCase() === alt.letra.toUpperCase(),
      );
      return altImage ? { ...alt, imagemUrl: altImage.url } : alt;
    });
    return questaoImage
      ? { ...questao, imagemUrl: questaoImage.url, alternativas }
      : { ...questao, alternativas };
  });
}

export type ExamLevelHint = "FUNDAMENTAL" | "MEDIO" | "SUPERIOR";

export type ProvaHints = {
  banca?: string;
  orgao?: string;
  cargo?: string;
  ano?: number;
  nivel?: ExamLevelHint[];
};

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

// Sinal explicito de nivel de escolaridade no texto do edital/prova. Um mesmo concurso
// pode ter mais de um nivel (cargos diferentes com exigencias diferentes), entao busca
// TODOS os niveis mencionados em vez de parar no primeiro.
const NIVEL_PATTERNS: Array<{ nivel: ExamLevelHint; regex: RegExp }> = [
  { nivel: "FUNDAMENTAL", regex: /N[ÍI]VEL\s+FUNDAMENTAL|ENSINO\s+FUNDAMENTAL/ },
  { nivel: "MEDIO", regex: /N[ÍI]VEL\s+M[ÉE]DIO|ENSINO\s+M[ÉE]DIO/ },
  { nivel: "SUPERIOR", regex: /N[ÍI]VEL\s+SUPERIOR|ENSINO\s+SUPERIOR/ },
];

function inferNivel(upper: string): ExamLevelHint[] | undefined {
  const encontrados = NIVEL_PATTERNS.filter((padrao) => padrao.regex.test(upper)).map((padrao) => padrao.nivel);
  return encontrados.length > 0 ? encontrados : undefined;
}

/**
 * Infere banca, ano e nivel do texto extraido do PDF, apenas quando ha sinal explicito
 * (nome de banca conhecida no documento; ano em "Edital ... 2021" / "Concurso Publico 2025";
 * nivel em "Nivel Superior"/"Ensino Medio" etc.). Nao tenta advinhar por frequencia: o
 * corpo das provas cita anos de leis e obras (ex.: prova de 2025 cujo ano mais frequente
 * no texto e 2021), entao qualquer heuristica estatistica marcaria a prova com o dado errado.
 */
export function inferProvaHints(
  rawText: string,
): Pick<ProvaHints, "banca" | "ano" | "nivel"> {
  const upper = rawText.toUpperCase();
  const banca = BANCAS_CONHECIDAS.find((nome) =>
    new RegExp(`(^|[^A-Z])${nome}($|[^A-Z])`).test(upper),
  );

  const anoMatch =
    /EDITAL[^\d]{0,30}\b((?:19|20)\d{2})\b/.exec(upper) ??
    /CONCURSO\s+P[ÚU]BLICO[^\d]{0,10}\b((?:19|20)\d{2})\b/.exec(upper);
  const ano = anoMatch ? Number(anoMatch[1]) : undefined;

  const nivel = inferNivel(upper);

  return { banca, ano, nivel };
}

export function buildProvaDraft(questoes: QuestaoDraft[], hints: ProvaHints, textosApoio: TextoApoioDraft[] = []) {
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
        // "Superior" e o nivel mais comum em concursos de banco de questoes; so troca
        // quando o texto traz sinal explicito ("Nivel Medio", "Ensino Fundamental" etc.).
        nivel: hints.nivel && hints.nivel.length > 0 ? hints.nivel : (["SUPERIOR"] as ExamLevelHint[]),
        duracaoMin: 240,
        textosApoio: textosApoio.map((texto) => ({ chave: texto.chave, titulo: texto.titulo, conteudo: texto.conteudo })),
        questoes: questoes.map((questao) => ({
          numero: questao.numero,
          tipo: questao.tipo,
          enunciado: questao.enunciado,
          imagemUrl: questao.imagemUrl,
          dificuldade: "MEDIUM" as const,
          gabarito: questao.gabarito,
          alternativas: questao.alternativas,
          textoApoioChave: questao.textoApoioChave,
        })),
      },
    ],
  };
}
