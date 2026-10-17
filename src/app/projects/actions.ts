"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "@/lib/auth";

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

const projectSchema = z.object({
  name: z.string().trim().min(1, "Add a project name.").max(100),
  description: z.string().trim().max(1000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7b8f70"),
});

export async function createProjectAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    color: formData.get("color") ?? "#7b8f70",
  });
  if (!parsed.success) redirect("/projects?error=invalid");

  await db.insert(projects).values({
    id: randomUUID(),
    userId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    color: parsed.data.color,
  });
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function toggleProjectArchiveAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");
  const id = z.string().uuid().safeParse(formData.get("id"));
  const archived = z.enum(["true", "false"]).safeParse(formData.get("archived"));
  if (!id.success || !archived.success) redirect("/projects?error=invalid");

  await db.update(projects)
    .set({ archived: archived.data === "true", updatedAt: new Date() })
    .where(and(eq(projects.id, id.data), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function deleteProjectAction(formData: FormData) {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/projects?error=invalid");

  await db.delete(projects).where(and(eq(projects.id, id.data), eq(projects.userId, userId)));
  revalidatePath("/projects");
  revalidatePath("/");
}
