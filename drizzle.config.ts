import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js loads .env.local; Drizzle Kit does not do so automatically.
config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL. Configure DATABASE_URL in .env.local (or .env) before running Drizzle commands.",
  );
}

const connectionUrl = new URL(databaseUrl);
if (!connectionUrl.searchParams.has("sslmode")) {
  connectionUrl.searchParams.set("sslmode", process.env.DATABASE_SSL === "false" ? "disable" : "require");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: connectionUrl.toString() },
  strict: true,
  verbose: true,
});
