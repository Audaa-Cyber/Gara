"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/lib/auth";

const taskTitleSchema = z.string().trim().min(1, "Add a task title.").max(200, "Task titles must be 200 characters or fewer.");
const toggleTaskSchema = z.object({
  id: z.string().uuid(),
  done: z.boolean(),
});

async function getCurrentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function createTaskAction(rawTitle: string) {
  const parsedTitle = taskTitleSchema.safeParse(rawTitle);
  if (!parsedTitle.success) {
    return { ok: false as const, error: parsedTitle.error.issues[0]?.message ?? "Invalid task title." };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false as const, error: "Your session has expired. Please sign in again." };
  }

  const id = randomUUID();
  const [task] = await db
    .insert(tasks)
    .values({
      id,
      userId,
      title: parsedTitle.data,
      status: "todo",
      priority: "medium",
    })
    .returning({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
    });

  return {
    ok: true as const,
    task: {
      id: task.id,
      title: task.title,
      project: "Personal",
      done: task.status === "done",
      priority: task.priority === "high" ? ("high" as const) : task.priority === "medium" ? ("medium" as const) : undefined,
    },
  };
}

export async function toggleTaskAction(input: { id: string; done: boolean }) {
  const parsed = toggleTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "That task update is not valid." };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false as const, error: "Your session has expired. Please sign in again." };
  }

  const [updated] = await db
    .update(tasks)
    .set({
      status: parsed.data.done ? "done" : "todo",
      completedAt: parsed.data.done ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, parsed.data.id), eq(tasks.userId, userId)))
    .returning({ id: tasks.id });

  if (!updated) {
    return { ok: false as const, error: "We couldn't find that task in your workspace." };
  }

  return { ok: true as const };
}