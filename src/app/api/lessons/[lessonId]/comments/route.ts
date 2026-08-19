import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { lessonCommentSchema } from "@/schemas/app-schemas";
import { createLessonComment, listCommentsForLesson } from "@/repositories/lesson-comments-repository";

export async function GET(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { lessonId } = await params;
    const comments = await listCommentsForLesson(lessonId, user.id);
    return NextResponse.json({ comments });
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar comentarios");
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { lessonId } = await params;
    const parsed = lessonCommentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const comment = await createLessonComment(lessonId, user.id, parsed.data);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao comentar");
  }
}
