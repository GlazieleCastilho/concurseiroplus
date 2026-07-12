import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
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
    return toErrorResponse(error, "Erro ao criar questao");
  }
}
