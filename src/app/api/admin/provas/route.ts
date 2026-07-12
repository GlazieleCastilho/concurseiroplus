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
    const body = provaSchema.parse(await req.json());
    const prova = await createProva(body);
    return NextResponse.json({ prova }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar prova");
  }
}
