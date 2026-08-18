import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mupdf (usado em src/lib/pdf-figure-extractor.ts) e um pacote WASM com top-level
  // await no seu entrypoint ESM - deixar o webpack tentar empacotar/transformar isso
  // quebra a etapa de "Collecting page data" do build ("TypeError: a is not a
  // function", minificado, sem stack util). serverExternalPackages faz o Next tratar
  // o pacote como externo e deixar o Node carregar via import/require nativo em vez
  // de passar pelo bundler - mesma categoria de problema (WASM/ESM/top-level await)
  // que ja quebra com esbuild fora do Next (ver comentario no proprio modulo).
  serverExternalPackages: ["mupdf"],
  turbopack: {
    rules: {
      "*.svg": {
         loaders: ["@svgr/webpack"],
         as: "*.js",
      },
    },
  },
  webpack(config){
    config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
    });

    return config;

  },
};

export default nextConfig;
