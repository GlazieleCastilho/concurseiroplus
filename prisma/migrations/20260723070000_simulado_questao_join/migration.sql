-- CreateTable
CREATE TABLE IF NOT EXISTS "simulado_questoes" (
    "id" TEXT NOT NULL,
    "simuladoId" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "simulado_questoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "simulado_questoes_simuladoId_questaoId_key" ON "simulado_questoes"("simuladoId", "questaoId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "simulado_questoes_simuladoId_ordem_key" ON "simulado_questoes"("simuladoId", "ordem");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "simulado_questoes" ADD CONSTRAINT "simulado_questoes_simuladoId_fkey" FOREIGN KEY ("simuladoId") REFERENCES "simulados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "simulado_questoes" ADD CONSTRAINT "simulado_questoes_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Backfill: simulados ja existentes (todos criados a partir de uma unica
-- prova) recebem a lista explicita de questoes da prova deles, na ordem
-- do numero da questao, para que o runner passe a ler sempre daqui.
INSERT INTO "simulado_questoes" ("id", "simuladoId", "questaoId", "ordem")
SELECT
  md5(random()::text || clock_timestamp()::text || q."id"),
  s."id",
  q."id",
  ROW_NUMBER() OVER (PARTITION BY s."id" ORDER BY q."numero")
FROM "simulados" s
JOIN "questoes" q ON q."provaId" = s."provaId"
WHERE s."provaId" IS NOT NULL
ON CONFLICT ("simuladoId", "questaoId") DO NOTHING;
