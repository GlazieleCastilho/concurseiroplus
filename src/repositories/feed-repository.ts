import { prisma } from "@/lib/prisma";
import type { Comment } from "@/generated/prisma";

const authorSelect = { id: true, firstName: true, lastName: true, imageUrl: true } as const;

export type CommentNode = Comment & {
  user: { id: string; firstName: string; lastName: string | null; imageUrl: string | null };
  isLiked: boolean;
  likeCount: number;
  replies: CommentNode[];
};

export async function listFeedForUser(userId: string, opts?: { take?: number; cursor?: string }) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 30,
    ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true, comments: { where: { hidden: false } } } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  return posts.map(({ _count, likes, ...post }) => ({
    ...post,
    likeCount: _count.likes,
    commentCount: _count.comments,
    isLiked: likes.length > 0,
  }));
}

export async function createPost(userId: string, input: { content: string; tags: string[] }) {
  const post = await prisma.post.create({
    data: { userId, content: input.content, tags: input.tags },
    include: { user: { select: authorSelect } },
  });
  return { ...post, likeCount: 0, commentCount: 0, isLiked: false };
}

export async function deletePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, status: true } });
  if (!post || post.status === "DELETED") throw new Error("Post nao encontrado");
  if (post.userId !== userId) throw new Response("Voce so pode excluir suas proprias postagens", { status: 403 });
  await prisma.post.update({ where: { id: postId }, data: { status: "DELETED" } });
}

export async function togglePostLike(postId: string, userId: string) {
  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }
  const likeCount = await prisma.like.count({ where: { postId } });
  return { liked: !existing, likeCount };
}

export async function toggleCommentLike(commentId: string, userId: string) {
  const existing = await prisma.like.findUnique({ where: { userId_commentId: { userId, commentId } } });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, commentId } });
  }
  const likeCount = await prisma.like.count({ where: { commentId } });
  return { liked: !existing, likeCount };
}

export async function listCommentsForPost(postId: string, userId: string): Promise<CommentNode[]> {
  const rows = await prisma.comment.findMany({
    where: { postId, hidden: false },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  const mapped: CommentNode[] = rows.map(({ _count, likes, ...row }) => ({
    ...row,
    likeCount: _count.likes,
    isLiked: likes.length > 0,
    replies: [],
  }));

  const byId = new Map(mapped.map((c) => [c.id, c]));
  const roots: CommentNode[] = [];
  for (const comment of mapped) {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export async function createComment(
  postId: string,
  userId: string,
  input: { content: string; parentId?: string },
): Promise<CommentNode> {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { status: true } });
  if (!post || post.status === "DELETED") throw new Error("Post nao encontrado");

  if (input.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: input.parentId }, select: { postId: true, hidden: true } });
    if (!parent || parent.postId !== postId || parent.hidden) throw new Error("Comentario pai invalido");
  }

  const comment = await prisma.comment.create({
    data: { postId, userId, content: input.content, parentId: input.parentId },
    include: { user: { select: authorSelect } },
  });
  return { ...comment, likeCount: 0, isLiked: false, replies: [] };
}

export async function hideOwnComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true, hidden: true } });
  if (!comment || comment.hidden) throw new Error("Comentario nao encontrado");
  if (comment.userId !== userId) throw new Response("Voce so pode excluir seus proprios comentarios", { status: 403 });
  await prisma.comment.update({ where: { id: commentId }, data: { hidden: true } });
}
