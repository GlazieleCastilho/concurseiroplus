import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/schemas/app-schemas";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const body = postSchema.parse(await req.json());
    const post = await prisma.post.create({ data: { ...body, userId: user.id } });
    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao publicar" }, { status: 500 });
  }
}
