import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { sendMessageSchema } from "@/schemas/app-schemas";
import { createMessage, getConversationForUser, listMessages } from "@/repositories/social-repository";
import { broadcastMessage } from "@/lib/supabase-broadcast";

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { conversationId } = await params;
    const conversation = await getConversationForUser(conversationId, user.id);
    if (!conversation) return NextResponse.json({ error: "Conversa nao encontrada" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const messages = await listMessages(conversationId, {
      cursor: searchParams.get("cursor") ?? undefined,
      take: searchParams.get("take") ? Number(searchParams.get("take")) : undefined,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao listar mensagens");
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { conversationId } = await params;
    const conversation = await getConversationForUser(conversationId, user.id);
    if (!conversation) return NextResponse.json({ error: "Conversa nao encontrada" }, { status: 404 });

    const parsed = sendMessageSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const message = await createMessage(conversationId, user.id, parsed.data.content);
    await broadcastMessage(conversationId, message);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao enviar mensagem");
  }
}
