/**
 * Recorta figuras desenhadas com vetores (linhas/caixas/tabelas, ex.: diagramas de
 * rede de cronograma, esboços de classe UML) que NAO sao imagem embutida no PDF -
 * pdf-image-extractor.ts so encontra objetos /Subtype /Image de verdade, entao um
 * diagrama assim nunca aparece la.
 *
 * Nao ha como achar o bounding box exato de um desenho vetorial sem re-implementar
 * boa parte de um interpretador de content stream (fora do escopo aqui). Em vez
 * disso, usa um sinal indireto bem mais simples: o espaçamento vertical entre linhas
 * de texto extraidas da pagina. Texto corrido tem ~10-15pt entre linhas; um espaço
 * bem maior que isso quase sempre e uma figura/tabela/diagrama ocupando aquele vao.
 * Para cada questao, procura o primeiro vao desse tipo dentro do intervalo Y que ela
 * ocupa na pagina e recorta so aquela regiao.
 *
 * ONDE cada questao comeca na pagina e localizado por CASAMENTO DE TEXTO (o comeco do
 * enunciado, ja extraido e validado por parseProvaText em prova-parser.ts), NAO por
 * tentar re-detectar "numero de item sozinho na linha" a partir do zero contra o texto
 * do mupdf. A primeira versao fazia isso e colidia com numeros de citacao de linha
 * dentro de textos de apoio em ingles (ex.: "(line 23)", "(lines 28-38)", comuns na
 * secao de lingua estrangeira desta prova) - quando o mupdf quebra essas citacoes numa
 * linha propria, elas batem no mesmo padrao "numero sozinho" de um item de verdade,
 * gerando marcadores falsos e vaos delimitados errado. Casar pelo TEXTO do enunciado
 * (dezenas de caracteres, nunca coincide por acaso) elimina essa classe inteira de
 * ambiguidade sem precisar reimplementar as varias guardas que prova-parser.ts ja tem
 * pra essa mesma ambiguidade no lado do parser de texto.
 *
 * Paginas em duas colunas (comum na segunda metade desta prova) tambem exigem cuidado:
 * a divisao de colunas usa as posicoes X mais FREQUENTES entre as linhas (a margem de
 * verdade de cada coluna, usada por dezenas de linhas de corpo de texto) - indentacoes
 * raras (uma linha de continuacao mais larga, item de lista aninhado) apareceriam so
 * uma vez e confundiriam um vao real de coluna com um vao espurio entre indentacoes
 * soltas se entrassem no calculo.
 *
 * Usa mupdf (WASM, sem binario nativo, sem canvas/DOM) tanto pra extrair a posicao do
 * texto quanto pra renderizar a pagina - de proposito NAO mistura com o pdfjs usado em
 * question-extraction-service.ts, que tem a convencao de eixo Y oposta (origem embaixo,
 * pdfjs userspace) da usada aqui (origem em cima, mupdf structured text) - misturar as
 * duas geraria recortes na altura errada.
 */
import * as mupdf from "mupdf";
import { buildPngFromFlateImage } from "./pdf-image-extractor";

type TextLine = { x: number; y: number; width: number; height: number; text: string };
// xLeft/xRight: limite generoso pro RECORTE final (vai ate a ponta oposta do vao entre
// colunas, ja que um diagrama pode se estender mais que qualquer linha de texto da
// coluna). coreXLeft/coreXRight: limite justo (so ate o meio do vao) usado pra
// VALIDAR se um vao e mesmo uma figura - usar os limites generosos pra validacao
// deixaria passar conteudo de texto de verdade da coluna vizinha quando o vao, na
// coluna certa, e so espaco vazio (visto na pratica: um "vao" que colava passagem em
// ingles da coluna adjacente por causa da largura generosa do recorte).
type Column = { lines: TextLine[]; xLeft: number; xRight: number; coreXLeft: number; coreXRight: number };
type Gap = { yTop: number; yBottom: number };
type PageInfo = { pageIdx: number; pageHeight: number; columns: Column[] };
type Anchor = { numero: number; pageIdx: number; columnIdx: number; y: number };

