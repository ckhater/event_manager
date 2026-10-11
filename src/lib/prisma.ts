import { PrismaClient } from "@prisma/client";

// Singleton Prisma : en dev (HMR), on réutilise la connexion via globalThis
// pour ne pas épuiser le pool. En prod (Vercel), une instance suffit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
