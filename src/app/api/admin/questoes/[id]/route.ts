import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { questaoSchema } from "@/schemas/app-schemas";
import { deleteQuestao, updateQuestao } from "@/repositories/questions-repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const body = questaoSchema.parse(await req.json());
    const questao = await updateQuestao(id, body);
    return NextResponse.json({ questao });
  } catch (error) {
    return toErrorResponse(error, "Erro ao editar questao");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    await deleteQuestao(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir questao");
  }
}
