import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { createCourseVideoUploadTarget } from "@/lib/supabase-storage";

const signSchema = z.object({ filename: z.string().min(1).max(200) });

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = signSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Nome de arquivo invalido" }, { status: 400 });
    }
    const target = await createCourseVideoUploadTarget(parsed.data.filename);
    return NextResponse.json(target);
  } catch (error) {
    return toErrorResponse(error, "Erro ao preparar upload do video");
  }
}
