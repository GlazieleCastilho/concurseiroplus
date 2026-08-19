import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { leaveGroup } from "@/repositories/social-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { groupId } = await params;
    await leaveGroup(groupId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao sair do grupo");
  }
}
