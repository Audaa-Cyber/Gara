"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { focusSessions } from "@/db/schema";
import { auth } from "@/lib/auth";

const focusSessionSchema = z.object({
  mode: z.enum(["focus", "break"]),
  plannedSeconds: z.number().int().min(60).max(7200),
  actualSeconds: z.number().int().min(1).max(7200),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
}).refine((session) => session.actualSeconds <= session.plannedSeconds, {
  message: "Actual focus time cannot exceed the planned duration.",
});

export async function saveCompletedFocusSessionAction(input: {
  mode: "focus" | "break";
  plannedSeconds: number;
  actualSeconds: number;
  startedAt: string;
  endedAt: string;
}) {
  const parsed = focusSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "That focus session could not be validated." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false as const, error: "Your session has expired. Sign in again to save your focus history." };
  }

  if (parsed.data.mode !== "focus") {
    return { ok: true as const };
  }

  const startedAt = new Date(parsed.data.startedAt);
  const endedAt = new Date(parsed.data.endedAt);
  if (endedAt.getTime() < startedAt.getTime()) {
    return { ok: false as const, error: "The session end time cannot be before its start time." };
  }

  await db.insert(focusSessions).values({
    id: randomUUID(),
    userId: session.user.id,
    mode: parsed.data.mode,
    status: "completed",
    plannedSeconds: parsed.data.plannedSeconds,
    actualSeconds: parsed.data.actualSeconds,
    startedAt,
    endedAt,
  });

  return { ok: true as const };
}