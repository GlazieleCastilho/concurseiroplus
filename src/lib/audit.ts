import { headers } from "next/headers";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function auditLog(input: AuditInput): Promise<void> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? undefined;
  const userAgent = headerStore.get("user-agent") ?? undefined;

  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      ipAddress,
      userAgent,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
