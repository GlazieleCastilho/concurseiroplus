/**
 * Extrai imagens embutidas (JPEG/DCTDecode) de PDFs oficiais e associa cada uma a
 * uma questao/alternativa pela posicao na pagina. Deterministico, sem IA.
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
import { inflateSync } from "node:zlib";

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
};

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
        } else if (xobj && /\/Subtype\s*\/Image/.test(xobj.dictText) && /\/DCTDecode/.test(xobj.dictText) && xobj.streamBytes) {
          const width = Number(xobj.dictText.match(/\/Width\s+(\d+)/)?.[1] ?? 0);
          const height = Number(xobj.dictText.match(/\/Height\s+(\d+)/)?.[1] ?? 0);
          placements.push({ xobjNum, page: pageNum, x: ctm[4], y: ctm[5], width, height, bytes: Buffer.from(xobj.streamBytes) });
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

  return placements;
}

export type ItemPosition = { page: number; x: number; y: number; numero: number; letra: string | null };

export type ImageAssignment = {
  numero: number;
  letra: string | null; // null = imagem pertence ao enunciado, nao a uma alternativa especifica
  bytes: Buffer;
  width: number;
  height: number;
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
    });
  }
  return assignments;
}
