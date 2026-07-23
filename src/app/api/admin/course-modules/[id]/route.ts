import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { courseModuleSchema } from "@/schemas/app-schemas";
import { deleteModule, updateModule } from "@/repositories/course-repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const parsed = courseModuleSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const module_ = await updateModule(id, parsed.data);
    return NextResponse.json({ module: module_ });
  } catch (error) {
    return toErrorResponse(error, "Erro ao editar modulo");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    await deleteModule(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir modulo");
  }
}
