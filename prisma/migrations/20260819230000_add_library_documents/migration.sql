-- Adiciona a Biblioteca: PDFs de material de apoio avulsos, organizados por
-- categoria/disciplina, nao ligados a nenhuma aula especifica.

-- CreateTable
CREATE TABLE "library_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "library_documents_category_idx" ON "library_documents"("category");
