"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { groupInvitations, groupMembers, groups, userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";

async function currentSession() {
  return auth.api.getSession({ headers: await headers() });
}

const groupSchema = z.object({
  name: z.string().trim().min(2, "Group names must be at least 2 characters.").max(100),
  description: z.string().trim().max(1000).optional(),
});

export async function createGroupAction(formData: FormData) {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) redirect("/groups?error=invalid");

  const groupId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(groups).values({
      id: groupId,
      ownerId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
    });
    await tx.insert(groupMembers).values({
      id: randomUUID(),
      groupId,
      userId: session.user.id,
      role: "owner",
    });
  });
  revalidatePath("/groups");
  redirect("/groups?notice=created");
}

export async function inviteGroupMemberAction(formData: FormData) {
  const session = await currentSession();
  if (!session) redirect("/sign-in");

  const groupId = z.string().uuid().safeParse(formData.get("groupId"));
  const emailResult = z.string().trim().email().max(254).safeParse(formData.get("email"));
  if (!groupId.success || !emailResult.success) redirect("/groups?error=invalid");
  const email = emailResult.data.toLowerCase();

  const [membership] = await db.select({ role: groupMembers.role }).from(groupMembers)
    .where(and(
      eq(groupMembers.groupId, groupId.data),
      eq(groupMembers.userId, session.user.id),
      or(eq(groupMembers.role, "owner"), eq(groupMembers.role, "admin")),
    ))
    .limit(1);
  if (!membership) redirect("/groups?error=forbidden");

  const [group] = await db.select({ id: groups.id, name: groups.name }).from(groups)
    .where(eq(groups.id, groupId.data)).limit(1);
  if (!group) redirect("/groups?error=not-found");

  const [existingUser] = await db.select({ id: userTable.id }).from(userTable)
    .where(eq(userTable.email, email)).limit(1);
  if (existingUser) {
    const [existingMembership] = await db.select({ id: groupMembers.id }).from(groupMembers)
      .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, existingUser.id))).limit(1);
    if (existingMembership) redirect("/groups?error=member");
  }

  const now = new Date();
  const [pending] = await db.select({ id: groupInvitations.id }).from(groupInvitations)
    .where(and(
      eq(groupInvitations.groupId, group.id),
      eq(groupInvitations.email, email),
      eq(groupInvitations.status, "pending"),
      gt(groupInvitations.expiresAt, now),
    ))
    .limit(1);
  if (pending) redirect("/groups?error=pending");

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invitationId = randomUUID();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(groupInvitations).values({
    id: invitationId,
    groupId: group.id,
    inviterId: session.user.id,
    email,
    tokenHash,
    status: "pending",
    expiresAt,
  });

  const origin = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const invitationUrl = `${origin}/invitations/accept?token=${token}`;
  try {
    await sendTransactionalEmail({
      to: email,
      subject: `You're invited to join ${group.name} on Gara`,
      text: `You've been invited to join the Gara group "${group.name}".\n\nThis invitation expires in 7 days. Open this link while signed in with ${email}:\n${invitationUrl}\n\nIf you weren't expecting this invitation, you can ignore this email.`,
    });
  } catch {
    await db.delete(groupInvitations).where(eq(groupInvitations.id, invitationId));
    redirect("/groups?error=email");
  }

  revalidatePath("/groups");
  redirect("/groups?notice=invited");
}

export async function acceptGroupInvitationAction(formData: FormData) {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const tokenResult = z.string().min(32).max(128).safeParse(formData.get("token"));
  if (!tokenResult.success) redirect("/groups?error=invitation");

  const tokenHash = createHash("sha256").update(tokenResult.data).digest("hex");
  const [invitation] = await db.select().from(groupInvitations)
    .where(eq(groupInvitations.tokenHash, tokenHash)).limit(1);
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt.getTime() <= Date.now()) {
    redirect("/groups?error=expired");
  }
  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    redirect("/groups?error=wrong-email");
  }

  await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: groupMembers.id }).from(groupMembers)
      .where(and(eq(groupMembers.groupId, invitation.groupId), eq(groupMembers.userId, session.user.id))).limit(1);
    if (!existing) {
      await tx.insert(groupMembers).values({
        id: randomUUID(),
        groupId: invitation.groupId,
        userId: session.user.id,
        role: "member",
      });
    }
    await tx.update(groupInvitations).set({ status: "accepted", acceptedAt: new Date() })
      .where(and(eq(groupInvitations.id, invitation.id), eq(groupInvitations.status, "pending")));
  });

  revalidatePath("/groups");
  redirect("/groups?notice=joined");
}
