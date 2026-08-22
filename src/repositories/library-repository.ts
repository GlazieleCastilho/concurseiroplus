import { prisma } from "@/lib/prisma";

export type LibraryDocumentInput = {
  title: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileName: string;
};

export async function listLibraryDocuments(opts?: { category?: string; search?: string }) {
  return prisma.libraryDocument.findMany({
    where: {
      category: opts?.category || undefined,
      title: opts?.search ? { contains: opts.search, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listLibraryCategories(): Promise<string[]> {
  const rows = await prisma.libraryDocument.findMany({ select: { category: true }, distinct: ["category"] });
  return rows.map((row) => row.category).sort();
}

export async function createLibraryDocument(input: LibraryDocumentInput) {
  return prisma.libraryDocument.create({ data: input });
}

export async function updateLibraryDocument(id: string, input: Partial<LibraryDocumentInput>) {
  return prisma.libraryDocument.update({ where: { id }, data: input });
}

export async function deleteLibraryDocument(id: string) {
  return prisma.libraryDocument.delete({ where: { id } });
}
