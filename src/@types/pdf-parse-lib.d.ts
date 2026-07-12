declare module "pdf-parse/lib/pdf-parse.js" {
  import type { PDFParseResult } from "pdf-parse";

  function pdfParse(dataBuffer: Buffer, options?: unknown): Promise<PDFParseResult>;
  export default pdfParse;
}
