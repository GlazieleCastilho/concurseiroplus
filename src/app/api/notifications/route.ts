import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ notifications });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Erro ao listar notificacoes" }, { status: 500 });
  }
}
