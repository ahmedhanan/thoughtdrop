import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db?: NeonHttpDatabase<typeof schema>;
};

export function getDb(): NeonHttpDatabase<typeof schema> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForDb.db) {
    const sql = neon(process.env.DATABASE_URL);
    globalForDb.db = drizzle(sql, { schema });
  }
  return globalForDb.db;
}

export function getDbOrThrow(): NeonHttpDatabase<typeof schema> {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set — the app requires a database.");
  return db;
}
