import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Prisma runs outside Next.js; use the same env files and precedence as the app.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const databaseUrl = [
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.POSTGRES_URL,
  process.env.DATABASE_URL,
].find(Boolean);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Generation needs no database URL; Prisma requires it for database commands.
  datasource: databaseUrl ? { url: databaseUrl } : undefined,
});
