import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

declare global { var garaPgPool: Pool | undefined; }

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Copy .env.example to .env and configure the Supabase pooler URL.");
}

const createPool = () => new Pool({
  connectionString,
  max: 1,
  ssl: process.env.DATABASE_SSL === "false" ? false : true,
  application_name: "gara-web",
});
const pool = globalThis.garaPgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.garaPgPool = pool;

export const db = drizzle(pool, { schema });
export { pool };
