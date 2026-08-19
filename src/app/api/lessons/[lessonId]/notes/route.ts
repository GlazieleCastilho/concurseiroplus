import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { lessonNoteSchema } from "@/schemas/app-schemas";
import { getLessonNote, upsertLessonNote } from "@/repositories/lesson-notes-repository";

export async function GET(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { lessonId } = await params;
    const note = await getLessonNote(user.id, lessonId);
    return NextResponse.json({ note });
  } catch (error) {
    return toErrorResponse(error, "Erro ao carregar anotacao");
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { lessonId } = await params;
    const parsed = lessonNoteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const note = await upsertLessonNote(user.id, lessonId, parsed.data.content);
    return NextResponse.json({ note });
  } catch (error) {
    return toErrorResponse(error, "Erro ao salvar anotacao");
  }
}
