-- AlterTable
ALTER TABLE "questoes" ADD COLUMN IF NOT EXISTS "imagemUrl" TEXT;

-- AlterTable
ALTER TABLE "alternativas" ADD COLUMN IF NOT EXISTS "imagemUrl" TEXT;
