/**
 * Testes de regressao do parser deterministico de provas, usando como fixture o texto
 * REAL extraido (via pdf-parse) dos PDFs oficiais ja validados em producao:
 *  - FGV/TJRS 2025 - Analista do Poder Judiciario, Area Administrativa (80 questoes A-E)
 *  - CEBRASPE/PRF 2021 - Policial Rodoviario Federal (120 itens certo/errado)
 *  - CEBRASPE/PRF 2019 - Policial Rodoviario Federal (120 itens, com textos de apoio que
 *    trazem numeracao de linha na margem - regressao real: essa numeracao de margem era
 *    interpretada como item novo, corrompendo item 34 (11996 chars mesclados) e perdendo
 *    33 itens (1-33) inteiros; itens 24/25/26 nao tem texto proprio, so uma figura)
 *  - SERPRO/UnB-CESPE - Analista, Desenvolvimento de Sistemas (formato ainda mais antigo:
 *    numeracao de linha na margem intercalada no meio do texto corrido, sem separacao por
 *    linha em branco; os itens da prova em si nao sao numerados no texto, so implicados
 *    por instrucoes tipo "julgue os itens de 1 a 8" - formato que este parser NAO suporta
 *    ainda. O teste trava que o parser falha honestamente (0 questoes, sem inventar itens
 *    a partir da numeracao de margem) em vez de produzir questoes falsas)
 *  - CESGRANRIO/PETROBRAS - Analista de Sistemas Junior (pagina de instrucoes numeradas
 *    "01 - ...", "02 - ..." antes das questoes, com sub-itens em minuscula "a) ... b) ..."
 *    e linhas de continuacao que quebravam a deteccao do primeiro item real - regressao
 *    real: questao 1 virava o bloco de instrucoes inteiro, 3129 chars e 0 alternativas.
 *    Tambem regressao de uma frase em ingles "...grow from about" que quebra de linha
 *    exatamente em "10 per cent of GDP...", sendo lida como o inicio da questao 10 e
 *    engolindo a questao 9 real. Essa prova tambem tem os itens 16/17 fora de ordem
 *    numerica no proprio PDF de origem (aparecem depois do item 20, layout em colunas) -
 *    sem tratamento, isso gerava uma questao 20 com 15 alternativas (3 mescladas);
 *    corrigido permitindo reabrir um numero menor que o ultimo, no formato "sozinho na
 *    linha", desde que ainda nao tenha sido usado por nenhuma questao)
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
  findAlternativaCountWarnings,
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
const prf2019Prova = fixture("prf2019-prova.txt");
const serproProva = fixture("serpro-prova.txt");
const cesgranrioProva = fixture("cesgranrio-petrobras-prova.txt");

describe("parseProvaText - FGV/TJRS (numero sozinho na linha, alternativas '(A) texto')", () => {
  const { questoes } = parseProvaText(fgvProva);

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
  const { questoes } = parseProvaText(cebraspeProva);

  it("encontra os 120 itens, todos certo/errado com alternativas C/E", () => {
    expect(questoes).toHaveLength(120);
    expect(questoes.every((questao) => questao.tipo === "CERTO_ERRADO")).toBe(true);
    expect(questoes.every((questao) => questao.alternativas.map((alt) => alt.letra).join("") === "CE")).toBe(true);
  });
});

describe("parseProvaText - textos de apoio (titulo 'Texto X' antes de um grupo de questoes)", () => {
  const { questoes, textosApoio } = parseProvaText(cebraspeProva);

  it("captura o texto de apoio como entidade propria, com titulo e conteudo", () => {
    const texto = textosApoio.find((item) => item.titulo === "Texto 1A18-I");
    expect(texto).toBeDefined();
    expect(texto!.conteudo).toContain("Estados Unidos da América");
    expect(texto!.conteudo.length).toBeGreaterThan(100);
  });

  it("questao 8 (antes do titulo) nao herda a chave do texto de apoio seguinte", () => {
    const questao8 = questoes.find((item) => item.numero === 8)!;
    expect(questao8.textoApoioChave).toBeUndefined();
    expect(questao8.enunciado).not.toContain("Estados Unidos da América");
  });

  it("questao 9 (depois do titulo) referencia a chave do texto de apoio", () => {
    const texto = textosApoio.find((item) => item.titulo === "Texto 1A18-I")!;
    const questao9 = questoes.find((item) => item.numero === 9)!;
    expect(questao9.textoApoioChave).toBe(texto.chave);
  });

  it("nao duplica nem infla a questao anterior ao titulo (bug original: flush() sem zerar current)", () => {
    expect(questoes.filter((item) => item.numero === 8)).toHaveLength(1);
    const questao8 = questoes.find((item) => item.numero === 8)!;
    expect(questao8.enunciado.length).toBeLessThan(300);
  });
});

describe("parseProvaText - CEBRASPE/PRF 2019 (textos de apoio com numeracao de linha na margem)", () => {
  const { questoes } = parseProvaText(prf2019Prova);

  it("encontra os 120 itens (nao perde os que ficam atras de anotacao de linha na margem)", () => {
    expect(questoes).toHaveLength(120);
    expect(questoes.map((questao) => questao.numero)).toEqual(Array.from({ length: 120 }, (_, i) => i + 1));
  });

  it("nao mescla o item 34 com o texto de apoio que vem antes dele (bug original: 11996 chars)", () => {
    const questao34 = questoes.find((item) => item.numero === 34)!;
    expect(questao34.enunciado.length).toBeLessThan(2000);
    expect(questao34.enunciado).toContain("software as a service");
  });

  it("recupera itens 1-33, que ficavam presos atras da anotacao de margem (bug original: item ausente)", () => {
    const questao1 = questoes.find((item) => item.numero === 1)!;
    expect(questao1.enunciado).toContain("viceja");
    const questao23 = questoes.find((item) => item.numero === 23)!;
    expect(questao23.enunciado.length).toBeLessThan(1000);
  });

  it("itens so-figura (24, 25) sem texto proprio entram com placeholder em vez de sumir", () => {
    for (const numero of [24, 25]) {
      const questao = questoes.find((item) => item.numero === numero)!;
      expect(questao, `item ${numero}`).toBeDefined();
      expect(questao.enunciado).toContain("Sem texto extraído");
    }
  });

  it("nao dispara falso alarme de anomalia", () => {
    expect(detectParsingAnomaly(prf2019Prova, questoes)).toBeNull();
  });
});

describe("parseProvaText - SERPRO/UnB-CESPE (formato nao suportado: itens sem numero no texto)", () => {
  it("falha honestamente (0 questoes) em vez de inventar itens a partir da numeracao de margem", () => {
    // Regressao real: antes da deteccao de anotacao de margem funcionar aqui tambem
    // (passo constante > 1, mesmo sem separacao por linha em branco), esse PDF gerava
    // 6 "questoes" falsas a partir dos numeros de margem mal interpretados como item -
    // pior que falhar limpo, porque parecia ter funcionado parcialmente.
    const { questoes } = parseProvaText(serproProva);
    expect(questoes).toHaveLength(0);
  });
});

describe("parseProvaText - CESGRANRIO/PETROBRAS (pagina de instrucoes numeradas + falso item em frase corrida)", () => {
  const { questoes } = parseProvaText(cesgranrioProva);

  it("nao confunde o bloco de instrucoes (01-12, com sub-itens minusculos) com a questao 1", () => {
    const questao1 = questoes.find((item) => item.numero === 1)!;
    expect(questao1).toBeDefined();
    expect(questao1.alternativas).toHaveLength(5);
    expect(questao1.enunciado).toContain("Segundo o Texto I");
    expect(questao1.enunciado.length).toBeLessThan(200);
  });

  it("nao confunde uma frase em ingles que quebra de linha em '10 per cent...' com o inicio da questao 10, perdendo a questao 9", () => {
    const questao9 = questoes.find((item) => item.numero === 9)!;
    expect(questao9).toBeDefined();
    expect(questao9.alternativas.length).toBeGreaterThanOrEqual(2);
    const questao10 = questoes.find((item) => item.numero === 10)!;
    expect(questao10).toBeDefined();
    expect(questao10.enunciado).not.toContain("per cent of GDP");
  });

  it("separa afirmativas em algarismos romanos (I/II/III) em paragrafos proprios, em vez de achatar tudo numa linha corrida", () => {
    // Pedido do usuario: enunciados do tipo "analise as afirmativas abaixo" tem cada
    // afirmativa (I - ..., II - ..., III - ...) numa linha propria no PDF de origem,
    // mas ficavam todos amassados numa unica linha corrida no enunciado final - dificil
    // de ler. formatEnunciadoWithItemBreaks preserva a separacao visual (quebra de
    // paragrafo antes de cada item) sem alterar uma palavra do conteudo. Cobre tambem a
    // variacao em que o "I" fica sozinho na propria linha, com o hifen so na seguinte
    // (ver ROMAN_ITEM_BARE) - a questao 9 tem exatamente esse caso no PDF de origem.
    const questao9 = questoes.find((item) => item.numero === 9)!;
    const paragrafos9 = questao9.enunciado.split("\n\n");
    expect(paragrafos9.length).toBeGreaterThanOrEqual(4);
    expect(paragrafos9[1]).toMatch(/^I - A forma verbal houvesse/);
    expect(paragrafos9[2]).toMatch(/^II - O verbo haver/);
    expect(paragrafos9[3]).toMatch(/^III - A forma verbal houvesse/);

    const questao23 = questoes.find((item) => item.numero === 23)!;
    const paragrafos23 = questao23.enunciado.split("\n\n");
    expect(paragrafos23[1]).toMatch(/^I - A data mais cedo/);
    expect(paragrafos23[2]).toMatch(/^II - Caso a previsão/);
    expect(paragrafos23[3]).toMatch(/^III - A folga total/);
  });

  it("recupera itens 16 e 17 mesmo aparecendo fora de ordem numerica no PDF (depois do item 20, layout em colunas)", () => {
    // Bug original: como o parser exige numeros crescentes, "16" e "17" apos "20" no
    // texto nunca abriam bloco proprio e ficavam grudados dentro da questao 20 (que
    // terminava com 15 alternativas, 3 questoes mescladas). Corrigido permitindo
    // reabrir um numero MENOR que o ultimo, desde que seja formato "sozinho na linha"
    // e ainda nao tenha sido usado por nenhuma questao.
    expect(questoes).toHaveLength(70);
    expect(questoes.map((questao) => questao.numero).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 70 }, (_, i) => i + 1),
    );
    for (const numero of [16, 17, 20]) {
      const questao = questoes.find((item) => item.numero === numero)!;
      expect(questao, `questao ${numero}`).toBeDefined();
      expect(questao.alternativas, `questao ${numero}`).toHaveLength(5);
    }
    expect(detectParsingAnomaly(cesgranrioProva, questoes)).toBeNull();
  });

  it("reconhece a legenda de uma questao 'associe' impressa fora de ordem e move pro enunciado, sem deixar grudada na ultima alternativa", () => {
    // Bug original: questoes "associe" (ex.: 40, 42, 43, 46, 49, 51) trazem, no LAYOUT
    // VISUAL da pagina, uma legenda em duas colunas (lista em algarismos romanos
    // "I - ...", lista em letras "P - ...") ENTRE o comando e as alternativas - mas o
    // texto extraido do PDF linearriza isso e imprime a legenda inteira DEPOIS das
    // alternativas. Nao e vazamento de outra questao: e o proprio comando da questao,
    // so impresso fora de ordem - splitAssociationLegend reconhece o padrao e move a
    // legenda pro fim do enunciado, no lugar de deixa-la grudada na ultima alternativa.
    // Todas as SEIS ficam com a ultima alternativa limpa (a legenda nunca mais e
    // confundida com o texto da resposta em si, que e o que causava o falso positivo
    // de "alternativa muito maior que as irmas").
    for (const numero of [40, 42, 43, 49, 51]) {
      const questao = questoes.find((item) => item.numero === numero)!;
      const ultimaAlternativa = questao.alternativas[questao.alternativas.length - 1];
      expect(ultimaAlternativa.texto.length, `questao ${numero} ultima alternativa`).toBeLessThan(30);
    }
    // Limitacao residual conhecida: como a legenda de uma questao pode fisicamente
    // aparecer no PDF logo depois de OUTRA questao (nao a dela mesma - artefato do
    // mesmo layout em colunas), splitAssociationLegend as vezes anexa a legenda certa
    // a questao errada (ex.: a legenda da 43 acaba na 46, a da 49 acaba na 51) - sem
    // vazar como ruido bruto numa alternativa, so no lugar (enunciado) errado.
    const questao40 = questoes.find((item) => item.numero === 40)!;
    expect(questao40.enunciado).toContain("Perspectiva organizacional");
    // Pedido do usuario: a legenda (I/II/III e P/Q/R/S) tambem deve ficar separada em
    // paragrafos proprios, igual as afirmativas comuns - nao so o enunciado original.
    const paragrafos40 = questao40.enunciado.split("\n\n");
    expect(paragrafos40).toContain("I - Atividades");
    expect(paragrafos40).toContain("II - Responsabilidades, dependências e autoridade");
    expect(paragrafos40).toContain("P - Perspectiva funcional");
    expect(paragrafos40).toContain("S - Perspectiva organizacional");

    // Questao 46 tem um aviso DIFERENTE agora (ver proximo teste: tabela de dados
    // propria dela, nao a legenda) - as outras cinco nao devem avisar mais.
    const warnings = findAlternativaCountWarnings(questoes);
    for (const numero of [40, 42, 43, 49, 51]) {
      expect(warnings.some((warning) => warning.startsWith(`Questão ${numero}:`)), `nao deveria mais avisar pra questao ${numero}`).toBe(false);
    }
  });

  it("remove uma tabela de dados embaralhada da ultima alternativa e avisa, em vez de deixar o texto ilegivel", () => {
    // Bug reportado pelo usuario: a questao 46 tem uma tabela de dados de verdade
    // (Recurso/Junho/Julho/Agosto/Percentual trimestral) entre o enunciado e a pergunta
    // final - mas cada celula da tabela vira um pedaco de texto solto na extracao, e a
    // linearizacao concatena tudo sem espaco ("RecursoJunhoJulhoAgostoPercentual...
    // Roldana311219,05%..."), grudado na ultima alternativa (E). Diferente da legenda de
    // questao "associe" (formato reconhecivel, reconstruivel), o CONTEUDO de uma tabela
    // assim nao da pra reconstruir com confianca a partir do texto extraido - a unica
    // opcao segura e remover (nao inventar uma reconstrucao) e avisar o admin pra
    // revisar o PDF original e anexar a tabela manualmente.
    const questao46 = questoes.find((item) => item.numero === 46)!;
    expect(questao46.alternativas.map((alt) => alt.texto)).toEqual(["0", "3", "4", "9", "12"]);
    expect(questao46.tabelaNaoExtraida).toBe(true);

    const warnings = findAlternativaCountWarnings(questoes);
    expect(warnings.some((warning) => warning.startsWith("Questão 46:") && warning.includes("tabela de dados"))).toBe(true);

    // Nao pode disparar em questoes normais so por citarem uma URL/hash com muitos
    // digitos colados a letras (ex.: questao 10, cujo vazamento por quebra de pagina
    // inclui uma URL de citacao real "<http://www.ft.com/cms/s/0/fa11320c-4f48...>") -
    // esse e um sinal totalmente diferente de uma tabela de dados de verdade.
    const questao10 = questoes.find((item) => item.numero === 10)!;
    expect(questao10.tabelaNaoExtraida).toBeUndefined();
    expect(warnings.some((warning) => warning.startsWith("Questão 10:"))).toBe(false);
  });

  it("nao deixa um numero de pagina cru (sem 'Pagina' na frente) vazar pra ultima alternativa em aberto", () => {
    // Bug original: apos a marca d'agua/rodape de quebra de pagina, o numero da pagina
    // 8 aparece sozinho na linha, sem nenhuma palavra como "Pagina" na frente (por isso
    // NOISE_LINE nao pega). Como 8 ja tinha sido usado como questao antes e nao e maior
    // que o ultimo item (23), nem isForwardOpen nem isOutOfOrderReopen abriam bloco pra
    // ele, entao caia como texto solto na alternativa E da questao 23: "(E) II e III 8".
    const questao23 = questoes.find((item) => item.numero === 23)!;
    const ultimaAlternativa23 = questao23.alternativas[questao23.alternativas.length - 1];
    expect(ultimaAlternativa23.texto).toBe("II e III");
  });

  it("nao deixa a marca d'agua 'RASCUNHO' (espaco reservado pro candidato) vazar pra ultima alternativa", () => {
    // Bug original: "RASCUNHO" aparece sozinho na linha, sem bater em nenhum padrao
    // de NOISE_LINE existente (nao e "espaço livre", nao tem "Pagina" na frente) -
    // caia como texto solto na ultima alternativa em aberto no momento, ex.:
    // "...à qualidade. RASCUNHO" na questao 42.
    for (const questao of questoes) {
      for (const alternativa of questao.alternativas) {
        expect(alternativa.texto, `questao ${questao.numero} alternativa ${alternativa.letra}`).not.toMatch(/rascunho/i);
      }
    }
  });

  it("reconhece titulo de texto de apoio em ingles ('Text I'/'Text II', secao de lingua estrangeira), nao so 'Texto' em portugues", () => {
    const { textosApoio, questoes } = parseProvaText(cesgranrioProva);
    const textI = textosApoio.find((item) => item.titulo === "Text I");
    const textII = textosApoio.find((item) => item.titulo === "Text II");
    expect(textI).toBeDefined();
    expect(textII).toBeDefined();
    // Bug original: regex so aceitava "Texto"/"TEXTO" (portugues), entao "Text I"/
    // "Text II" (secao de lingua estrangeira) nao eram reconhecidos como titulo e o
    // texto inteiro vazava para dentro da ultima alternativa da questao anterior.
    const questao5 = questoes.find((item) => item.numero === 5)!;
    const ultimaAlternativa5 = questao5.alternativas[questao5.alternativas.length - 1];
    expect(ultimaAlternativa5.texto.length).toBeLessThan(20);
  });

  it("captura o texto de apoio que vem antes da questao 1 (fora da faixa que comeca em firstQuestionIndex)", () => {
    // Bug original: o loop principal so comecava em firstQuestionIndex (pulando a
    // pagina de instrucoes numeradas). Como o "Texto I" da questao 1 fica ANTES dela
    // no PDF (junto com as instrucoes puladas), esse texto nunca era visto e a
    // questao 1 ficava sem texto de apoio.
    const { questoes, textosApoio } = parseProvaText(cesgranrioProva);
    const texto = textosApoio.find((item) => item.titulo === "Texto I");
    expect(texto).toBeDefined();
    expect(texto!.conteudo).toContain("REPIQUE");
    const questao1 = questoes.find((item) => item.numero === 1)!;
    expect(questao1.textoApoioChave).toBe(texto!.chave);
  });

  it("prefere um trecho entre aspas que aparece literalmente no texto de apoio sobre a posicao no PDF, mesmo sem citar o titulo por extenso", () => {
    // Bug original (limitacao conhecida, agora corrigida): a questao 9 nao cita
    // "Texto II" por extenso, entao so a atribuicao por posicao valia - e por posicao
    // ela ficava colada a "Text I" (a secao de lingua estrangeira, que na extracao
    // linearizada do PDF aparece fisicamente antes dela por causa do layout em
    // colunas). Mas o enunciado da questao 9 cita um trecho entre aspas que e, palavra
    // por palavra, um pedaco do conteudo real do Texto II - sinal tao confiavel quanto
    // citar o titulo, so que sem depender de mencao explicita.
    const { questoes, textosApoio } = parseProvaText(cesgranrioProva);
    const textoII = textosApoio.find((item) => item.titulo === "Texto II")!;
    const questao9 = questoes.find((item) => item.numero === 9)!;
    expect(questao9.enunciado).toContain("houvesse");
    expect(questao9.textoApoioChave).toBe(textoII.chave);
  });

  it("prefere mencao explicita ao titulo no enunciado sobre a posicao no PDF (layout em colunas intercala secoes)", () => {
    // Bug original: nesse PDF, o titulo "Text I" (secao de lingua estrangeira)
    // aparece fisicamente ANTES das questoes 9 e 10 no texto linearizado, mesmo elas
    // ainda sendo sobre o "Texto II" (portugues) - artefato de layout em colunas (uma
    // coluna ja mostra o titulo da proxima secao enquanto a outra ainda termina a
    // anterior). Atribuicao so por posicao dava a questao 10 o texto errado (Text I),
    // apesar dela citar "Texto II" explicitamente no proprio enunciado.
    const { questoes, textosApoio } = parseProvaText(cesgranrioProva);
    const textoII = textosApoio.find((item) => item.titulo === "Texto II")!;
    const questao10 = questoes.find((item) => item.numero === 10)!;
    expect(questao10.enunciado).toContain("Texto II");
    expect(questao10.textoApoioChave).toBe(textoII.chave);
  });

  it("nao deixa a continuacao de um texto de apoio sem titulo repetido vazar pra ultima alternativa em aberto", () => {
    // Bug original: apos a quebra de pagina (marca d'agua "pcimarkpci"), o "Text I"
    // retoma sem repetir o titulo, no meio da acumulacao da questao 10 (que ja tinha
    // fechado sua alternativa E). Esse paragrafo inteiro em ingles ficava grudado no
    // final da alternativa E da questao 10 (a ultima em aberto no momento da quebra).
    const { questoes, textosApoio } = parseProvaText(cesgranrioProva);
    const questao10 = questoes.find((item) => item.numero === 10)!;
    const ultimaAlternativa10 = questao10.alternativas[questao10.alternativas.length - 1];
    expect(ultimaAlternativa10.texto.length).toBeLessThan(50);
    expect(ultimaAlternativa10.texto).not.toContain("Without");

    const textI = textosApoio.find((item) => item.titulo === "Text I")!;
    expect(textI.conteudo).toContain("Without");
    expect(textI.conteudo).toContain("local content policy");
  });

  it("reconstitui palavras quebradas por hifen de justificacao no fim da linha (nao deixa 'engala- nado' no lugar de 'engalanada')", () => {
    // Bug original: linhas eram sempre juntadas com espaco simples. PDFs com texto
    // justificado quebram palavras longas no fim da linha com hifen ("engala-" numa
    // linha, "nado" na proxima) - juntar com espaco deixa o hifen solto no meio da
    // palavra em qualquer texto corrido da prova (textos de apoio, enunciados,
    // alternativas). Nao pode virar um "coma tudo": uma sigla real com hifen quebrada
    // no fim da linha (ex.: "CARTÃO-" seguido de "RESPOSTA") tem que continuar intacta.
    const { textosApoio, questoes } = parseProvaText(cesgranrioProva);
    const texto1 = textosApoio.find((item) => item.titulo === "Texto I")!;
    expect(texto1.conteudo).toContain("engalanada");
    expect(texto1.conteudo).not.toMatch(/engala-\s/);
    const texto2 = textosApoio.find((item) => item.titulo === "Texto II")!;
    expect(texto2.conteudo).toContain("gente diferenciada");
    expect(texto2.conteudo).toContain("Higienópolis");
    expect(texto2.conteudo).toContain("polêmica");
    for (const texto of textosApoio) {
      expect(texto.conteudo, texto.titulo).not.toMatch(/\p{L}-\s\p{L}/u);
    }
    for (const questao of questoes) {
      expect(questao.enunciado, `questao ${questao.numero}`).not.toMatch(/\p{L}-\s\p{L}/u);
      for (const alternativa of questao.alternativas) {
        expect(alternativa.texto, `questao ${questao.numero} alternativa ${alternativa.letra}`).not.toMatch(/\p{L}-\s\p{L}/u);
      }
    }
  });

  it("nao vaza o texto de apoio do bloco de interpretacao pras questoes de conhecimentos especificos (titulo de secao encerra o vinculo)", () => {
    // Bug original: activeTextoApoioChave e atribuida por posicao (o texto de apoio
    // mais recente antes da questao) e so era limpa ao encontrar um NOVO titulo de
    // texto de apoio - nunca ao encontrar um titulo de secao generico ("CONHECIMENTOS
    // ESPECIFICOS", "BLOCO 1"), que marca a fronteira real entre o bloco de
    // interpretacao de texto e o bloco seguinte, de assunto totalmente diferente. Toda
    // questao de 21 a 70 (PMBOK, BPM, banco de dados, logica...) herdava por engano a
    // chave do "Text II" (a ultima passagem de ingles antes da secao 21-70 comecar).
    const { questoes } = parseProvaText(cesgranrioProva);
    for (const numero of [21, 30, 40, 46, 51, 60, 70]) {
      const questao = questoes.find((item) => item.numero === numero)!;
      expect(questao.textoApoioChave, `questao ${numero}`).toBeUndefined();
    }
    for (const numero of [19, 20]) {
      const questao = questoes.find((item) => item.numero === numero)!;
      expect(questao.textoApoioChave, `questao ${numero}`).toBeDefined();
    }
  });

  it("preserva texto de apoio curto (< 100 chars) com aviso de revisao em vez de descartar a referencia", () => {
    // Antes: textos de apoio com menos de MIN_TEXTO_APOIO_LENGTH eram descartados por
    // inteiro - a questao seguinte ficava sem nenhuma chave, mesmo tendo um titulo de
    // texto de apoio de verdade (ex.: charge com legenda curta, citacao, texto cujo
    // corpo principal esta numa imagem). Curto agora vira entidade com aviso, nao some.
    const texto = [
      "Texto I",
      "Uma citacao curta.",
      "1",
      "Segundo o Texto I, a citacao e de quem?",
      "(A) autor A.",
      "(B) autor B.",
    ].join("\n");
    const { questoes, textosApoio } = parseProvaText(texto);
    expect(textosApoio).toHaveLength(1);
    expect(textosApoio[0].conteudo).toContain("revisar PDF original");
    expect(textosApoio[0].conteudo).toContain("Uma citacao curta.");
    const questao1 = questoes.find((item) => item.numero === 1)!;
    expect(questao1.textoApoioChave).toBe(textosApoio[0].chave);
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
    const { questoes } = parseProvaText(texto);
    expect(questoes).toHaveLength(3);
    const terceira = questoes.find((questao) => questao.numero === 3)!;
    expect(terceira.tipo).toBe("OBJETIVA");
    expect(terceira.alternativas).toHaveLength(0);
  });

  it("em prova majoritariamente sem alternativas (estilo CEBRASPE), itens viram certo/errado", () => {
    const texto = ["1 Primeiro item para julgar.", "2 Segundo item para julgar.", "3 Terceiro item para julgar."].join("\n");
    const { questoes } = parseProvaText(texto);
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
    const { questoes } = parseProvaText(texto);
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
    const { questoes } = parseProvaText(texto);
    expect(questoes[0].enunciado.length).toBeGreaterThan(2500);
    expect(questoes[0].alternativas).toHaveLength(1);
    expect(detectParsingAnomaly(texto, questoes)).toMatch(/mescladas/);
  });

  it("recusa qualquer questao acima do teto absoluto, mesmo com contagem de alternativas normal", () => {
    const textoExtremo = "Isso e um sinal inequivoco de falha de parse independente de tudo mais. ".repeat(120); // ~8600 chars
    const texto = ["1", textoExtremo, "(A) a.", "(B) b.", "(C) c."].join("\n");
    const { questoes } = parseProvaText(texto);
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
    let { questoes } = parseProvaText(fgvProva);
    questoes = applyGabarito(questoes, parseGabaritoText(fgvGabarito, { provaVersao: "1", cargo: "Área Administrativa" }));
    expect(questoes.filter((questao) => !questao.gabarito)).toHaveLength(0);

    const draft = buildProvaDraft(questoes, { banca: "FGV", orgao: "TJRS", cargo: "Analista - Área Administrativa", ano: 2025 });
    const validation = bulkImportSchema.safeParse(draft);
    expect(validation.success, JSON.stringify(!validation.success && validation.error.issues.slice(0, 3))).toBe(true);
  });

  it("draft sem banca/cargo/ano NAO usa placeholder: reprova na validacao em vez de gerar slug generico", () => {
    const { questoes } = parseProvaText(cebraspeProva);
    const draft = buildProvaDraft(questoes, {});
    expect(draft.provas[0].titulo).toBe("");
    expect(draft.provas[0].banca).toBe("");
    const validation = bulkImportSchema.safeParse(draft);
    expect(validation.success).toBe(false);
  });
});

describe("inferProvaHints", () => {
  it("FGV/TJRS: infere a banca mas NAO chuta ano (o corpo cita 2021 mais vezes que 2025)", () => {
    const hints = inferProvaHints(fgvProva);
    expect(hints.banca).toBe("FGV");
    expect(hints.ano).toBeUndefined();
  });

  it("CEBRASPE/PRF: infere banca e o ano explicito do edital", () => {
    const hints = inferProvaHints(cebraspeProva);
    expect(hints.banca).toBe("CEBRASPE");
    expect(hints.ano).toBe(2021);
  });

  it("texto sem sinais nao inventa nada", () => {
    expect(inferProvaHints("um texto qualquer sem banca nem edital")).toEqual({ banca: undefined, ano: undefined, nivel: undefined });
  });

  it("infere nivel apenas com sinal explicito no texto ('Nivel Medio', 'Ensino Fundamental'...)", () => {
    expect(inferProvaHints("Concurso Publico - Nivel Medio").nivel).toEqual(["MEDIO"]);
    expect(inferProvaHints("Prova de Ensino Fundamental").nivel).toEqual(["FUNDAMENTAL"]);
    expect(inferProvaHints("Concurso para Nivel Medio e Nivel Superior").nivel).toEqual(["MEDIO", "SUPERIOR"]);
    expect(inferProvaHints("texto sem nenhum sinal de nivel").nivel).toBeUndefined();
  });
});

describe("applyImages", () => {
  it("anexa imagem ao enunciado (letra null) e a alternativa especifica", () => {
    const { questoes } = parseProvaText(["1", "Enunciado um.", "(A) alfa.", "(B) beta.", "2", "Enunciado dois.", "(A) um.", "(B) dois."].join("\n"));
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
