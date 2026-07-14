/**
 * Testes da associacao imagem -> questao/alternativa por posicao na pagina.
 * As coordenadas replicam o caso real validado (FGV/TJRS, paginas em duas colunas):
 * o texto das duas colunas se intercala por Y, entao a associacao correta depende de
 * restringir os candidatos a MESMA COLUNA (X proximo) da imagem.
 */
import { describe, expect, it } from "vitest";
import { assignImagesToQuestions, type ItemPosition, type RawImagePlacement } from "@/lib/pdf-image-extractor";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

function placement(overrides: Partial<RawImagePlacement>): RawImagePlacement {
  return { xobjNum: 1, page: 1, x: 0, y: 0, width: 100, height: 100, bytes: jpeg, ...overrides };
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
