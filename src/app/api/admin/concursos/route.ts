import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { concursoSchema } from "@/schemas/app-schemas";
import { createConcurso, listConcursos } from "@/repositories/concursos-repository";

export async function GET() {
  try {
    await requireRole(["admin", "super_admin"]);
    const concursos = await listConcursos();
    return NextResponse.json({ concursos });
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar concursos");
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const parsed = concursoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const concurso = await createConcurso(parsed.data);
    return NextResponse.json({ concurso }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar concurso");
  }
}
