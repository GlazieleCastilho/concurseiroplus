import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { groupSchema } from "@/schemas/app-schemas";
import { createGroup, listGroupsForUser } from "@/repositories/social-repository";

export async function GET(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const groups = await listGroupsForUser(user.id, {
      discipline: searchParams.get("discipline") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json({ groups });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao listar grupos");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = groupSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const slugBase = parsed.data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
    const group = await createGroup({ ...parsed.data, slug, createdById: user.id });
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao criar grupo");
  }
}
