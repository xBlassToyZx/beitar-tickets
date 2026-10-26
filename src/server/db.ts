import "server-only";
import { createPrismaClient, type Db } from "./prisma";

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: Db };

export const db: Db =
  globalForPrisma.prisma ?? createPrismaClient(process.env.DATABASE_URL ?? "file:./prisma/dev.db");

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
