import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { markConversationRead } from "@/repositories/social-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { conversationId } = await params;
    await markConversationRead(conversationId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao marcar conversa como lida");
  }
}
