import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/db/schema";

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabase() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  if (!cachedDb) {
    const client = postgres(databaseUrl, { prepare: false });
    cachedDb = drizzle(client, { schema });
  }

  return cachedDb;
}
