import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { joinGroup } from "@/repositories/social-repository";

export async function POST(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const user = await getCurrentDbUser();
    const { groupId } = await params;
    await joinGroup(groupId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao entrar no grupo");
  }
}
