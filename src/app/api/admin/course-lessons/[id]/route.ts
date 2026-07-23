import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { courseLessonSchema } from "@/schemas/app-schemas";
import { deleteLesson, updateLesson } from "@/repositories/course-repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    const parsed = courseLessonSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const lesson = await updateLesson(id, parsed.data);
    return NextResponse.json({ lesson });
  } catch (error) {
    return toErrorResponse(error, "Erro ao editar aula");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "super_admin"]);
    const { id } = await params;
    await deleteLesson(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir aula");
  }
}
