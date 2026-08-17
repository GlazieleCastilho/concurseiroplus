/**
 * Extrai imagens embutidas (JPEG/DCTDecode e RGB/Gray sem compressao com perdas,
 * /FlateDecode) de PDFs oficiais e associa cada uma a uma questao/alternativa pela
 * posicao na pagina. Deterministico, sem IA.
 *
 * So implementa um subconjunto minimo do formato PDF (le objetos indiretos direto dos
 * bytes, resolve a arvore de paginas, descomprime content streams com zlib nativo e
 * segue "q/Q/cm/Do" para achar a posicao de cada imagem). De proposito NAO usa pdfjs
 * para essa parte: pdfjs.getOperatorList() carrega fontes via WorkerTransport, que tenta
 * inserir <style> no DOM e usar canvas mesmo sem nenhum render acontecer, e quebra com
 * "document is not defined" em Node puro — o mesmo tipo de problema de canvas/DOMMatrix
 * que ja causou incidente de producao neste projeto. getTextContent() (usado em
 * question-extraction-service.ts para achar a posicao dos itens) nao tem esse problema.
 */
import { deflateSync, inflateSync } from "node:zlib";

type PdfObject = { dictText: string; streamBytes: Buffer | null };

function findDictEnd(str: string, openIdx: number): number {
  let depth = 0;
  let i = openIdx;
  while (i < str.length) {
    if (str[i] === "<" && str[i + 1] === "<") {
      depth += 1;
      i += 2;
    } else if (str[i] === ">" && str[i + 1] === ">") {
      depth -= 1;
      i += 2;
      if (depth === 0) return i;
    } else {
      i += 1;
    }
  }
  return -1;
}

function parseObjects(buf: Buffer, text: string): Map<number, PdfObject> {
  const objects = new Map<number, PdfObject>();
  const objRe = /(\d+)\s+0\s+obj\b/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(text))) {
    const objNum = Number(m[1]);
    let pos = m.index + m[0].length;
    while (/\s/.test(text[pos])) pos += 1;

    let dictText = "";
    let afterDict = pos;
    if (text[pos] === "<" && text[pos + 1] === "<") {
      const end = findDictEnd(text, pos);
      if (end === -1) continue;
      dictText = text.slice(pos, end);
      afterDict = end;
    }
    while (/\s/.test(text[afterDict])) afterDict += 1;

    if (text.startsWith("stream", afterDict)) {
      let sPos = afterDict + "stream".length;
      if (text[sPos] === "\r") sPos += 1;
      if (text[sPos] === "\n") sPos += 1;
      const lengthMatch = dictText.match(/\/Length\s+(\d+)(?!\s+0\s+R)/);
      let streamBytes: Buffer;
      if (lengthMatch) {
        streamBytes = buf.subarray(sPos, sPos + Number(lengthMatch[1]));
      } else {
        const endstreamIdx = text.indexOf("endstream", sPos);
        streamBytes = buf.subarray(sPos, endstreamIdx === -1 ? sPos : endstreamIdx);
      }
      objects.set(objNum, { dictText, streamBytes });
    } else {
      objects.set(objNum, { dictText, streamBytes: null });
    }
  }
  return objects;
}

function resolveRef(str: string | undefined): number | null {
  const m = /^\s*(\d+)\s+0\s+R\s*$/.exec(str ?? "");
  return m ? Number(m[1]) : null;
}

function resolveDict(objects: Map<number, PdfObject>, dictOrRef: string | undefined): string {
  if (!dictOrRef) return "";
  const ref = resolveRef(dictOrRef);
  if (ref !== null) return objects.get(ref)?.dictText ?? "";
  return dictOrRef;
}

