import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type { LessonComment } from "@/generated/prisma";

const authorSelect = { id: true, firstName: true, lastName: true, imageUrl: true } as const;

export type LessonCommentNode = LessonComment & {
  user: { id: string; firstName: string; lastName: string | null; imageUrl: string | null };
  isLiked: boolean;
  likeCount: number;
  replies: LessonCommentNode[];
};

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listCommentsForLesson(lessonId: string, userId: string): Promise<LessonCommentNode[]> {
  const rows = await prisma.lessonComment.findMany({
    where: { lessonId, hidden: false },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  const mapped: LessonCommentNode[] = rows.map(({ _count, likes, ...row }) => ({
    ...row,
    likeCount: _count.likes,
    isLiked: likes.length > 0,
    replies: [],
  }));

  const byId = new Map(mapped.map((c) => [c.id, c]));
  const roots: LessonCommentNode[] = [];
  for (const comment of mapped) {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export async function createLessonComment(
  lessonId: string,
  userId: string,
  input: { content: string; parentId?: string },
): Promise<LessonCommentNode> {
  const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) throw new Error("Aula nao encontrada");

  if (input.parentId) {
    const parent = await prisma.lessonComment.findUnique({ where: { id: input.parentId }, select: { lessonId: true, hidden: true } });
    if (!parent || parent.lessonId !== lessonId || parent.hidden) throw new Error("Comentario pai invalido");
  }

  const comment = await prisma.lessonComment.create({
    data: { lessonId, userId, content: input.content, parentId: input.parentId },
    include: { user: { select: authorSelect } },
  });
  return { ...comment, likeCount: 0, isLiked: false, replies: [] };
}

export async function toggleLessonCommentLike(commentId: string, userId: string) {
  const existing = await prisma.lessonCommentLike.findUnique({ where: { userId_lessonCommentId: { userId, lessonCommentId: commentId } } });
  let liked = !existing;
  if (existing) {
    await prisma.lessonCommentLike.delete({ where: { id: existing.id } }).catch(() => {
      // outra requisicao concorrente ja removeu - estado final e "nao curtido" de qualquer forma
    });
  } else {
    // dois cliques rapidos podem chegar aqui ao mesmo tempo, ambos vendo "nao existe" -
    // a segunda create bate na constraint @@unique([userId, lessonCommentId]); trata como sucesso.
    try {
      await prisma.lessonCommentLike.create({ data: { userId, lessonCommentId: commentId } });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      liked = true;
    }
  }
  const likeCount = await prisma.lessonCommentLike.count({ where: { lessonCommentId: commentId } });
  return { liked, likeCount };
}

export async function hideOwnLessonComment(commentId: string, userId: string) {
  const comment = await prisma.lessonComment.findUnique({ where: { id: commentId }, select: { userId: true, hidden: true } });
  if (!comment || comment.hidden) throw new Error("Comentario nao encontrado");
  if (comment.userId !== userId) throw new Response("Voce so pode excluir seus proprios comentarios", { status: 403 });
  await prisma.lessonComment.update({ where: { id: commentId }, data: { hidden: true } });
}
