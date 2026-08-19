-- Separa o model hibrido Prova em Prova (banco de questoes) e Concurso (editais).
-- Ordem importante: criar concursos + copiar dados ANTES de apagar/dropar qualquer
-- coisa de provas, e apagar as linhas migradas ANTES de dropar as colunas/enum.

-- CreateTable
CREATE TABLE "concursos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "orgao" TEXT NOT NULL,
    "banca" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "nivel" "ExamLevel"[] DEFAULT ARRAY['SUPERIOR']::"ExamLevel"[],
    "status" "ConcursoStatus" NOT NULL DEFAULT 'PREVISTO',
    "disciplina" TEXT,
    "dataProva" TIMESTAMP(3),
    "inscricaoInicio" TIMESTAMP(3),
    "inscricaoFim" TIMESTAMP(3),
    "vagas" INTEGER,
    "salario" TEXT,
    "editalUrl" TEXT,
    "popularidade" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concursos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "concursos_banca_orgao_cargo_idx" ON "concursos"("banca", "orgao", "cargo");

-- CreateIndex
CREATE INDEX "concursos_dataProva_idx" ON "concursos"("dataProva");

-- CopyData: linhas de "provas" com origem = 'CONCURSO' migram pra "concursos",
-- reaproveitando o mesmo id (facilita auditoria/rollback, sem risco de colisao
-- pois "concursos" e uma tabela nova).
INSERT INTO "concursos" (
    "id", "titulo", "orgao", "banca", "cargo", "ano", "nivel", "status",
    "disciplina", "dataProva", "inscricaoInicio", "inscricaoFim", "vagas",
    "salario", "editalUrl", "popularidade", "createdAt", "updatedAt"
)
SELECT
    "id", "titulo", "orgao", "banca", "cargo", "ano", "nivel", "status",
    "disciplina", "dataProva", "inscricaoInicio", "inscricaoFim", "vagas",
    "salario", "editalUrl", "popularidade", "createdAt", "updatedAt"
FROM "provas"
WHERE "origem" = 'CONCURSO';

-- DeleteMigratedRows: apaga de "provas" so as linhas ja copiadas acima, antes de
-- dropar as colunas que essa condicao depende ("origem").
DELETE FROM "provas" WHERE "origem" = 'CONCURSO';

-- DropIndex
DROP INDEX "provas_dataProva_idx";

-- AlterTable: "provas" fica so com os campos de banco de questoes.
ALTER TABLE "provas" DROP COLUMN "dataProva",
DROP COLUMN "editalUrl",
DROP COLUMN "inscricaoFim",
DROP COLUMN "inscricaoInicio",
DROP COLUMN "origem",
DROP COLUMN "salario",
DROP COLUMN "status",
DROP COLUMN "vagas";

-- DropEnum
DROP TYPE "ProvaOrigem";
