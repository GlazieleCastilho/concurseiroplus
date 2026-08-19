import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { toggleLessonCommentLike } from "@/repositories/lesson-comments-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ lessonId: string; commentId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { commentId } = await params;
    const result = await toggleLessonCommentLike(commentId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Erro ao curtir comentario");
  }
}
