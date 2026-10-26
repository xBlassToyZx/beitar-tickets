/** Deletes the local SQLite database file so `npm run db:reset` can rebuild it from scratch. */
import "dotenv/config";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
if (!url.startsWith("file:")) {
  console.error("db:reset only works with a local SQLite file database.");
  process.exit(1);
}
const file = resolve(url.slice("file:".length));
for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  if (existsSync(file + suffix)) rmSync(file + suffix);
}
console.log(`Removed ${file}`);
