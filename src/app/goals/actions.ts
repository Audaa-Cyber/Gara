"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { auth } from "@/lib/auth";

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

const goalSchema = z.object({
  title: z.string().trim().min(1, "Add a goal title.").max(160),
  description: z.string().trim().max(1000).optional(),
  targetDate: z.string().optional(),
});

export async function createGoalAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    targetDate: formData.get("targetDate") ?? "",
  });
  if (!parsed.success) redirect("/goals?error=invalid");

  const targetDate = parsed.data.targetDate ? new Date(`${parsed.data.targetDate}T12:00:00.000Z`) : null;
  if (targetDate && Number.isNaN(targetDate.getTime())) redirect("/goals?error=date");

  await db.insert(goals).values({
    id: randomUUID(),
    userId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    targetDate,
    status: "active",
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function updateGoalStatusAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");
  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(["active", "completed"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) redirect("/goals?error=invalid");

  await db.update(goals)
    .set({ status: status.data, updatedAt: new Date() })
    .where(and(eq(goals.id, id.data), eq(goals.userId, userId)));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoalAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/goals?error=invalid");

  await db.delete(goals).where(and(eq(goals.id, id.data), eq(goals.userId, userId)));
  revalidatePath("/goals");
  revalidatePath("/");
}
