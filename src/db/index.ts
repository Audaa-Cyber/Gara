import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // Reuse the connection pool across Next.js dev hot reloads.
  // eslint-disable-next-line no-var
  var garaDbPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Copy .env.example to .env.local and configure your Supabase connection URL.",
  );
}

const createPool = () =>
  new Pool({
    connectionString,
    // Serverless instances should not each open a large client-side pool.
    max: process.env.NODE_ENV === "production" ? 1 : 5,
    // Require TLS for Supabase. Disable only for a local PostgreSQL instance.
    ssl: process.env.DATABASE_SSL === "false" ? false : true,
    application_name: "gara",
  });

const pool = globalThis.garaDbPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis.garaDbPool = pool;
}

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL pool error:", error);
});

export const db = drizzle(pool, { schema });
export { pool };
export type Database = typeof db;
