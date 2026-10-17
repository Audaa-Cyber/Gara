import { NextResponse } from "next/server";
import { pool } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await pool.query("select 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    // Deliberately avoid returning connection details to unauthenticated callers.
    return NextResponse.json(
      { status: "error", database: "unavailable" },
      { status: 503 },
    );
  }
}
