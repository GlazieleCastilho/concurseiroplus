import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { postSchema } from "@/schemas/app-schemas";
import { createPost, listFeedForUser } from "@/repositories/feed-repository";

export async function GET(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const posts = await listFeedForUser(user.id, {
      cursor: searchParams.get("cursor") ?? undefined,
      take: searchParams.get("take") ? Number(searchParams.get("take")) : undefined,
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao listar feed");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const post = await createPost(user.id, { content: parsed.data.content, tags: parsed.data.tags });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao publicar");
  }
}