// Espacamento normal entre linhas de texto corrido nessas provas fica bem abaixo
// disso (~10-16pt) - um vao maior que 50pt e um sinal forte de conteudo nao-textual
// (figura, tabela, diagrama) ocupando aquele espaco.
const MIN_GAP_HEIGHT = 50;

// Duas colunas so faz sentido dividir quando o "vazio" horizontal entre elas e bem
// maior que qualquer indentacao normal de texto (alternativas, itens I/II/III...).
const MIN_COLUMN_GUTTER = 80;

// Quantos caracteres normalizados do inicio do enunciado usar como "impressao digital"
// pra localizar onde a questao comeca no texto extraido pelo mupdf. Curto o bastante
// pra sobreviver a pequenas diferencas de segmentacao entre pdf-parse e mupdf; longo o
// bastante pra nunca coincidir por acaso com outro trecho do documento.
const ANCHOR_LENGTH = 24;

export function normalizeForMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getPageLines(page: mupdf.Page, pageWidth: number, pageHeight: number): TextLine[] {
  const stext = page.toStructuredText("preserve-whitespace");
  const json = JSON.parse(stext.asJSON()) as {
    blocks: Array<{ type: string; lines?: Array<{ bbox: { x: number; y: number; w: number; h: number }; text: string }> }>;
  };
  const lines: TextLine[] = [];
  for (const block of json.blocks) {
    if (block.type !== "text" || !block.lines) continue;
    for (const line of block.lines) {
      const trimmed = line.text.trim();
      if (trimmed && !isPageFurniture(trimmed, line.bbox.x, line.bbox.y, pageWidth, pageHeight)) {
        lines.push({ x: line.bbox.x, y: line.bbox.y, width: line.bbox.w, height: line.bbox.h, text: trimmed });
      }
    }
  }
  return lines;
}

// Marca d'agua, cabecalho/rodape institucional e numero de pagina nao sao conteudo de
// questao - se entrarem na lista de linhas, o "proximo item"/"proxima linha" usado pra
// delimitar um vao vira o rodape (bem mais abaixo, com um vao enorme e espurio antes
// dele) em vez do fim de verdade do conteudo da questao, criando um falso positivo de
// figura sobre espaco em branco no fim da coluna.
// Credito/citacao de fonte de um texto de apoio (comum logo apos a ultima alternativa
// de uma questao ligada a um texto de apoio, com bastante espaco em branco antes -
// exatamente o padrao que dispara MIN_GAP_HEIGHT sem ser figura nenhuma). Ao contrario
// do cabecalho/rodape institucional, pode aparecer em qualquer Y da pagina (nao so
// perto da margem), entao e verificado separado, sem a restricao de posicao.
const CITATION_LINE = /^(available in|retrieved on|adapted from|dispon[íi]vel em|acesso em)\b/i;
// Marca d'agua textual de espaco reservado pro candidato rascunhar - mesma ideia do
// "espaço livre" ja tratado em prova-parser.ts, so que essa aparece como texto de
// verdade no meio da pagina (nao so perto da margem), com bastante espaco em branco
// antes dela (exatamente o padrao que MIN_GAP_HEIGHT capta sem ser figura nenhuma).
const SCRATCH_SPACE_LINE = /^rascunho$/i;

function isPageFurniture(trimmed: string, x: number, y: number, pageWidth: number, pageHeight: number): boolean {
  if (
    /^pcimarkpci\b/i.test(trimmed) ||
    /^www\.\S+$/i.test(trimmed) ||
    CITATION_LINE.test(trimmed) ||
    SCRATCH_SPACE_LINE.test(trimmed) ||
    /https?:\/\//i.test(trimmed)
  )
    return true;
  const nearTopOrBottomMargin = y < pageHeight * 0.12 || y > pageHeight * 0.9;
  if (!nearTopOrBottomMargin) return false;
  // So perto da margem: cabecalho/rodape institucional (linha inteira em maiuscula -
  // "PORQUE" e outras palavras maiusculas legitimas de enunciado ficam no MEIO da
  // pagina, nunca coladas na margem) ou numero de pagina "cru" (so o digito).
  if (trimmed === trimmed.toUpperCase() && /[A-ZÀ-Ú]/.test(trimmed)) return true;
  // Um numero sozinho perto da margem pode ser numero de pagina OU um item de verdade
  // que abre bem no topo de uma pagina nova (comum logo apos quebra de pagina/secao).
  // Distingue pela posicao X: numero de pagina fica centralizado; um item de verdade
  // comeca alinhado a margem esquerda do corpo de texto, longe do centro da pagina.
  if (/^\d{1,3}$/.test(trimmed)) {
    const distanceFromCenter = Math.abs(x - pageWidth / 2);
    return distanceFromCenter < pageWidth * 0.15;
  }
  return false;
}

