import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { uploadLibraryDocument } from "@/lib/supabase-storage";

const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo PDF" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "PDF maior que 20MB" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Envie um arquivo no formato PDF" }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadLibraryDocument(bytes, file.name);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Erro ao subir PDF");
  }
}
