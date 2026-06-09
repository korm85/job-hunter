import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (takes priority), then .env
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