/**
 * Divide as linhas da pagina em 1 ou 2 colunas com base no maior vao horizontal entre
 * as posicoes X (mais frequentes) onde linhas comecam. So separa quando esse vao e bem
 * maior que uma indentacao normal (MIN_COLUMN_GUTTER) - do contrario, devolve a pagina
 * inteira como uma unica coluna (comportamento correto pra paginas de 1 coluna).
 */
function splitIntoColumns(lines: TextLine[], pageWidth: number): Column[] {
  const countByX = new Map<number, number>();
  for (const line of lines) {
    const x = Math.round(line.x);
    countByX.set(x, (countByX.get(x) ?? 0) + 1);
  }
  const MIN_LINES_FOR_MARGIN = 2;
  const xs = [...countByX.entries()]
    .filter(([, count]) => count >= MIN_LINES_FOR_MARGIN)
    .map(([x]) => x)
    .sort((a, b) => a - b);

  let bestGutter = { size: 0, start: 0, end: 0 };
  for (let i = 1; i < xs.length; i += 1) {
    const size = xs[i] - xs[i - 1];
    if (size > bestGutter.size) bestGutter = { size, start: xs[i - 1], end: xs[i] };
  }
  const splitX = (bestGutter.start + bestGutter.end) / 2;
  const isTwoColumn = bestGutter.size >= MIN_COLUMN_GUTTER && splitX > pageWidth * 0.2 && splitX < pageWidth * 0.8;
  if (!isTwoColumn) {
    return [{ lines: lines.sort((a, b) => a.y - b.y), xLeft: 0, xRight: pageWidth, coreXLeft: 0, coreXRight: pageWidth }];
  }
  const left = lines.filter((l) => l.x < splitX).sort((a, b) => a.y - b.y);
  const right = lines.filter((l) => l.x >= splitX).sort((a, b) => a.y - b.y);
  const columns: Column[] = [];
  // Um diagrama pode se estender mais pra direita que qualquer linha de texto daquela
  // coluna (o layout de texto nao segue o tamanho de uma figura) - por isso o limite de
  // RECORTE de cada coluna vai ate a ponta OPOSTA do vao detectado (onde a outra coluna
  // realmente comeca), em vez do meio do vao. Isso sozinho capturaria tambem o que
  // estiver desenhado no meio do vao sem relacao com o diagrama (ex.: uma regra/linha
  // divisoria vertical entre colunas) - por isso cropPageRegion() apara esse excesso
  // depois de renderizar, olhando onde a tinta do proprio diagrama realmente termina
  // (ver trimToInkExtent). O limite CORE (usado so pra validar se um vao e mesmo uma
  // figura) fica no meio do vao, mais conservador.
  if (left.length > 0) columns.push({ lines: left, xLeft: 0, xRight: bestGutter.end, coreXLeft: 0, coreXRight: splitX });
  if (right.length > 0) columns.push({ lines: right, xLeft: bestGutter.start, xRight: pageWidth, coreXLeft: splitX, coreXRight: pageWidth });
  return columns;
}

function findGaps(lines: TextLine[]): Gap[] {
  const gaps: Gap[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const prevBottom = lines[i - 1].y + lines[i - 1].height;
    const gapHeight = lines[i].y - prevBottom;
    if (gapHeight >= MIN_GAP_HEIGHT) gaps.push({ yTop: prevBottom, yBottom: lines[i].y });
  }
  return gaps;
}

