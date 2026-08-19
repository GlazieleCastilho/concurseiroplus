import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { commentSchema } from "@/schemas/app-schemas";
import { createComment, listCommentsForPost } from "@/repositories/feed-repository";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { postId } = await params;
    const comments = await listCommentsForPost(postId, user.id);
    return NextResponse.json({ comments });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao listar comentarios");
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { postId } = await params;
    const parsed = commentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const comment = await createComment(postId, user.id, parsed.data);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao comentar");
  }
}
