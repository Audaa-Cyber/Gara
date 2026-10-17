import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL. Configure DATABASE_URL and preferably DIRECT_URL in .env before running Drizzle commands.");
}
export default defineConfig({
  schema: "./src/db/schema.ts", out: "./drizzle", dialect: "postgresql",
  dbCredentials: { url: databaseUrl }, strict: true, verbose: true,
});
