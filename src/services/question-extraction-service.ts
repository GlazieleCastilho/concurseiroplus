export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Import the inner implementation directly: pdf-parse's index.js runs a debug branch
  // (`!module.parent`) that misfires under ESM dynamic import and crashes looking for its
  // own test fixture file.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const result = await pdfParse(buffer);
  return result.text;
}

/**
 * Extrai a posicao (pagina, x, y) de cada item numerado e alternativa, usando
 * pageData.getTextContent() do pdfjs embutido no pdf-parse. So getTextContent() —
 * nunca getOperatorList(), que carrega fontes via WorkerTransport e quebra com
 * "document is not defined" fora de um navegador mesmo sem nenhum render acontecer.
 * Usado para associar imagens extraidas (ver pdf-image-extractor.ts) a questao/alternativa.
 */
export async function extractItemPositions(buffer: Buffer): Promise<import("@/lib/pdf-image-extractor").ItemPosition[]> {
  const { ITEM_START_ALONE, ALTERNATIVA_START } = await import("@/lib/prova-parser");
  const positions: import("@/lib/pdf-image-extractor").ItemPosition[] = [];
  let currentNumero = 0;

  async function pagerender(pageData: { pageIndex: number; getTextContent: (opts: Record<string, boolean>) => Promise<{ items: Array<{ str: string; transform: number[] }> }> }) {
    const pageNum = pageData.pageIndex + 1;
    const textContent = await pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    let lastY: number | null = null;
    let buf = "";
    let firstX = 0;
    const flush = () => {
      const t = buf.trim();
      if (!t) return;
      const aloneMatch = ITEM_START_ALONE.exec(t);
      if (aloneMatch) {
        currentNumero = Number(aloneMatch[1]);
        positions.push({ page: pageNum, x: firstX, y: lastY ?? 0, numero: currentNumero, letra: null });
        return;
      }
      const altMatch = ALTERNATIVA_START.exec(t);
      if (altMatch && currentNumero > 0) {
        positions.push({ page: pageNum, x: firstX, y: lastY ?? 0, numero: currentNumero, letra: altMatch[1] });
      }
    };
    for (const item of textContent.items) {
      const y = item.transform[5];
      if (lastY === null || y === lastY) {
        if (buf === "") firstX = item.transform[4];
        buf += item.str;
      } else {
        flush();
        buf = item.str;
        firstX = item.transform[4];
      }
      lastY = y;
    }
    flush();
    return "";
  }

  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  await pdfParse(buffer, { pagerender, max: 0 });
  return positions;
}
