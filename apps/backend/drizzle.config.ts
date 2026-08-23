import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: process.env.OKAESHI_ENV_FILE ?? ".dev.vars" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
