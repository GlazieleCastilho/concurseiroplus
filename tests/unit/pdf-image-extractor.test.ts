/**
 * Testes da associacao imagem -> questao/alternativa por posicao na pagina.
 * As coordenadas replicam o caso real validado (FGV/TJRS, paginas em duas colunas):
 * o texto das duas colunas se intercala por Y, entao a associacao correta depende de
 * restringir os candidatos a MESMA COLUNA (X proximo) da imagem.
 */
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { assignImagesToQuestions, buildPngFromFlateImage, type ItemPosition, type RawImagePlacement } from "@/lib/pdf-image-extractor";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

function placement(overrides: Partial<RawImagePlacement>): RawImagePlacement {
  return { xobjNum: 1, page: 1, x: 0, y: 0, width: 100, height: 100, bytes: jpeg, format: "jpeg", ...overrides };
}

describe("assignImagesToQuestions", () => {
  // Caso real (pagina 3 do TJRS): questao 1 na coluna esquerda (x~48) ocupa os mesmos Y
  // da questao 2 na coluna direita (x~312); a imagem esta na coluna direita em y=574.
  const itensDuasColunas: ItemPosition[] = [
    { page: 3, x: 48, y: 779, numero: 1, letra: null },
    { page: 3, x: 48, y: 560, numero: 1, letra: "A" },
    { page: 3, x: 312, y: 779, numero: 2, letra: null },
  ];

  it("associa a imagem ao item da mesma coluna, nao ao texto da coluna vizinha no mesmo Y", () => {
    const assignments = assignImagesToQuestions([placement({ page: 3, x: 323, y: 574 })], itensDuasColunas);
    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({ numero: 2, letra: null });
  });

  it("associa a alternativa especifica quando ela e o vizinho de cima na mesma coluna", () => {
    const assignments = assignImagesToQuestions([placement({ page: 3, x: 50, y: 500 })], itensDuasColunas);
    expect(assignments[0]).toMatchObject({ numero: 1, letra: "A" });
  });

  it("imagem em pagina sem item na mesma coluna (ex.: logos da capa) nao vincula a nada", () => {
    const assignments = assignImagesToQuestions([placement({ page: 1, x: 200, y: 400 })], itensDuasColunas);
    expect(assignments).toHaveLength(0);
  });

  it("ignora itens abaixo da imagem quando existe um acima na mesma coluna", () => {
    const itens: ItemPosition[] = [
      { page: 5, x: 40, y: 700, numero: 8, letra: null },
      { page: 5, x: 40, y: 300, numero: 9, letra: null },
    ];
    const assignments = assignImagesToQuestions([placement({ page: 5, x: 45, y: 500 })], itens);
    expect(assignments[0]).toMatchObject({ numero: 8, letra: null });
  });
});

describe("buildPngFromFlateImage (reconstroi PNG a partir de imagem /FlateDecode do PDF)", () => {
  // Bug original: o extrator so reconhecia imagens /DCTDecode (JPEG) e descartava
  // silenciosamente qualquer imagem /FlateDecode (comum em PDFs com imagem com canal
  // alfa/mascara, ex.: a prova real da Cesgranrio/Petrobras que motivou essa correcao).
  it("reconstroi corretamente pixels com Predictor PNG (filtro 'None' ja incluso por linha)", () => {
    // Imagem 2x2 grayscale, 1 byte por pixel: [10,20] / [30,40]. Com Predictor >= 10, o
    // PDF ja entrega cada linha prefixada com o byte de tipo de filtro (0 = "None" aqui).
    const raw = Buffer.from([0, 10, 20, 0, 30, 40]);
    const png = buildPngFromFlateImage(raw, 2, 2, 1, 8, true);
    expect(png).not.toBeNull();
    const idatStart = png!.indexOf(Buffer.from("IDAT"));
    const idatLength = png!.readUInt32BE(idatStart - 4);
    const idatData = png!.subarray(idatStart + 4, idatStart + 4 + idatLength);
    expect(inflateSync(idatData)).toEqual(raw);
    // Assinatura PNG + IHDR com largura/altura/bit depth/color type corretos.
    expect(png!.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const ihdrStart = png!.indexOf(Buffer.from("IHDR")) + 4;
    expect(png!.readUInt32BE(ihdrStart)).toBe(2); // width
    expect(png!.readUInt32BE(ihdrStart + 4)).toBe(2); // height
    expect(png![ihdrStart + 9]).toBe(0); // color type 0 = grayscale
  });

  it("insere filtro 'None' quando o PDF nao usa Predictor (pixels crus, sem prefixo por linha)", () => {
    const raw = Buffer.from([10, 20, 30, 40]); // 2x2 grayscale sem prefixo de filtro
    const png = buildPngFromFlateImage(raw, 2, 2, 1, 8, false);
    expect(png).not.toBeNull();
    const idatStart = png!.indexOf(Buffer.from("IDAT"));
    const idatLength = png!.readUInt32BE(idatStart - 4);
    const idatData = png!.subarray(idatStart + 4, idatStart + 4 + idatLength);
    expect(inflateSync(idatData)).toEqual(Buffer.from([0, 10, 20, 0, 30, 40]));
  });

  it("rejeita entrada com tamanho incompativel em vez de gerar um PNG corrompido", () => {
    expect(buildPngFromFlateImage(Buffer.from([1, 2, 3]), 2, 2, 1, 8, true)).toBeNull();
  });
});
