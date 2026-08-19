import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { hideOwnComment } from "@/repositories/feed-repository";

export async function DELETE(_req: Request, { params }: { params: Promise<{ postId: string; commentId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { commentId } = await params;
    await hideOwnComment(commentId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao excluir comentario");
  }
}
