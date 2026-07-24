import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { courseLessonSchema } from "@/schemas/app-schemas";
import { createLesson } from "@/repositories/course-repository";

const createLessonSchema = courseLessonSchema.extend({ moduleId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = createLessonSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const { moduleId, ...data } = parsed.data;
    const lesson = await createLesson(moduleId, data);
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar aula");
  }
}
