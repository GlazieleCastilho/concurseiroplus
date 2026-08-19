import { prisma } from "@/lib/prisma";

export async function getLessonNote(userId: string, lessonId: string) {
  return prisma.lessonNote.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
}

export async function upsertLessonNote(userId: string, lessonId: string, content: string) {
  return prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { content },
    create: { userId, lessonId, content },
  });
}
