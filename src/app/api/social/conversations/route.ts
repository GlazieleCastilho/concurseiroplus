import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { listConversationsForUser } from "@/repositories/social-repository";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    const conversations = await listConversationsForUser(user.id);
    return NextResponse.json({ conversations });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao listar conversas");
  }
}
