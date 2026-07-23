import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { courseSchema } from "@/schemas/app-schemas";
import { createCourse, listCourses } from "@/repositories/course-repository";

export async function GET() {
  try {
    await requireRole(["admin", "super_admin"]);
    const courses = await listCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar cursos");
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = courseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const course = await createCourse(parsed.data);
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar curso");
  }
}
