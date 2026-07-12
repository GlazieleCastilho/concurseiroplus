import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { getAllowedSkillsByPlan, skills } from "@/lib/product";
import { rateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { skillChatSchema, skillSlugSchema } from "@/schemas/app-schemas";
import { streamSkillAnswer } from "@/services/ai-service";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await params;
    const skillSlug = skillSlugSchema.parse(rawSlug);
    const user = await getCurrentDbUser();
    await rateLimit("skills", `${user.id}:${skillSlug}`);
    if (!getAllowedSkillsByPlan(user.planTier).includes(skillSlug)) {
      return NextResponse.json({ error: "Seu plano nao inclui esta Skill." }, { status: 403 });
    }
    const body = skillChatSchema.parse(await req.json());
    const definition = skills.find((item) => item.slug === skillSlug);
    if (!definition) return NextResponse.json({ error: "Skill nao encontrada" }, { status: 404 });

    const skill = await prisma.skill.upsert({
      where: { slug: skillSlug },
      create: {
        slug: skillSlug,
        name: definition.name,
        discipline: definition.discipline,
        description: definition.description,
        systemPrompt: definition.systemPrompt,
      },
      update: { systemPrompt: definition.systemPrompt, active: true },
    });

    const chat = body.chatId
      ? await prisma.skillChat.findFirst({ where: { id: body.chatId, userId: user.id } })
      : await prisma.skillChat.create({
          data: {
            userId: user.id,
            skillId: skill.id,
            skillSlug,
            title: body.message.slice(0, 80),
            planTier: user.planTier,
            topicsCovered: [],
          },
        });
    if (!chat) return NextResponse.json({ error: "Chat nao encontrado" }, { status: 404 });

    await prisma.skillMessage.create({ data: { chatId: chat.id, role: "user", content: body.message } });

    const encoder = new TextEncoder();
    let fullAnswer = "";
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of streamSkillAnswer({ systemPrompt: definition.systemPrompt, history: body.history, message: body.message })) {
            fullAnswer += token;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }
          await prisma.skillMessage.create({ data: { chatId: chat.id, role: "assistant", content: fullAnswer } });
          await auditLog({ userId: user.id, action: "skill.chat", entity: "SkillChat", entityId: chat.id, metadata: { skillSlug } });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro na Skill" }, { status: 500 });
  }
}
