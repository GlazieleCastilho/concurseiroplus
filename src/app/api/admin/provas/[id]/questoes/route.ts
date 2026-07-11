import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { questaoSchema } from "@/schemas/app-schemas";
import { createQuestao } from "@/repositories/questions-repository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const body = questaoSchema.parse(await req.json());
    const questao = await createQuestao(id, body);
    return NextResponse.json({ questao }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar questao" }, { status: 400 });
  }
}
