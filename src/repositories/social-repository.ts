import { prisma } from "@/lib/prisma";

export type GroupInput = {
  name: string;
  slug: string;
  discipline: string;
  description?: string;
  imageUrl?: string;
  createdById: string;
};

function sortUserPair(userAId: string, userBId: string): [string, string] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

export async function listGroupsForUser(userId: string, opts?: { discipline?: string; search?: string }) {
  const groups = await prisma.group.findMany({
    where: {
      discipline: opts?.discipline || undefined,
      name: opts?.search ? { contains: opts.search, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      conversation: { select: { id: true, participants: { where: { userId }, select: { id: true } } } },
    },
  });
  const memberCounts = await prisma.conversationParticipant.groupBy({
    by: ["conversationId"],
    where: { conversation: { groupId: { in: groups.map((group) => group.id) } } },
    _count: { _all: true },
  });
  const countByConversationId = new Map(memberCounts.map((row) => [row.conversationId, row._count._all]));

  return groups.map((group) => ({
    ...group,
    memberCount: group.conversation ? (countByConversationId.get(group.conversation.id) ?? 0) : 0,
    isMember: (group.conversation?.participants.length ?? 0) > 0,
  }));
}

export async function createGroup(input: GroupInput) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: input.name,
        slug: input.slug,
        discipline: input.discipline,
        description: input.description,
        imageUrl: input.imageUrl,
        createdById: input.createdById,
      },
    });
    const conversation = await tx.conversation.create({
      data: {
        type: "GROUP",
        groupId: group.id,
        participants: { create: { userId: input.createdById } },
      },
    });
    return { ...group, conversationId: conversation.id };
  });
}

export async function joinGroup(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { conversation: { select: { id: true } } } });
  if (!group?.conversation) throw new Error("Grupo nao encontrado");
  return prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: group.conversation.id, userId } },
    update: {},
    create: { conversationId: group.conversation.id, userId },
  });
}

export async function leaveGroup(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { conversation: { select: { id: true } } } });
  if (!group?.conversation) throw new Error("Grupo nao encontrado");
  await prisma.conversationParticipant.deleteMany({ where: { conversationId: group.conversation.id, userId } });
}

export async function getOrCreateDirectConversation(userAId: string, userBId: string) {
  const [sortedA, sortedB] = sortUserPair(userAId, userBId);
  const existing = await prisma.conversation.findUnique({ where: { userAId_userBId: { userAId: sortedA, userBId: sortedB } } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        type: "DIRECT",
        userAId: sortedA,
        userBId: sortedB,
        participants: { create: [{ userId: sortedA }, { userId: sortedB }] },
      },
    });
    return conversation;
  });
}

export async function listConversationsForUser(userId: string) {
  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          group: { select: { id: true, name: true, imageUrl: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          participants: { include: { user: { select: { id: true, firstName: true, lastName: true, imageUrl: true } } } },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  });

  return Promise.all(
    memberships.map(async (membership) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: membership.conversationId,
          senderId: { not: userId },
          createdAt: { gt: membership.lastReadAt ?? new Date(0) },
        },
      });
      return { ...membership.conversation, unreadCount };
    }),
  );
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return null;

  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      group: { select: { id: true, name: true, imageUrl: true } },
      participants: { include: { user: { select: { id: true, firstName: true, lastName: true, imageUrl: true } } } },
    },
  });
}

export async function markConversationRead(conversationId: string, userId: string) {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function listMessages(conversationId: string, opts?: { cursor?: string; take?: number }) {
  const take = opts?.take ?? 30;
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take,
    ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: { sender: { select: { id: true, firstName: true, lastName: true, imageUrl: true } } },
  });
  return messages.reverse();
}

export async function createMessage(conversationId: string, senderId: string, content: string) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, firstName: true, lastName: true, imageUrl: true } } },
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);
  return message;
}

export async function searchUsers(query: string, excludeUserId: string, take = 10) {
  if (!query.trim()) return [];
  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [{ firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }],
    },
    select: { id: true, firstName: true, lastName: true, imageUrl: true },
    take,
  });
}
