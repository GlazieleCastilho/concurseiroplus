import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { Pool } from "pg";

const missingDatabaseUrlMessage = "DATABASE_URL is not set";

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(missingDatabaseUrlMessage);
  }

  const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const missingDatabaseUrlPrisma = new Proxy({} as PrismaClient, {
  get() {
    throw new Error(missingDatabaseUrlMessage);
  },
});

const prisma = process.env.DATABASE_URL
  ? globalForPrisma.prismaGlobal ?? prismaClientSingleton()
  : missingDatabaseUrlPrisma;

export { prisma };

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prismaGlobal = prisma;
}
