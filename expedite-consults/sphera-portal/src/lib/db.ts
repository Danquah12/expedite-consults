import { PrismaClient } from "@/generated/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient for the Sphera app.
 *
 * In development, Next.js hot-reload would create multiple instances
 * without this pattern. We attach the client to globalThis to reuse
 * across hot-reloads, while always creating a fresh client in production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
