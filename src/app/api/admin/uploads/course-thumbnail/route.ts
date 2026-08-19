import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { uploadCourseThumbnail } from "@/lib/supabase-storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo de imagem" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Imagem maior que 5MB" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json({ error: "Formato invalido (use JPEG, PNG ou WEBP)" }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadCourseThumbnail(bytes, file.name, file.type as (typeof ALLOWED_TYPES)[number]);
    return NextResponse.json({ url });
  } catch (error) {
    return toErrorResponse(error, "Erro ao subir capa");
  }
}