/** Concatena o texto normalizado de uma coluna pra permitir buscar um trecho por substring. */
function buildColumnIndex(lines: TextLine[]): { concat: string; offsets: number[] } {
  let concat = "";
  const offsets: number[] = [];
  for (const line of lines) {
    offsets.push(concat.length);
    concat += normalizeForMatch(line.text);
  }
  return { concat, offsets };
}

function findAnchorInColumn(index: { concat: string; offsets: number[] }, lines: TextLine[], needle: string): number | null {
  const matchIdx = index.concat.indexOf(needle);
  if (matchIdx === -1) return null;
  let lineIdx = index.offsets.findIndex((offset, i) => matchIdx >= offset && (i === index.offsets.length - 1 || matchIdx < index.offsets[i + 1]));
  if (lineIdx === -1) lineIdx = lines.length - 1;
  return lines[lineIdx].y;
}

/**
 * Localiza, pra cada questao (na ordem em que aparecem no documento - a mesma ordem ja
 * corrigida por parseProvaText, inclusive pra itens fora de ordem numerica), a pagina/
 * coluna/Y onde o comeco do enunciado aparece no texto extraido pelo mupdf. Caminha
 * pelas paginas em ordem (a busca de cada questao comeca de onde a anterior parou),
 * entao o custo e proporcional a paginas + questoes, nao paginas × questoes.
 */
function locateAnchors(doc: mupdf.Document, questoesInOrder: Array<{ numero: number; enunciado: string }>): Anchor[] {
  const anchors: Anchor[] = [];
  const pageCache = new Map<number, PageInfo>();
  function getPageInfo(pageIdx: number): PageInfo {
    const cached = pageCache.get(pageIdx);
    if (cached) return cached;
    const page = doc.loadPage(pageIdx);
    const [, , pageWidth, pageHeight] = page.getBounds();
    const info: PageInfo = { pageIdx, pageHeight, columns: splitIntoColumns(getPageLines(page, pageWidth, pageHeight), pageWidth) };
    pageCache.set(pageIdx, info);
    return info;
  }

  let searchFromPage = 0;
  let prevInSameSpot: Anchor | null = null;
  for (const questao of questoesInOrder) {
    const needle = normalizeForMatch(questao.enunciado).slice(0, ANCHOR_LENGTH);
    if (needle.length < ANCHOR_LENGTH) continue; // enunciado curto demais pra impressao digital confiavel
    let found = false;
    for (let p = searchFromPage; p < doc.countPages() && !found; p += 1) {
      const info = getPageInfo(p);
      for (let c = 0; c < info.columns.length; c += 1) {
        const column = info.columns[c];
        const index = buildColumnIndex(column.lines);
        const textAnchorY = findAnchorInColumn(index, column.lines, needle);
        if (textAnchorY !== null) {
          // Algumas questoes trazem a figura ANTES de qualquer texto proprio (logo
          // apos o numero do item, ex.: diagramas UML desta prova) - o casamento por
          // texto do enunciado nao alcança essa regiao, ja que ela comeca antes dele.
          // Procura o marcador "numero sozinho" de verdade, mas SO dentro da janela
          // estreita entre o anchor da questao anterior nesta mesma coluna/pagina e
          // este anchor de texto - nunca um scan livre do documento, que e exatamente
          // o que colidia com numeros de citacao de linha em textos de apoio.
          const sameSpotAsPrev = prevInSameSpot?.pageIdx === p && prevInSameSpot?.columnIdx === c;
          const minY = sameSpotAsPrev ? prevInSameSpot!.y : 0;
          const markerY = findBareNumberMarker(column.lines, questao.numero, minY, textAnchorY);
          const anchor: Anchor = { numero: questao.numero, pageIdx: p, columnIdx: c, y: markerY ?? textAnchorY };
          anchors.push(anchor);
          prevInSameSpot = anchor;
          searchFromPage = p;
          found = true;
          break;
        }
      }
    }
  }
  return anchors;
}

