import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { bulkImportSchema } from "@/schemas/app-schemas";
import { bulkImportProvas } from "@/repositories/questions-repository";

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const body = bulkImportSchema.parse(await req.json());
    const results = await bulkImportProvas(body.provas);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao importar questoes" }, { status: 400 });
  }
}
