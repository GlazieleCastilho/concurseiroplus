import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { deletePost } from "@/repositories/feed-repository";

export async function DELETE(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { postId } = await params;
    await deletePost(postId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao excluir postagem");
  }
}