function decompress(obj: PdfObject | undefined): Buffer {
  if (!obj?.streamBytes) return Buffer.alloc(0);
  if (/\/Filter\s*\/FlateDecode/.test(obj.dictText) || /\/Filter\s*\[\s*\/FlateDecode/.test(obj.dictText)) {
    try {
      return inflateSync(obj.streamBytes);
    } catch {
      return Buffer.alloc(0);
    }
  }
  return obj.streamBytes;
}

type Matrix = [number, number, number, number, number, number];

function mulCTM(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

export type RawImagePlacement = {
  xobjNum: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  bytes: Buffer;
  format: "jpeg" | "png";
};

// Tabela de CRC32 padrao (usada nos chunks do PNG que montamos manualmente). Implementada
// na mao em vez de zlib.crc32 (so disponivel a partir do Node 20.12/21.4) pra nao depender
// de uma versao minima especifica do runtime da Vercel.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Reconstroi um PNG valido a partir dos bytes ja descomprimidos (inflateSync) de uma
 * imagem /FlateDecode do PDF. O PDF usa exatamente o mesmo esquema de filtro por linha
 * do formato PNG quando /Predictor no DecodeParms e >= 10 ("PNG prediction" - o proprio
 * spec do PDF empresta o termo do PNG): cada linha decodificada ja vem prefixada com o
 * byte de tipo de filtro (0-4), que e literalmente o que o IDAT do PNG espera. Nesse
 * caso so precisa reempacotar - recomprimir com zlib e envolver no container PNG
 * (assinatura + IHDR + IDAT + IEND). Sem Predictor (comum em imagens pequenas, ex.: sem
 * DecodeParms nenhum), os bytes sao pixels crus sem esse prefixo - insere um filtro
 * "None" (0) em cada linha manualmente, que e o formato mais simples aceito pelo PNG.
 */
export function buildPngFromFlateImage(
  raw: Buffer,
  width: number,
  height: number,
  colors: 1 | 3,
  bitsPerComponent: number,
  hasPngPredictor: boolean,
): Buffer | null {
  if (width <= 0 || height <= 0 || bitsPerComponent !== 8) return null;
  const rowBytes = width * colors;
  let idatRaw: Buffer;
  if (hasPngPredictor) {
    if (raw.length !== (rowBytes + 1) * height) return null;
    idatRaw = raw;
  } else {
    if (raw.length !== rowBytes * height) return null;
    idatRaw = Buffer.alloc((rowBytes + 1) * height);
    for (let row = 0; row < height; row += 1) {
      idatRaw[row * (rowBytes + 1)] = 0;
      raw.copy(idatRaw, row * (rowBytes + 1) + 1, row * rowBytes, (row + 1) * rowBytes);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = bitsPerComponent;
  ihdr[9] = colors === 3 ? 2 : 0; // PNG color type: 2 = RGB, 0 = grayscale
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(idatRaw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function xobjNameMap(objects: Map<number, PdfObject>, resourcesDictOrRef: string | undefined): Map<string, number> {
  const resolved = resolveDict(objects, resourcesDictOrRef);
  const xobjMatch = resolved.match(/\/XObject\s+(\d+\s+0\s+R|<<[\s\S]*?>>)/);
  const map = new Map<string, number>();
  if (!xobjMatch) return map;
  const dictText = resolveDict(objects, xobjMatch[1]);
  for (const nm of dictText.matchAll(/\/(\S+)\s+(\d+)\s+0\s+R/g)) map.set(nm[1], Number(nm[2]));
  return map;
}

function processContentStream(
  objects: Map<number, PdfObject>,
  placements: RawImagePlacement[],
  contentText: string,
  resourcesDictOrRef: string | undefined,
  initialCTM: Matrix,
  pageNum: number,
  depth: number
) {
  if (depth > 4) return;
  const nameMap = xobjNameMap(objects, resourcesDictOrRef);
  if (nameMap.size === 0) return;
  const tokenRe = /\/[A-Za-z0-9.#+_-]+|-?\d*\.?\d+|\(([^)\\]|\\.)*\)|<[0-9A-Fa-f\s]*>|[A-Za-z'"*]+|[[\]]/g;
  let ctm: Matrix = initialCTM;
  const stack: Matrix[] = [];
  let operands: string[] = [];
  let tok: RegExpExecArray | null;
  while ((tok = tokenRe.exec(contentText))) {
    const t = tok[0];
    if (t === "q") {
      stack.push(ctm);
      operands = [];
    } else if (t === "Q") {
      ctm = stack.pop() ?? ctm;
      operands = [];
    } else if (t === "cm") {
      const nums = operands.slice(-6).map(Number);
      if (nums.length === 6 && nums.every((n) => !Number.isNaN(n))) ctm = mulCTM(ctm, nums as Matrix);
      operands = [];
    } else if (t === "Do") {
      const name = operands[operands.length - 1]?.replace(/^\//, "");
      const xobjNum = name ? nameMap.get(name) : undefined;
      if (xobjNum !== undefined) {
        const xobj = objects.get(xobjNum);
        if (xobj && /\/Subtype\s*\/Form/.test(xobj.dictText)) {
          const formMatrixMatch = xobj.dictText.match(/\/Matrix\s*\[([^\]]*)\]/);
          let formCTM = ctm;
          if (formMatrixMatch) {
            const nums = formMatrixMatch[1].trim().split(/\s+/).map(Number);
            if (nums.length === 6) formCTM = mulCTM(ctm, nums as Matrix);
          }
          const formResources = xobj.dictText.match(/\/Resources\s+(\d+\s+0\s+R|<<[\s\S]*?>>)/)?.[1];
          const formContent = decompress(xobj).toString("latin1");
          processContentStream(objects, placements, formContent, formResources, formCTM, pageNum, depth + 1);
        } else if (xobj && /\/Subtype\s*\/Image/.test(xobj.dictText) && xobj.streamBytes) {
          const width = Number(xobj.dictText.match(/\/Width\s+(\d+)/)?.[1] ?? 0);
          const height = Number(xobj.dictText.match(/\/Height\s+(\d+)/)?.[1] ?? 0);
          if (/\/DCTDecode/.test(xobj.dictText)) {
            placements.push({ xobjNum, page: pageNum, x: ctm[4], y: ctm[5], width, height, bytes: Buffer.from(xobj.streamBytes), format: "jpeg" });
          } else if (/\/FlateDecode/.test(xobj.dictText)) {
            // Imagens sem compressao com perdas (fotos/diagramas exportados como PNG,
            // muito comum em figuras de questao) - o PDF guarda os pixels comprimidos
            // com zlib puro, sem cabecalho JPEG. Reconstroi um PNG valido a partir
            // desses bytes em vez de descartar a imagem (ver buildPngFromFlateImage).
            const colorSpace = xobj.dictText.match(/\/ColorSpace\s*\/(\w+)/)?.[1];
            const colors = colorSpace === "DeviceRGB" ? 3 : colorSpace === "DeviceGray" ? 1 : null;
            const bitsPerComponent = Number(xobj.dictText.match(/\/BitsPerComponent\s+(\d+)/)?.[1] ?? 8);
            const predictor = Number(xobj.dictText.match(/\/Predictor\s+(\d+)/)?.[1] ?? 1);
            if (colors !== null) {
              const png = buildPngFromFlateImage(decompress(xobj), width, height, colors, bitsPerComponent, predictor >= 10);
              if (png) placements.push({ xobjNum, page: pageNum, x: ctm[4], y: ctm[5], width, height, bytes: png, format: "png" });
            }
          }
        }
      }
      operands = [];
    } else if (/^-?\d*\.?\d+$/.test(t) || t.startsWith("/")) {
      operands.push(t);
    } else if (/^[A-Za-z'"*]+$/.test(t)) {
      operands = [];
    }
  }
}

/** Extrai as imagens JPEG embutidas no PDF com pagina e posicao (x,y) na pagina. */
export function extractImagePlacements(pdfBuffer: Buffer): RawImagePlacement[] {
  const text = pdfBuffer.toString("latin1");
  const objects = parseObjects(pdfBuffer, text);

  let catalogObjNum: number | null = null;
  for (const [num, obj] of objects) {
    if (/\/Type\s*\/Catalog/.test(obj.dictText)) {
      catalogObjNum = num;
      break;
    }
  }
  if (catalogObjNum === null) return [];
  const pagesRefMatch = objects.get(catalogObjNum)?.dictText.match(/\/Pages\s+(\d+\s+0\s+R)/);
  const rootPagesNum = pagesRefMatch ? resolveRef(pagesRefMatch[1]) : null;
  if (rootPagesNum === null) return [];

  const pageObjs: Array<{ dict: string; resources: string | undefined }> = [];
  function walkPages(objNum: number, inheritedResources: string | undefined) {
    const obj = objects.get(objNum);
    if (!obj) return;
    const resourcesMatch = obj.dictText.match(/\/Resources\s+(\d+\s+0\s+R|<<[\s\S]*?>>(?=\s*\/\w|\s*>>))/);
    const resources = resourcesMatch ? resourcesMatch[1] : inheritedResources;
    if (/\/Type\s*\/Pages\b/.test(obj.dictText)) {
      const kidsMatch = obj.dictText.match(/\/Kids\s*\[([^\]]*)\]/);
      if (kidsMatch) {
        for (const kid of [...kidsMatch[1].matchAll(/(\d+)\s+0\s+R/g)].map((x) => Number(x[1]))) walkPages(kid, resources);
      }
    } else if (/\/Type\s*\/Page\b/.test(obj.dictText)) {
      pageObjs.push({ dict: obj.dictText, resources });
    }
  }
  walkPages(rootPagesNum, undefined);

  const placements: RawImagePlacement[] = [];
  for (let pageIdx = 0; pageIdx < pageObjs.length; pageIdx += 1) {
    const { dict, resources } = pageObjs[pageIdx];
    const pageNum = pageIdx + 1;
    const contentsMatch = dict.match(/\/Contents\s+(\d+\s+0\s+R|\[[^\]]*\])/);
    if (!contentsMatch) continue;
    let contentObjNums: number[] = [];
    const arrMatch = contentsMatch[1].match(/^\[([^\]]*)\]$/);
    if (arrMatch) {
      contentObjNums = [...arrMatch[1].matchAll(/(\d+)\s+0\s+R/g)].map((x) => Number(x[1]));
    } else {
      const ref = resolveRef(contentsMatch[1]);
      if (ref !== null) contentObjNums = [ref];
    }
    const contentText = contentObjNums.map((n) => decompress(objects.get(n)).toString("latin1")).join("\n");
    processContentStream(objects, placements, contentText, resources, [1, 0, 0, 1, 0, 0], pageNum, 0);
  }

  // Uma marca d'agua/logo institucional (comum em PDFs baixados de sites como o
  // pciconcursos) e o MESMO objeto de imagem desenhado em praticamente toda pagina do
  // documento - uma figura de questao de verdade, por outro lado, e especifica de uma
  // unica pagina. Descarta qualquer imagem cujo objeto se repete em mais paginas do
  // que faria sentido pra uma figura legitima (ex.: um mesmo diagrama reaproveitado em
  // 2-3 questoes proximas ainda e plausivel; em praticamente todas as paginas, nao).
  const pagesByXobj = new Map<number, Set<number>>();
  for (const placement of placements) {
    if (!pagesByXobj.has(placement.xobjNum)) pagesByXobj.set(placement.xobjNum, new Set());
    pagesByXobj.get(placement.xobjNum)!.add(placement.page);
  }
  const totalPages = pageObjs.length;
  const REPEATED_WATERMARK_THRESHOLD = Math.max(4, Math.ceil(totalPages / 2));
  return placements.filter((placement) => (pagesByXobj.get(placement.xobjNum)?.size ?? 0) < REPEATED_WATERMARK_THRESHOLD);
}

export type ItemPosition = { page: number; x: number; y: number; numero: number; letra: string | null };

export type ImageAssignment = {
  numero: number;
  letra: string | null; // null = imagem pertence ao enunciado, nao a uma alternativa especifica
  bytes: Buffer;
  width: number;
  height: number;
  format: "jpeg" | "png";
};

const COLUMN_TOLERANCE = 60;

/**
 * Associa cada imagem ao item numerado (e, se aplicavel, a alternativa) mais proximo na
 * mesma coluna da pagina, considerando apenas texto que vem ANTES da imagem na leitura
 * (Y maior ou igual, ja que o eixo Y do PDF cresce de baixo pra cima). E um heuristico
 * geometrico best-effort: funciona bem pra layout de 1-2 colunas, mas nao ha garantia
 * pra layouts incomuns — por isso o rascunho de importacao sempre passa por revisao
 * manual do admin antes de confirmar.
 */
export function assignImagesToQuestions(placements: RawImagePlacement[], itemPositions: ItemPosition[]): ImageAssignment[] {
  const assignments: ImageAssignment[] = [];
  for (const placement of placements) {
    const candidates = itemPositions.filter((it) => it.page === placement.page);
    let best: ItemPosition | null = null;
    let bestScore = Infinity;
    for (const it of candidates) {
      const sameColumn = Math.abs(it.x - placement.x) < COLUMN_TOLERANCE;
      if (!sameColumn) continue;
      const above = it.y >= placement.y - 10;
      const score = above ? it.y - placement.y : placement.y - it.y + 100000;
      if (score < bestScore) {
        bestScore = score;
        best = it;
      }
    }
    if (!best) continue;
    assignments.push({
      numero: best.numero,
      letra: best.letra,
      bytes: placement.bytes,
      width: placement.width,
      height: placement.height,
      format: placement.format,
    });
  }
  return assignments;
}
