import Database from "better-sqlite3";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createPrismaClient, type Db } from "@/server/prisma";

const MIGRATIONS_DIR = resolve(__dirname, "../../prisma/migrations");

/** Applies every migration SQL file in order, the same files `prisma migrate deploy` runs. */
export function applyMigrations(file: string): void {
  const sqlite = new Database(file);
  try {
    const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const dir of dirs)
      sqlite.exec(readFileSync(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8"));
  } finally {
    sqlite.close();
  }
}

/** A fresh, migrated SQLite database in a temp folder. Call `cleanup` when done. */
export function createTestDb(): { db: Db; cleanup: () => Promise<void> } {
  const dir = mkdtempSync(join(tmpdir(), "beitar-tickets-"));
  const file = join(dir, "test.db");
  applyMigrations(file);
  const db = createPrismaClient(`file:${file}`);
  return {
    db,
    cleanup: async () => {
      await db.$disconnect();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
