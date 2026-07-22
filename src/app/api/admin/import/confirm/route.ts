import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { bulkImportProvas } from "@/repositories/questions-repository";

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = bulkImportSchema.safeParse(await req.json());
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
      return NextResponse.json({ error: "Rascunho invalido, corrija antes de salvar", errors }, { status: 400 });
    }
    const results = await bulkImportProvas(parsed.data.provas);
    return NextResponse.json({ results });
  } catch (error) {
    return toErrorResponse(error, "Erro ao importar questoes");
  }
}
