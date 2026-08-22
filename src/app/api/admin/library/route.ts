import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { libraryDocumentSchema } from "@/schemas/app-schemas";
import { createLibraryDocument, listLibraryDocuments } from "@/repositories/library-repository";

export async function GET() {
  try {
    await requireRole(["admin", "super_admin"]);
    const documents = await listLibraryDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar documentos");
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = libraryDocumentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const document = await createLibraryDocument(parsed.data);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar documento");
  }
}
