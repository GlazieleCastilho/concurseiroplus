import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { textoApoioSchema } from "@/schemas/app-schemas";
import { createTextoApoio } from "@/repositories/questions-repository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const body = textoApoioSchema.parse(await req.json());
    const textoApoio = await createTextoApoio(id, body);
    return NextResponse.json({ textoApoio }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar texto de apoio" }, { status: 400 });
  }
}
