/**
 * Testes de regressao do parser deterministico de provas, usando como fixture o texto
 * REAL extraido (via pdf-parse) dos PDFs oficiais ja validados em producao:
 *  - FGV/TJRS 2025 - Analista do Poder Judiciario, Area Administrativa (80 questoes A-E)
 *  - CEBRASPE/PRF 2021 - Policial Rodoviario Federal (120 itens certo/errado)
 * Qualquer mudanca de regex/heuristica que quebre um layout ja suportado falha aqui,
 * em vez de regredir silenciosamente em producao (ja aconteceu uma vez: um commit de
 * correcao ficou orfao num branch mergeado e o parser voltou a perder alternativas V/F).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyGabarito,
  applyImages,
  buildProvaDraft,
  detectParsingAnomaly,
  inferProvaHints,
  parseGabaritoText,
  parseProvaText,
} from "@/lib/prova-parser";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { prf2021Questoes } from "../../prisma/seed-data/prf-2021";

const fixture = (name: string) => readFileSync(path.join(__dirname, "..", "fixtures", name), "utf-8");

const fgvProva = fixture("fgv-prova.txt");
const fgvGabarito = fixture("fgv-gabarito.txt");
const cebraspeProva = fixture("cebraspe-prova.txt");
const cebraspeGabarito = fixture("cebraspe-gabarito.txt");

describe("parseProvaText - FGV/TJRS (numero sozinho na linha, alternativas '(A) texto')", () => {
  const questoes = parseProvaText(fgvProva);

  it("encontra as 80 questoes, numeradas 1..80, todas objetivas", () => {
    expect(questoes).toHaveLength(80);
    expect(questoes.map((questao) => questao.numero)).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
    expect(questoes.every((questao) => questao.tipo === "OBJETIVA")).toBe(true);
  });

  it("extrai as 5 alternativas A-E de todas as questoes, inclusive as de V/F com combos repetidos", () => {
    for (const questao of questoes) {
      expect(questao.alternativas.map((alt) => alt.letra), `questao ${questao.numero}`).toEqual(["A", "B", "C", "D", "E"]);
    }
  });

  it("nao vaza titulo de secao nem creditos de encerramento para dentro das alternativas", () => {
    const ultimaAlternativa = (numero: number) => {
      const questao = questoes.find((item) => item.numero === numero)!;
      return questao.alternativas[questao.alternativas.length - 1].texto;
    };
    expect(ultimaAlternativa(22)).not.toContain("Tópicos de Legislação");
    expect(ultimaAlternativa(32)).not.toContain("Noções de análise");
    expect(ultimaAlternativa(44)).not.toContain("Conhecimentos Específicos");
    expect(ultimaAlternativa(80)).not.toContain("Realização");
  });

  it("nao vaza cabecalho/rodape institucional repetido para os enunciados", () => {
    for (const questao of questoes) {
      expect(questao.enunciado, `questao ${questao.numero}`).not.toContain("TRIBUNAL DE JUSTIÇA DO ESTADO");
      expect(questao.enunciado, `questao ${questao.numero}`).not.toContain("pciconcursos");
    }
  });

  it("nao dispara falso alarme de anomalia", () => {
    expect(detectParsingAnomaly(fgvProva, questoes)).toBeNull();
  });
});

describe("parseProvaText - CEBRASPE/PRF (numero + texto na mesma linha, certo/errado)", () => {
  const questoes = parseProvaText(cebraspeProva);

  it("encontra os 120 itens, todos certo/errado com alternativas C/E", () => {
    expect(questoes).toHaveLength(120);
    expect(questoes.every((questao) => questao.tipo === "CERTO_ERRADO")).toBe(true);
    expect(questoes.every((questao) => questao.alternativas.map((alt) => alt.letra).join("") === "CE")).toBe(true);
  });
});

describe("decisao de tipo por maioria (nao fabricar certo/errado em prova objetiva)", () => {
  it("em prova majoritariamente objetiva, questao sem alternativas fica OBJETIVA vazia (pendencia visivel)", () => {
    const texto = [
      "1",
      "Enunciado da primeira questao objetiva.",
      "(A) alfa.",
      "(B) beta.",
      "(C) gama.",
      "2",
      "Enunciado da segunda questao objetiva.",
      "(A) um.",
      "(B) dois.",
      "(C) tres.",
      "3",
      "Enunciado cuja lista de alternativas o parser nao reconheceu.",
    ].join("\n");
    const questoes = parseProvaText(texto);
    expect(questoes).toHaveLength(3);
    const terceira = questoes.find((questao) => questao.numero === 3)!;
    expect(terceira.tipo).toBe("OBJETIVA");
    expect(terceira.alternativas).toHaveLength(0);
  });

  it("em prova majoritariamente sem alternativas (estilo CEBRASPE), itens viram certo/errado", () => {
    const texto = ["1 Primeiro item para julgar.", "2 Segundo item para julgar.", "3 Terceiro item para julgar."].join("\n");
    const questoes = parseProvaText(texto);
    expect(questoes).toHaveLength(3);
    expect(questoes.every((questao) => questao.tipo === "CERTO_ERRADO" && questao.alternativas.length === 2)).toBe(true);
  });
});

describe("detectParsingAnomaly (nao confundir questao genuinamente longa com mesclagem)", () => {
  it("nao recusa uma questao longa (estilo ENEM, texto de apoio embutido) com contagem normal de alternativas", () => {
    const textoDeApoioLongo = "Lorem ipsum dolor sit amet consectetur adipiscing elit. ".repeat(90); // ~5300 chars
    const texto = [
      "1",
      `${textoDeApoioLongo} Considerando o texto, assinale a alternativa correta.`,
      "(A) alfa.",
      "(B) beta.",
      "(C) gama.",
      "(D) delta.",
      "(E) epsilon.",
    ].join("\n");
    const questoes = parseProvaText(texto);
    expect(questoes[0].enunciado.length).toBeGreaterThan(2500);
    expect(questoes[0].alternativas).toHaveLength(5);
    expect(detectParsingAnomaly(texto, questoes)).toBeNull();
  });

  it("recusa questao longa com contagem de alternativas fora do normal (sinal real de mesclagem)", () => {
    // Duas questoes normais (5 alternativas cada) so pra manter o caderno
    // "majoritariamente objetiva" (maioria estrita, 1 questao malformada nao empata) e a
    // questao 1 nao virar CERTO_ERRADO pelo fallback de tipo - o que estamos testando
    // aqui e o detector de anomalia, nao esse fallback.
    const textoMesclado = "Texto de duas questoes grudadas sem quebra de linha entre os itens. ".repeat(60); // ~4300 chars
    const texto = [
      "1",
      textoMesclado,
      "(A) alfa.", // so 1 alternativa reconhecida - sinal de mesclagem
      "2",
      "Enunciado normal e curto.",
      "(A) a.",
      "(B) b.",
      "(C) c.",
      "(D) d.",
      "(E) e.",
      "3",
      "Outro enunciado normal e curto.",
      "(A) a.",
      "(B) b.",
      "(C) c.",
      "(D) d.",
      "(E) e.",
    ].join("\n");
    const questoes = parseProvaText(texto);
    expect(questoes[0].enunciado.length).toBeGreaterThan(2500);
    expect(questoes[0].alternativas).toHaveLength(1);
    expect(detectParsingAnomaly(texto, questoes)).toMatch(/mescladas/);
  });

  it("recusa qualquer questao acima do teto absoluto, mesmo com contagem de alternativas normal", () => {
    const textoExtremo = "Isso e um sinal inequivoco de falha de parse independente de tudo mais. ".repeat(120); // ~8600 chars
    const texto = ["1", textoExtremo, "(A) a.", "(B) b.", "(C) c."].join("\n");
    const questoes = parseProvaText(texto);
    expect(questoes[0].enunciado.length).toBeGreaterThan(8000);
    expect(detectParsingAnomaly(texto, questoes)).not.toBeNull();
  });
});

describe("parseGabaritoText", () => {
  it("grade multi-versao FGV: seleciona a grade certa por cargo + versao da prova", () => {
    const prova1 = parseGabaritoText(fgvGabarito, { provaVersao: "1", cargo: "Área Administrativa" });
    expect(prova1.size).toBe(80);
    expect(prova1.get(1)).toBe("B");
    expect(prova1.get(20)).toBe("D");
    expect(prova1.get(80)).toBe("E");

    const prova2 = parseGabaritoText(fgvGabarito, { provaVersao: "2", cargo: "Área Administrativa" });
    expect(prova2.get(2)).toBe("B");
    expect(prova2).not.toEqual(prova1);

    const judiciaria = parseGabaritoText(fgvGabarito, { provaVersao: "1", cargo: "Área Judiciária" });
    expect(judiciaria.get(80)).toBe("E");
    expect(judiciaria.get(60)).toBe("C");
  });

  it("grade CEBRASPE (numeros colados + letras com padding de zeros): bate 120/120 com o gabarito oficial do seed", () => {
    const gabarito = parseGabaritoText(cebraspeGabarito);
    expect(gabarito.size).toBe(120);
    const itensCertoErrado = prf2021Questoes.filter((questao) => questao.tipo === "CERTO_ERRADO");
    expect(itensCertoErrado).toHaveLength(120);
    for (const questao of itensCertoErrado) {
      expect(gabarito.get(questao.numero), `item ${questao.numero}`).toBe(questao.gabarito);
    }
  });

  it("lista simples '1 - A' / '2. B' / '3) C'", () => {
    const gabarito = parseGabaritoText("1 - A\n2. B\n3) C\n");
    expect([...gabarito.entries()]).toEqual([
      [1, "A"],
      [2, "B"],
      [3, "C"],
    ]);
  });
});

describe("pipeline completo (parse + gabarito + draft + schema)", () => {
  it("FGV com hints completos gera draft valido com 80/80 gabaritos aplicados", () => {
    let questoes = parseProvaText(fgvProva);
    questoes = applyGabarito(questoes, parseGabaritoText(fgvGabarito, { provaVersao: "1", cargo: "Área Administrativa" }));
    expect(questoes.filter((questao) => !questao.gabarito)).toHaveLength(0);

    const draft = buildProvaDraft(questoes, { banca: "FGV", orgao: "TJRS", cargo: "Analista - Área Administrativa", ano: 2025 });
    const validation = bulkImportSchema.safeParse(draft);
    expect(validation.success, JSON.stringify(!validation.success && validation.error.issues.slice(0, 3))).toBe(true);
  });

  it("draft sem banca/cargo/ano NAO usa placeholder: reprova na validacao em vez de gerar slug generico", () => {
    const questoes = parseProvaText(cebraspeProva);
    const draft = buildProvaDraft(questoes, {});
    expect(draft.provas[0].titulo).toBe("");
    expect(draft.provas[0].banca).toBe("");
    const validation = bulkImportSchema.safeParse(draft);
    expect(validation.success).toBe(false);
  });
});

describe("inferProvaHints", () => {
  it("FGV/TJRS: infere a banca mas NAO chuta ano (o corpo cita 2021 mais vezes que 2025)", () => {
    expect(inferProvaHints(fgvProva)).toEqual({ banca: "FGV", ano: undefined });
  });

  it("CEBRASPE/PRF: infere banca e o ano explicito do edital", () => {
    expect(inferProvaHints(cebraspeProva)).toEqual({ banca: "CEBRASPE", ano: 2021 });
  });

  it("texto sem sinais nao inventa nada", () => {
    expect(inferProvaHints("um texto qualquer sem banca nem edital")).toEqual({ banca: undefined, ano: undefined });
  });
});

describe("applyImages", () => {
  it("anexa imagem ao enunciado (letra null) e a alternativa especifica", () => {
    const questoes = parseProvaText(["1", "Enunciado um.", "(A) alfa.", "(B) beta.", "2", "Enunciado dois.", "(A) um.", "(B) dois."].join("\n"));
    const comImagens = applyImages(questoes, [
      { numero: 1, letra: null, url: "https://cdn.exemplo/q1.jpg" },
      { numero: 2, letra: "B", url: "https://cdn.exemplo/q2b.jpg" },
    ]);
    expect(comImagens[0].imagemUrl).toBe("https://cdn.exemplo/q1.jpg");
    expect(comImagens[0].alternativas.every((alt) => !alt.imagemUrl)).toBe(true);
    expect(comImagens[1].imagemUrl).toBeUndefined();
    expect(comImagens[1].alternativas.find((alt) => alt.letra === "B")?.imagemUrl).toBe("https://cdn.exemplo/q2b.jpg");
  });
});
