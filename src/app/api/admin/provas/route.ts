import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { provaSchema } from "@/schemas/app-schemas";
import { createProva, listProvas } from "@/repositories/questions-repository";

export async function GET() {
  try {
    await requireRole(["admin", "super_admin"]);
    const provas = await listProvas();
    return NextResponse.json({ provas });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao listar provas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const body = provaSchema.parse(await req.json());
    const prova = await createProva(body);
    return NextResponse.json({ prova }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar prova" }, { status: 400 });
  }
}
