import { describe, expect, it } from "vitest";
import { normalizeForMatch } from "@/lib/pdf-figure-extractor";

// O resto deste modulo (extractFigureCrops) depende do mupdf renderizando um PDF real
// pra funcionar - nao ha como testar isso de forma significativa sem um PDF de verdade
// (uma prova real, com material sob direitos autorais, nao e algo pra versionar no
// repositorio). Foi verificado manualmente e extensivamente contra o PDF real da
// Cesgranrio/Petrobras que motivou esse modulo (70 questoes, 5 diagramas vetoriais
// capturados corretamente: 23, 32, 52, 54, 70; zero falsos positivos apos as correcoes
// de citacao/rascunho/marca d'agua/coluna documentadas no proprio codigo). So a funcao
// pura de normalizacao de texto (usada pra casar o enunciado com o texto extraido pelo
// mupdf) e testada aqui isoladamente.
describe("normalizeForMatch", () => {
  it("remove acentuacao, pontuacao e espacos, e normaliza pra minusculo", () => {
    expect(normalizeForMatch("Segundo o PMBOK, Edição:")).toBe("segundoopmbokedicao");
  });

  it("produz o mesmo resultado pra pequenas diferencas de espacamento/quebra de linha", () => {
    const a = normalizeForMatch("O esboço de diagrama de classes ilustrado na figura,");
    const b = normalizeForMatch("O   esboço de diagrama\nde classes ilustrado na figura,");
    expect(a).toBe(b);
  });

  it("mantem numeros", () => {
    expect(normalizeForMatch("Considere as sentenças 1 e 2")).toBe("considereassentencas1e2");
  });
});
