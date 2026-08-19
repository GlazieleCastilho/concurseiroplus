import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { reorderSchema } from "@/schemas/app-schemas";
import { reorderLessons } from "@/repositories/course-repository";

const reorderLessonsSchema = reorderSchema.extend({ moduleId: z.string().min(1) });

export async function PATCH(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = reorderLessonsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }
    await reorderLessons(parsed.data.moduleId, parsed.data.orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao reordenar aulas");
  }
}