function findBareNumberMarker(lines: TextLine[], numero: number, minY: number, maxY: number): number | null {
  const target = String(numero);
  for (const line of lines) {
    if (line.y <= minY || line.y > maxY) continue;
    if (line.text.replace(/[.)]$/, "") === target) return line.y;
  }
  return null;
}

type RawRegion = { raw: Buffer; width: number; height: number };

function extractRegionPixels(
  page: mupdf.Page,
  xLeft: number,
  xRight: number,
  yTop: number,
  yBottom: number,
  scale: number,
): RawRegion | null {
  const matrix = mupdf.Matrix.scale(scale, scale);
  const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
  const stride = pixmap.getStride();
  const pixels = pixmap.getPixels();
  const components = pixmap.getNumberOfComponents();
  if (stride !== pixmap.getWidth() * components || components !== 3) return null;

  const pxLeft = Math.max(0, Math.round(xLeft * scale));
  const pxRight = Math.min(pixmap.getWidth(), Math.round(xRight * scale));
  const pxTop = Math.max(0, Math.round(yTop * scale));
  const pxBottom = Math.min(pixmap.getHeight(), Math.round(yBottom * scale));
  const width = pxRight - pxLeft;
  const height = pxBottom - pxTop;
  if (width <= 0 || height <= 0) return null;

  const rowBytes = width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let row = 0; row < height; row += 1) {
    const srcOffset = pixels.byteOffset + (pxTop + row) * stride + pxLeft * 3;
    const srcRow = Buffer.from(pixels.buffer, srcOffset, rowBytes);
    srcRow.copy(raw, row * rowBytes);
  }
  return { raw, width, height };
}

const INK_THRESHOLD = 200;

function columnHasInk(raw: Buffer, width: number, height: number, col: number): boolean {
  for (let row = 0; row < height; row += 1) {
    const offset = (row * width + col) * 3;
    if (raw[offset] < INK_THRESHOLD || raw[offset + 1] < INK_THRESHOLD || raw[offset + 2] < INK_THRESHOLD) return true;
  }
  return false;
}

// Largura, em pixels na escala do recorte, de uma folga em branco continua grande o
// bastante pra concluir que o diagrama de verdade acabou ali - maior que qualquer
// respiro interno comum entre caixas/setas do proprio diagrama, menor que o vao ate o
// conteudo real da coluna vizinha (ou ate uma regra/linha divisoria isolada no meio do
// vao entre colunas, que fica cercada de espaco em branco dos dois lados).
function blankRunThreshold(scale: number): number {
  return Math.round(15 * scale);
}

// Caminha, a partir de fromCol, na direcao indicada, procurando ate onde a tinta do
// diagrama realmente se estende antes de uma folga em branco grande o bastante pra
// indicar que ele terminou. Devolve a ULTIMA coluna com tinta encontrada. Sem teto
// artificial de distancia: um teto fixo cortaria no meio de um diagrama real que
// precisa de mais folga (verificado na pratica - cortava a classe C2 de esbocos UML
// nesta mesma prova), o que e pior do que ocasionalmente nao aparar todo um vazamento
// de coluna vizinha sem folga em branco nenhuma (texto corrido raramente tem uma).
function trimOverhang(raw: Buffer, width: number, height: number, fromCol: number, direction: 1 | -1, scale: number): number {
  const threshold = blankRunThreshold(scale);
  let lastInkCol = fromCol - direction;
  let blankRun = 0;
  for (let col = fromCol; col >= 0 && col < width; col += direction) {
    if (columnHasInk(raw, width, height, col)) {
      lastInkCol = col;
      blankRun = 0;
    } else {
      blankRun += 1;
      if (blankRun >= threshold) break;
    }
  }
  return lastInkCol;
}

