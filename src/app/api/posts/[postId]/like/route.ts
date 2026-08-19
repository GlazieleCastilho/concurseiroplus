import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { togglePostLike } from "@/repositories/feed-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { postId } = await params;
    const result = await togglePostLike(postId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return await toErrorResponse(error, "Erro ao curtir postagem");
  }
}
