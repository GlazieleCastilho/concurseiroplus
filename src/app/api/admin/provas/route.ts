import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { provaSchema } from "@/schemas/app-schemas";
import { createProva, listProvas } from "@/repositories/questions-repository";

export async function GET() {
  try {
    await requireRole(["admin", "super_admin"]);
    const provas = await listProvas();
    return NextResponse.json({ provas });
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar provas");
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = provaSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const prova = await createProva(parsed.data);
    return NextResponse.json({ prova }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar prova");
  }
}
