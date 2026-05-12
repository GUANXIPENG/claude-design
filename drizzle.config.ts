import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL ?? ""
  },
  out: "./drizzle",
  schema: "./src/server/db/schema.ts"
});