/**
 * Recorta a regiao [xLeft,xRight) x [yTop,yBottom) da pagina renderizada, como PNG -
 * mas so depois de validar que a regiao CORE (limite mais justo, sem a folga generosa
 * usada pro recorte final) tem cara de figura de verdade. Validar com os limites
 * generosos deixaria passar conteudo de texto de verdade da coluna vizinha quando o
 * vao, na coluna certa, e so espaco vazio.
 *
 * O recorte WIDE (generoso, ate a ponta oposta do vao entre colunas) evita cortar
 * rente um diagrama que se estende mais que o texto da propria coluna - mas tambem
 * capturaria, sem nenhum ajuste, qualquer coisa desenhada no meio desse vao sem
 * relacao com o diagrama (ex.: uma regra/linha divisoria vertical entre colunas). Por
 * isso, so a faixa CORE (ja validada acima) e mantida incondicionalmente; a faixa de
 * folga alem dela (o "overhang") e aparada dinamicamente ate onde a tinta do proprio
 * diagrama realmente vai (trimOverhang), em vez de usar a largura WIDE inteira.
 */
function cropPageRegion(
  page: mupdf.Page,
  column: Column,
  yTop: number,
  yBottom: number,
  scale: number,
): Buffer | null {
  const core = extractRegionPixels(page, column.coreXLeft, column.coreXRight, yTop, yBottom, scale);
  if (!core || !looksLikeFigure(core.raw, core.width, core.height)) return null;

  const wide = extractRegionPixels(page, column.xLeft, column.xRight, yTop, yBottom, scale);
  if (!wide) return null;

  const coreLeftPx = Math.max(0, Math.round((column.coreXLeft - column.xLeft) * scale));
  const coreRightPx = Math.min(wide.width, Math.round((column.coreXRight - column.xLeft) * scale));

  const keepLeft =
    coreLeftPx > 0 ? Math.max(0, trimOverhang(wide.raw, wide.width, wide.height, coreLeftPx - 1, -1, scale)) : 0;
  const keepRight =
    coreRightPx < wide.width
      ? Math.min(wide.width, trimOverhang(wide.raw, wide.width, wide.height, coreRightPx, 1, scale) + 1)
      : wide.width;

  if (keepLeft <= 0 && keepRight >= wide.width) {
    return buildPngFromFlateImage(wide.raw, wide.width, wide.height, 3, 8, false);
  }
  const trimmedWidth = keepRight - keepLeft;
  if (trimmedWidth <= 0) return buildPngFromFlateImage(wide.raw, wide.width, wide.height, 3, 8, false);
  const trimmedRaw = Buffer.alloc(trimmedWidth * 3 * wide.height);
  for (let row = 0; row < wide.height; row += 1) {
    const srcOffset = (row * wide.width + keepLeft) * 3;
    const destOffset = row * trimmedWidth * 3;
    wide.raw.copy(trimmedRaw, destOffset, srcOffset, srcOffset + trimmedWidth * 3);
  }
  return buildPngFromFlateImage(trimmedRaw, trimmedWidth, wide.height, 3, 8, false);
}

// Vao grande nem sempre e figura - as vezes e so espaco em branco sobrando no fim de
// uma coluna/pagina. Um diagrama de verdade tem tinta (texto/linhas/preenchimento)
// espalhada pela altura inteira; um falso positivo so tem tinta concentrada numa tarja
// fina perto de uma borda. Divide o recorte em faixas horizontais e exige tinta em
// varias delas, nao concentrada so numa ponta.
const BANDS = 6;
const MIN_BANDS_WITH_INK = 4;
const MIN_BAND_INK_RATIO = 0.01;

function looksLikeFigure(rgb: Buffer, width: number, height: number): boolean {
  const bandHeight = Math.max(1, Math.floor(height / BANDS));
  let bandsWithInk = 0;
  for (let band = 0; band < BANDS; band += 1) {
    const rowStart = band * bandHeight;
    const rowEnd = band === BANDS - 1 ? height : rowStart + bandHeight;
    let inkPixels = 0;
    const totalPixels = (rowEnd - rowStart) * width;
    for (let row = rowStart; row < rowEnd; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const offset = (row * width + col) * 3;
        // "Tinta" = pixel visivelmente mais escuro que fundo branco/quase-branco
        // (letras, linhas, preenchimentos). Watermarks ficam bem claros de proposito
        // e nao devem contar como conteudo real.
        if (rgb[offset] < 200 || rgb[offset + 1] < 200 || rgb[offset + 2] < 200) inkPixels += 1;
      }
    }
    if (totalPixels > 0 && inkPixels / totalPixels >= MIN_BAND_INK_RATIO) bandsWithInk += 1;
  }
  return bandsWithInk >= MIN_BANDS_WITH_INK;
}

