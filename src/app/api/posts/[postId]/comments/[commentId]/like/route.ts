import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { toggleCommentLike } from "@/repositories/feed-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ postId: string; commentId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { commentId } = await params;
    const result = await toggleCommentLike(commentId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return await toErrorResponse(error, "Erro ao curtir comentario");
  }
}
