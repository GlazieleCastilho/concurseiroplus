import { auth, currentUser } from "@clerk/nextjs/server";
import type { PlanTier, Role, User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type AppRole = Role;

export async function checkRole(role: AppRole): Promise<boolean> {
  const { sessionClaims } = await auth();
  const currentRole = sessionClaims?.metadata?.role;
  if (currentRole === "super_admin") return true;
  return currentRole === role;
}

export const CheckRole = checkRole;

export async function requireAuth() {
  const authResult = await auth();
  if (!authResult.userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return authResult;
}

export async function getCurrentDbUser(): Promise<User> {
  const { userId } = await requireAuth();
  const dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (dbUser) return dbUser;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Response("Unauthorized", { status: 401 });
  const email = clerkUser.emailAddresses.find((emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) throw new Response("User email missing", { status: 422 });

  return prisma.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email,
      firstName: clerkUser.firstName ?? email.split("@")[0],
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: (clerkUser.publicMetadata.role as Role | undefined) ?? "user",
    },
  });
}

export async function requireRole(roles: AppRole[]): Promise<User> {
  const user = await getCurrentDbUser();
  if (user.role === "super_admin") return user;
  if (!roles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export function hasPlanAccess(userTier: PlanTier, requiredTier: PlanTier): boolean {
  const order: PlanTier[] = ["ESSENCIAL", "PRO", "ELITE"];
  return order.indexOf(userTier) >= order.indexOf(requiredTier);
}
