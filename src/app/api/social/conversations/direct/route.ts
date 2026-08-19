import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { getOrCreateDirectConversation } from "@/repositories/social-repository";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const body = (await req.json()) as { targetUserId?: string };
    if (!body.targetUserId) {
      return NextResponse.json({ error: "targetUserId e obrigatorio" }, { status: 400 });
    }
    if (body.targetUserId === user.id) {
      return NextResponse.json({ error: "Nao e possivel iniciar uma conversa consigo mesmo" }, { status: 400 });
    }
    const conversation = await getOrCreateDirectConversation(user.id, body.targetUserId);
    return NextResponse.json({ conversation });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao iniciar conversa");
  }
}
