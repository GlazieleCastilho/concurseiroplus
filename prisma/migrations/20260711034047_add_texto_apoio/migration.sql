/*
  Warnings:

  - You are about to drop the `course_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE IF EXISTS "course_tags" DROP CONSTRAINT IF EXISTS "course_tags_courseId_fkey";

-- AlterTable
ALTER TABLE "questoes" ADD COLUMN IF NOT EXISTS "textoApoioId" TEXT;

-- DropTable
DROP TABLE IF EXISTS "course_tags";

-- CreateTable
CREATE TABLE "textos_apoio" (
    "id" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "titulo" TEXT,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "textos_apoio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "textos_apoio_provaId_chave_key" ON "textos_apoio"("provaId", "chave");

-- CreateIndex
CREATE INDEX "questoes_textoApoioId_idx" ON "questoes"("textoApoioId");

-- AddForeignKey
ALTER TABLE "textos_apoio" ADD CONSTRAINT "textos_apoio_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "provas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_textoApoioId_fkey" FOREIGN KEY ("textoApoioId") REFERENCES "textos_apoio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
