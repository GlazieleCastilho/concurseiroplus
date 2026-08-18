import { describe, expect, it } from "vitest";
import { normalizeExtractedText } from "@/services/question-extraction-service";

describe("normalizeExtractedText", () => {
  it("restaura o simbolo de citacao de linha (STX 0x02 -> ℓ) no padrao '(ℓ. N-M)' da CESGRANRIO", () => {
    const raw = "incidência (\x02. 7-8) e outra (\x02. 25)";
    expect(normalizeExtractedText(raw)).toBe("incidência (ℓ. 7-8) e outra (ℓ. 25)");
  });

  it("remove outros caracteres de controle C0 que nunca sao conteudo real de prova", () => {
    const raw = "texto\x00com\x0blixo\x1fno meio";
    expect(normalizeExtractedText(raw)).toBe("textocomlixono meio");
  });

  it("preserva quebras de linha, tabs e texto normal", () => {
    const raw = "linha 1\nlinha 2\tcom tab";
    expect(normalizeExtractedText(raw)).toBe(raw);
  });

  it("nao mexe em 0x02 fora do padrao de citacao (nao seguido de ponto)", () => {
    const raw = "algo\x02sem ponto depois";
    expect(normalizeExtractedText(raw)).toBe("algosem ponto depois");
  });
});
