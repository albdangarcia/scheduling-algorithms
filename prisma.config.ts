import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

// Prisma runs outside Next.js; use the same env files and precedence as the app.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use process.env for optional vars, env() only for the final required one
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.POSTGRES_URL ??
      env("DATABASE_URL"),
  },
});
