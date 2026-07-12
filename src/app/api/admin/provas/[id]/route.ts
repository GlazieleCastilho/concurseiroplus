import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { provaSchema } from "@/schemas/app-schemas";
import { deleteProva, updateProva } from "@/repositories/questions-repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const body = provaSchema.partial().parse(await req.json());
    const prova = await updateProva(id, body);
    return NextResponse.json({ prova });
  } catch (error) {
    return toErrorResponse(error, "Erro ao editar prova");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    await deleteProva(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir prova");
  }
}
