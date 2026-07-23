import { NextResponse } from "next/server";
import { getCurrentDbUser, hasPlanAccess } from "@/lib/clerk";
import { getLessonWithModuleAndCourse, markLessonComplete, unmarkLessonComplete } from "@/repositories/course-repository";

async function assertAccess(courseId: string, lessonId: string, userId: string, userTier: import("@/generated/prisma").PlanTier) {
  const lesson = await getLessonWithModuleAndCourse(lessonId);
  if (!lesson || lesson.module.courseId !== courseId || lesson.module.course.status !== "PUBLISHED") {
    return { error: NextResponse.json({ error: "Aula nao encontrada" }, { status: 404 }) };
  }
  if (!hasPlanAccess(userTier, lesson.module.course.requiredTier)) {
    return { error: NextResponse.json({ error: "Seu plano nao da acesso a este curso" }, { status: 403 }) };
  }
  return { lesson };
}

export async function POST(_req: Request, { params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  try {
    const { courseId, lessonId } = await params;
    const user = await getCurrentDbUser();
    const access = await assertAccess(courseId, lessonId, user.id, user.planTier);
    if (access.error) return access.error;
    const progress = await markLessonComplete(user.id, lessonId);
    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao marcar aula" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  try {
    const { courseId, lessonId } = await params;
    const user = await getCurrentDbUser();
    const access = await assertAccess(courseId, lessonId, user.id, user.planTier);
    if (access.error) return access.error;
    await unmarkLessonComplete(user.id, lessonId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao desmarcar aula" }, { status: 500 });
  }
}
