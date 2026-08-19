import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { reorderSchema } from "@/schemas/app-schemas";
import { reorderModules } from "@/repositories/course-repository";

const reorderModulesSchema = reorderSchema.extend({ courseId: z.string().min(1) });

export async function PATCH(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = reorderModulesSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }
    await reorderModules(parsed.data.courseId, parsed.data.orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Erro ao reordenar modulos");
  }
}
