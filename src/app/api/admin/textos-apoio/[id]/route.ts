import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { textoApoioSchema } from "@/schemas/app-schemas";
import { deleteTextoApoio, updateTextoApoio } from "@/repositories/questions-repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const body = textoApoioSchema.omit({ chave: true }).parse(await req.json());
    const textoApoio = await updateTextoApoio(id, body);
    return NextResponse.json({ textoApoio });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao editar texto de apoio" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    await deleteTextoApoio(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao excluir texto de apoio" }, { status: 400 });
  }
}
