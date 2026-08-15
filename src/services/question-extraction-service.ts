export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Importa diretamente a implementação interna do pdf-parse.
  // Isso evita um problema do index.js do pdf-parse em ambiente ESM,
  // onde ele pode tentar executar um branch de debug e procurar
  // um arquivo de teste que não existe no ambiente de produção.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;

  const result = await pdfParse(buffer);

  return result.text;
}

/**
 * Extrai a posição (página, X e Y) de cada questão e alternativa
 * encontrada no PDF.
 *
 * Essas posições são utilizadas posteriormente pelo
 * pdf-image-extractor.ts para tentar associar imagens
 * às respectivas questões ou alternativas.
 *
 * Importante:
 * - Utilizamos getTextContent(), que é compatível com o ambiente Node.
 * - Não utilizamos getOperatorList(), pois ele pode tentar carregar
 *   recursos do navegador e causar erros como "document is not defined".
 */
export async function extractItemPositions(
  buffer: Buffer
): Promise<import("@/lib/pdf-image-extractor").ItemPosition[]> {
  // Reutilizamos os mesmos padrões utilizados pelo parser principal
  // para identificar:
  // - números de questões isolados;
  // - alternativas como (A), (B), (C), etc.
  const { ITEM_START_ALONE, ALTERNATIVA_START } =
    await import("@/lib/prova-parser");

  // Resultado final contendo a posição de cada questão/alternativa.
  const positions: import("@/lib/pdf-image-extractor").ItemPosition[] = [];

  // Guarda o número da última questão identificada.
  // As alternativas encontradas posteriormente serão associadas
  // a essa questão.
  let currentNumero = 0;

  // Configurações relacionadas ao layout do PDF.
  //
  // Não podemos comparar coordenadas Y usando === porque PDFs podem
  // retornar pequenas diferenças decimais para textos que visualmente
  // estão na mesma linha.
  //
  // Exemplo:
  //   item 1 -> Y = 742.000
  //   item 2 -> Y = 741.800
  //
  // Visualmente podem estar na mesma linha, portanto consideramos
  // uma diferença de até 1.5 pontos como pertencente à mesma linha.
  const PDF_LAYOUT = {
    yTolerance: 1.5,
  };

  /**
   * Processa o texto acumulado de uma linha.
   *
   * O PDF pode retornar vários pedaços de texto para uma mesma linha.
   * Primeiro acumulamos esses pedaços em "buf" e somente depois
   * analisamos se aquela linha representa:
   *
   * 1. Uma nova questão;
   * 2. Uma alternativa;
   * 3. Apenas texto comum.
   */
  async function pagerender(pageData: {
    pageIndex: number;

    getTextContent: (
      opts: Record<string, boolean>
    ) => Promise<{
      items: Array<{
        str: string;
        transform: number[];
      }>;
    }>;
  }) {
    // pageIndex começa em 0 no PDF.js.
    // Para o nosso sistema, queremos páginas começando em 1.
    const pageNum = pageData.pageIndex + 1;

    // Extrai os elementos de texto da página.
    const textContent = await pageData.getTextContent({
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });

    // Y da última linha processada.
    let lastY: number | null = null;

    // Texto acumulado da linha atual.
    let buf = "";

    // Coordenada X do primeiro elemento da linha.
    // Será utilizada como referência da posição da questão/alternativa.
    let firstX = 0;

    /**
     * Finaliza o processamento da linha atual.
     *
     * Aqui verificamos se o texto acumulado representa uma questão
     * ou uma alternativa.
     */
    const flush = () => {
      const t = buf.trim();

      // Se a linha estiver vazia, não há nada para processar.
      if (!t) return;

      // Verifica se a linha contém somente o número da questão.
      //
      // Exemplo:
      //   1
      //   2
      //   25
      const aloneMatch = ITEM_START_ALONE.exec(t);

      if (aloneMatch) {
        // Atualiza a questão atualmente ativa.
        currentNumero = Number(aloneMatch[1]);

        // Registra a posição da questão.
        positions.push({
          page: pageNum,
          x: firstX,
          y: lastY ?? 0,
          numero: currentNumero,
          letra: null,
        });

        return;
      }

      // Verifica se a linha começa com uma alternativa.
      //
      // Exemplos:
      //   (A) texto da alternativa
      //   (B) texto da alternativa
      //   (C) texto da alternativa
      const altMatch = ALTERNATIVA_START.exec(t);

      // Só registramos uma alternativa se já tivermos identificado
      // uma questão anteriormente.
      if (altMatch && currentNumero > 0) {
        positions.push({
          page: pageNum,
          x: firstX,
          y: lastY ?? 0,
          numero: currentNumero,
          letra: altMatch[1],
        });
      }
    };

    /**
     * Percorre todos os elementos de texto encontrados na página.
     *
     * O PDF não necessariamente entrega valores Y exatamente iguais
     * para elementos que pertencem visualmente à mesma linha.
     */
    for (const item of textContent.items) {
      // transform[5] representa a coordenada Y do elemento.
      const y = item.transform[5];

      /**
       * Verifica se o elemento atual pertence à mesma linha do
       * elemento anterior.
       *
       * Antes:
       *   y === lastY
       *
       * Agora:
       *   Math.abs(y - lastY) <= PDF_LAYOUT.yTolerance
       *
       * Isso permite pequenas diferenças causadas pelo modo como
       * o PDF armazena as coordenadas dos textos.
       */
      if (
        lastY === null ||
        Math.abs(y - lastY) <= PDF_LAYOUT.yTolerance
      ) {
        // Se estamos começando uma nova linha, guardamos a coordenada X
        // do primeiro elemento dessa linha.
        if (buf === "") {
          firstX = item.transform[4];
        }

        // Adiciona o texto atual ao conteúdo da linha.
        buf += item.str;
      } else {
        /**
         * A coordenada Y mudou além da tolerância.
         *
         * Portanto, terminamos a linha anterior antes de começar
         * uma nova linha.
         */
        flush();

        // Começa uma nova linha com o elemento atual.
        buf = item.str;

        // O X do primeiro elemento dessa nova linha será a referência.
        firstX = item.transform[4];
      }

      // Atualiza a última coordenada Y conhecida.
      lastY = y;
    }

    /**
     * IMPORTANTE:
     *
     * Precisamos executar o flush() depois que o loop termina.
     *
     * Durante o loop, flush() só é chamado quando encontramos
     * uma nova linha.
     *
     * Portanto, a última linha da página ainda estará em "buf"
     * quando o loop terminar.
     *
     * Sem este flush(), a última questão/alternativa de cada página
     * poderia não ser processada.
     */
    flush();
  }

  // Importa a implementação do pdf-parse.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;

  // Executa a leitura do PDF utilizando nosso pagerender personalizado.
  //
  // O pagerender será chamado uma vez para cada página.
  await pdfParse(buffer, {
    pagerender,

    // max: 0 significa processar todas as páginas.
    max: 0,
  });

  // Retorna todas as posições encontradas no PDF.
  return positions;
}
