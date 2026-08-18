import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DraftPreview, buildReadingOrderPreview, parseGabaritoInput } from "@/components/admin/question-import-manager";

// O rascunho de import guarda textosApoio e questoes como arrays separados (contrato do
// schema/repository) - o JSON bruto mostra todos os textos juntos ANTES de qualquer
// questao, mesmo com o array de questoes ja na ordem do PDF. A pre-visualizacao existe
// pra corrigir isso so na revisao visual, intercalando cada texto logo antes do primeiro
// bloco de questoes que o referencia.
const draftJson = JSON.stringify({
  provas: [
    {
      titulo: "CESGRANRIO 2011",
      textosApoio: [
        { chave: "texto-1", titulo: "Texto I", conteudo: "Conteudo do primeiro texto de apoio." },
        { chave: "texto-2", titulo: "Texto II", conteudo: "Conteudo do segundo texto de apoio." },
      ],
      questoes: [
        { numero: 1, enunciado: "Enunciado 1", textoApoioChave: "texto-1", alternativas: [{ letra: "A", texto: "alfa" }] },
        { numero: 2, enunciado: "Enunciado 2", textoApoioChave: "texto-1", alternativas: [{ letra: "A", texto: "beta" }] },
        { numero: 3, enunciado: "Enunciado 3", textoApoioChave: "texto-2", alternativas: [{ letra: "A", texto: "gama" }] },
        { numero: 4, enunciado: "Enunciado 4 sem texto de apoio" },
      ],
    },
  ],
});

describe("buildReadingOrderPreview", () => {
  it("retorna as provas do JSON quando valido", () => {
    const provas = buildReadingOrderPreview(draftJson);
    expect(provas).not.toBeNull();
    expect(provas![0].questoes).toHaveLength(4);
  });

  it("retorna null quando o JSON esta invalido (admin ainda editando)", () => {
    expect(buildReadingOrderPreview("{ invalido")).toBeNull();
  });
});

describe("DraftPreview (intercala texto de apoio com as questoes na ordem do PDF)", () => {
  it("mostra cada texto de apoio uma unica vez, logo antes do primeiro bloco de questoes que o referencia", () => {
    const provas = buildReadingOrderPreview(draftJson)!;
    render(<DraftPreview provas={provas} />);

    const textoI = screen.getAllByText("Texto I");
    const textoII = screen.getAllByText("Texto II");
    expect(textoI).toHaveLength(1);
    expect(textoII).toHaveLength(1);

    // Ordem de leitura: Texto I aparece antes das questoes 1-2, Texto II antes da 3.
    const body = document.body.textContent ?? "";
    expect(body.indexOf("Texto I")).toBeLessThan(body.indexOf("Questao 1"));
    expect(body.indexOf("Questao 2")).toBeLessThan(body.indexOf("Texto II"));
    expect(body.indexOf("Texto II")).toBeLessThan(body.indexOf("Questao 3"));
  });

  it("questao sem texto de apoio (numero 4) nao mostra nenhum card de texto antes dela", () => {
    const provas = buildReadingOrderPreview(draftJson)!;
    render(<DraftPreview provas={provas} />);
    expect(screen.getByText("Questao 4")).toBeInTheDocument();
    // So 2 textos no total (nao ganhou um terceiro card vazio pra questao 4).
    expect(screen.getAllByText(/Texto (I|II)$/)).toHaveLength(2);
  });
});

describe("parseGabaritoInput", () => {
  // Pedido do usuario: digitar "1-A, 2-C, 3-E..." pra cada questao de uma prova
  // inteira (as vezes 70+ questoes) da muito trabalho. Formato simplificado: so a
  // sequencia de respostas, uma por questao, na ordem - sem precisar numerar cada uma.
  it("formato simplificado: sequencia de letras separadas por espaco, sem numero nenhum", () => {
    const gabarito = parseGabaritoInput("A C E D B");
    expect(gabarito).toEqual(new Map([[1, "A"], [2, "C"], [3, "E"], [4, "D"], [5, "B"]]));
  });

  it("formato simplificado: uma letra por linha", () => {
    const gabarito = parseGabaritoInput("A\nC\nE\nD\nB");
    expect(gabarito).toEqual(new Map([[1, "A"], [2, "C"], [3, "E"], [4, "D"], [5, "B"]]));
  });

  it("formato simplificado: minusculas tambem funcionam", () => {
    const gabarito = parseGabaritoInput("a c e d b");
    expect(gabarito).toEqual(new Map([[1, "A"], [2, "C"], [3, "E"], [4, "D"], [5, "B"]]));
  });

  it("formato com numero continua funcionando (util com questao anulada/pulada)", () => {
    const gabarito = parseGabaritoInput("1-A, 2-C, 4-D, 5-B");
    expect(gabarito).toEqual(new Map([[1, "A"], [2, "C"], [4, "D"], [5, "B"]]));
  });

  it("formato com numero tambem aceita so espaco como separador (tabela colada direto do PDF)", () => {
    const gabarito = parseGabaritoInput("01 A  02 B  03 C");
    expect(gabarito).toEqual(new Map([[1, "A"], [2, "B"], [3, "C"]]));
  });

  it("presenca de qualquer numero no texto prefere o formato explicito sobre o sequencial", () => {
    // Evita confundir: se ha numeros no texto colado (mesmo que so em ALGUMAS linhas),
    // usa o modo explicito (mais confiavel com furos na sequencia) em vez do sequencial.
    const gabarito = parseGabaritoInput("1-A\n2-C\n4-D");
    expect(gabarito.get(3)).toBeUndefined();
    expect(gabarito.get(4)).toBe("D");
  });
});
