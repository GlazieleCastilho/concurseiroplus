export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Import the inner implementation directly: pdf-parse's index.js runs a debug branch
  // (`!module.parent`) that misfires under ESM dynamic import and crashes looking for its
  // own test fixture file.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const result = await pdfParse(buffer);
  return result.text;
}