export type FigureCrop = { numero: number; bytes: Buffer; width: number; height: number };

/**
 * Pra cada questao em `numerosAlvo`, localiza onde ela comeca no PDF por casamento do
 * texto do enunciado (ver locateAnchors), procura o primeiro vao vertical dentro do
 * intervalo Y ate a PROXIMA questao na mesma coluna, e recorta essa regiao como PNG.
 * `questoesInOrder` deve ser a lista COMPLETA de questoes na ordem em que aparecem no
 * documento (a mesma ordem que parseProvaText produz) - usada so pra saber onde cada
 * questao comeca/termina, mesmo as que nao estao em `numerosAlvo`. Quando nao acha a
 * questao no PDF, nem um vao qualificado no intervalo dela, simplesmente pula - nunca
 * recorta uma regiao "no chute" (prefere nenhuma imagem a uma imagem errada).
 */
export function extractFigureCrops(
  pdfBuffer: Buffer,
  questoesInOrder: Array<{ numero: number; enunciado: string }>,
  numerosAlvo: number[],
  scale = 2,
): FigureCrop[] {
  if (numerosAlvo.length === 0) return [];
  const wanted = new Set(numerosAlvo);
  const doc = mupdf.Document.openDocument(pdfBuffer, "application/pdf");
  const anchors = locateAnchors(doc, questoesInOrder);
  const crops: FigureCrop[] = [];

  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    if (!wanted.has(anchor.numero)) continue;
    // Delimita o vao ate a proxima questao (em qualquer coluna/pagina) - se ela cair
    // fora da mesma pagina+coluna deste anchor, usa o fim real do conteudo da coluna
    // (ultima linha) em vez de um limite artificial, pra nunca vazar pra pagina/coluna
    // seguinte nem pra alem do conteudo de verdade.
    const page = doc.loadPage(anchor.pageIdx);
    const [, , pageWidth, pageHeight] = page.getBounds();
    const columns = splitIntoColumns(getPageLines(page, pageWidth, pageHeight), pageWidth);
    const column = columns[anchor.columnIdx];
    if (!column) continue;

    // anchor.y ja e o marcador "numero sozinho" quando ele existe no texto extraido
    // (ver locateAnchors/findBareNumberMarker) - inclusive quando a questao abre bem
    // no topo de uma pagina nova, antes de qualquer figura ou frase. So cai pro comeco
    // do proprio enunciado quando esse marcador realmente nao existe como linha propria.
    const next = anchors[i + 1];
    const nextSameSpot = next && next.pageIdx === anchor.pageIdx && next.columnIdx === anchor.columnIdx;
    const lastLineY = column.lines.length > 0 ? column.lines[column.lines.length - 1].y : anchor.y;
    const nextY = nextSameSpot ? next.y : lastLineY;

    const gaps = findGaps(column.lines);
    const gap = gaps.find((g) => g.yTop >= anchor.y && g.yBottom <= nextY);
    if (!gap) continue;

    // Margem minima (nao 5pt como antes): so o suficiente pra nao cortar rente a borda
    // de um diagrama cujo desenho vetorial passa uns poucos pontos alem do vao medido
    // por texto, mas pequena o bastante pra nao alcancar o corpo da linha de texto
    // vizinha (numero do item, fim do enunciado anterior) - 5pt bastava pra revelar a
    // base de um digito ou o topo de uma letra da linha logo antes/depois do vao.
    const png = cropPageRegion(page, column, gap.yTop - 1, gap.yBottom + 1, scale);
    if (!png) continue;
    // A largura/altura reais do PNG vem embutidas no proprio buffer (IHDR) - descobre
    // lendo de volta em vez de recalcular, pra nao duplicar logica.
    crops.push({ numero: anchor.numero, bytes: png, width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
  }
  return crops;
}
