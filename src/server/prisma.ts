import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

export type Db = PrismaClient;

/** Creates a Prisma client backed by SQLite. Used by the app, the seed script and tests. */
export function createPrismaClient(url: string): Db {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

/** Prisma's error code for a unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
