import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { plannerTaskSchema } from "@/schemas/app-schemas";

export async function POST(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const parsed = plannerTaskSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    }
    const task = await prisma.plannerTask.create({ data: { ...parsed.data, userId: user.id } });
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro no planner" }, { status: 500 });
  }
}
