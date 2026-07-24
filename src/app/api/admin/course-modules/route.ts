import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { courseModuleSchema } from "@/schemas/app-schemas";
import { createModule } from "@/repositories/course-repository";

const createModuleSchema = courseModuleSchema.extend({ courseId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = createModuleSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const { courseId, ...data } = parsed.data;
    const module_ = await createModule(courseId, data);
    return NextResponse.json({ module: module_ }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar modulo");
  }
}
