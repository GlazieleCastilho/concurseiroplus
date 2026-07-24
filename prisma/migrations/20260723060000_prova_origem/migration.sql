-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ProvaOrigem" AS ENUM ('QUESTOES', 'CONCURSO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "provas" ADD COLUMN IF NOT EXISTS "origem" "ProvaOrigem" NOT NULL DEFAULT 'QUESTOES';

-- Backfill: provas ja cadastradas com campos especificos de edital (vagas,
-- link do edital ou periodo de inscricao) foram quase certamente criadas
-- pelo fluxo de Gerenciar Concursos, nao pelo de Gerenciar Questoes.
UPDATE "provas"
SET "origem" = 'CONCURSO'
WHERE "vagas" IS NOT NULL
   OR "editalUrl" IS NOT NULL
   OR "inscricaoInicio" IS NOT NULL
   OR "inscricaoFim" IS NOT NULL;
