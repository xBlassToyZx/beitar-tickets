import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Falls back to the default local file so `npm install` works before .env exists.
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
