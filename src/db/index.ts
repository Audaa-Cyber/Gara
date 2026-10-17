import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Avoid connecting during static builds. A local fallback is only a construction
// value; database requests still require DATABASE_URL to point at a real database.
const client = postgres(
  databaseUrl ?? "postgres://postgres:postgres@127.0.0.1:5432/gara",
  { prepare: false, max: 5 },
);

export const db = drizzle(client, { schema });
export type Database = typeof db;