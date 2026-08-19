import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { hideOwnLessonComment } from "@/repositories/lesson-comments-repository";

export async function DELETE(_req: Request, { params }: { params: Promise<{ lessonId: string; commentId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { commentId } = await params;
    await hideOwnLessonComment(commentId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir comentario");
  }
}
