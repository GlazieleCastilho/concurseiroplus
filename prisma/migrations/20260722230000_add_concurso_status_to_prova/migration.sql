-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ConcursoStatus" AS ENUM ('PREVISTO', 'ABERTO', 'EM_ANDAMENTO', 'FECHADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "provas" ADD COLUMN IF NOT EXISTS "status" "ConcursoStatus" NOT NULL DEFAULT 'PREVISTO';
