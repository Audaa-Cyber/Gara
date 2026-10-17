"use server";

import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { focusSessions } from "@/db/schema";
import { auth } from "@/lib/auth";

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

const startSchema = z.object({ plannedSeconds: z.number().int().min(60).max(7200) });
const sessionIdSchema = z.string().uuid();
const pauseSchema = z.object({
  id: sessionIdSchema,
  remainingSeconds: z.number().int().min(1).max(7200),
});
const cancelSchema = z.object({
  id: sessionIdSchema,
  remainingSeconds: z.number().int().min(0).max(7200),
});

export async function startFocusTimerAction(input: { plannedSeconds: number }) {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Choose a valid focus duration." };
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "Your session has expired. Please sign in again." };

  const [existing] = await db.select().from(focusSessions)
    .where(and(
      eq(focusSessions.userId, userId),
      or(eq(focusSessions.status, "in_progress"), eq(focusSessions.status, "paused")),
    ))
    .orderBy(desc(focusSessions.createdAt))
    .limit(1);

  if (existing) {
    return {
      ok: true as const,
      session: {
        id: existing.id,
        status: existing.status,
        startedAt: existing.startedAt.toISOString(),
        plannedSeconds: existing.plannedSeconds,
        remainingSeconds: existing.remainingSeconds ?? existing.plannedSeconds,
        endsAt: existing.endsAt?.toISOString() ?? null,
      },
    };
  }

  const now = new Date();
  const [created] = await db.insert(focusSessions).values({
    id: randomUUID(),
    userId,
    mode: "focus",
    status: "in_progress",
    plannedSeconds: parsed.data.plannedSeconds,
    actualSeconds: 0,
    startedAt: now,
    endsAt: new Date(now.getTime() + parsed.data.plannedSeconds * 1000),
    remainingSeconds: parsed.data.plannedSeconds,
  }).returning();

  revalidatePath("/");
  return {
    ok: true as const,
    session: {
      id: created.id,
      status: created.status,
      startedAt: created.startedAt.toISOString(),
      plannedSeconds: created.plannedSeconds,
      remainingSeconds: created.remainingSeconds ?? created.plannedSeconds,
      endsAt: created.endsAt?.toISOString() ?? null,
    },
  };
}

export async function pauseFocusTimerAction(input: { id: string; remainingSeconds: number }) {
  const parsed = pauseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "That timer state is not valid." };
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "Your session has expired. Please sign in again." };

  const [current] = await db.select().from(focusSessions)
    .where(and(eq(focusSessions.id, parsed.data.id), eq(focusSessions.userId, userId), eq(focusSessions.status, "in_progress")))
    .limit(1);
  if (!current) return { ok: false as const, error: "That focus session is no longer active." };

  const remainingSeconds = Math.min(current.plannedSeconds, parsed.data.remainingSeconds);
  await db.update(focusSessions).set({
    status: "paused",
    actualSeconds: current.plannedSeconds - remainingSeconds,
    remainingSeconds,
    pausedAt: new Date(),
    endsAt: null,
  }).where(and(eq(focusSessions.id, current.id), eq(focusSessions.userId, userId)));
  revalidatePath("/");
  return { ok: true as const, remainingSeconds };
}

export async function resumeFocusTimerAction(input: { id: string }) {
  const parsedId = sessionIdSchema.safeParse(input.id);
  if (!parsedId.success) return { ok: false as const, error: "That focus session is not valid." };
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "Your session has expired. Please sign in again." };

  const [current] = await db.select().from(focusSessions)
    .where(and(eq(focusSessions.id, parsedId.data), eq(focusSessions.userId, userId), eq(focusSessions.status, "paused")))
    .limit(1);
  if (!current) return { ok: false as const, error: "That paused session could not be found." };

  const remainingSeconds = current.remainingSeconds ?? Math.max(1, current.plannedSeconds - current.actualSeconds);
  const now = new Date();
  const [updated] = await db.update(focusSessions).set({
    status: "in_progress",
    remainingSeconds,
    pausedAt: null,
    endsAt: new Date(now.getTime() + remainingSeconds * 1000),
  }).where(and(eq(focusSessions.id, current.id), eq(focusSessions.userId, userId), eq(focusSessions.status, "paused"))).returning();

  revalidatePath("/");
  return { ok: true as const, endsAt: updated.endsAt?.toISOString() ?? null, remainingSeconds };
}

export async function completeFocusTimerAction(input: { id: string }) {
  const parsedId = sessionIdSchema.safeParse(input.id);
  if (!parsedId.success) return { ok: false as const, error: "That focus session is not valid." };
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "Your session has expired. Please sign in again." };

  const [current] = await db.select().from(focusSessions)
    .where(and(eq(focusSessions.id, parsedId.data), eq(focusSessions.userId, userId), eq(focusSessions.status, "in_progress")))
    .limit(1);
  if (!current) return { ok: false as const, error: "That focus session is no longer active." };
  if (current.endsAt && current.endsAt.getTime() > Date.now() + 2000) {
    return { ok: false as const, error: "This focus timer has not finished yet." };
  }

  await db.update(focusSessions).set({
    status: "completed",
    actualSeconds: current.plannedSeconds,
    remainingSeconds: 0,
    endedAt: new Date(),
    endsAt: null,
    pausedAt: null,
  }).where(and(eq(focusSessions.id, current.id), eq(focusSessions.userId, userId), eq(focusSessions.status, "in_progress")));
  revalidatePath("/");
  return { ok: true as const };
}

export async function cancelFocusTimerAction(input: { id: string; remainingSeconds: number }) {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "That timer state is not valid." };
  const userId = await currentUserId();
  if (!userId) return { ok: false as const, error: "Your session has expired. Please sign in again." };

  const [current] = await db.select().from(focusSessions)
    .where(and(
      eq(focusSessions.id, parsed.data.id),
      eq(focusSessions.userId, userId),
      or(eq(focusSessions.status, "in_progress"), eq(focusSessions.status, "paused")),
    ))
    .limit(1);
  if (!current) return { ok: true as const };

  const remaining = current.status === "paused"
    ? current.remainingSeconds ?? current.plannedSeconds
    : Math.min(current.plannedSeconds, parsed.data.remainingSeconds);
  await db.update(focusSessions).set({
    status: "cancelled",
    actualSeconds: Math.max(0, current.plannedSeconds - remaining),
    remainingSeconds: remaining,
    endedAt: new Date(),
    endsAt: null,
    pausedAt: null,
  }).where(and(eq(focusSessions.id, current.id), eq(focusSessions.userId, userId)));
  revalidatePath("/");
  return { ok: true as const };
}
