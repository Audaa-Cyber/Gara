import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupMembers, groups } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createGroupAction, inviteGroupMemberAction } from "./actions";

export const metadata: Metadata = { title: "Groups" };

const noticeMessages: Record<string, string> = {
  created: "Your group is ready. Invite people when you’re ready.",
  invited: "Invitation sent. It expires in seven days.",
  joined: "You joined the group successfully.",
};
const errorMessages: Record<string, string> = {
  invalid: "Please check the group name or email address and try again.",
  forbidden: "Only group owners and admins can invite people.",
  "not-found": "We couldn't find that group.",
  member: "That person is already a member of this group.",
  pending: "An active invitation has already been sent to that email.",
  email: "The invitation couldn't be sent. Check the email configuration and try again.",
  invitation: "That invitation link is not valid.",
  expired: "That invitation has expired or has already been used.",
  "wrong-email": "Sign in with the email address the invitation was sent to.",
};

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const params = await searchParams;
  const groupRows = await db.select({
    id: groups.id,
    name: groups.name,
    description: groups.description,
    role: groupMembers.role,
    createdAt: groups.createdAt,
  }).from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, session.user.id))
    .orderBy(asc(groups.createdAt));

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-8 text-[#293026] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#71806a] hover:text-[#3f5a3b]">← Back to workspace</Link>
        <header className="mb-8 mt-7"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.6px] text-[#8b9285]">Focus independently. Make progress together.</p><h1 className="font-display text-3xl font-semibold tracking-[-1px]">Your groups</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#858b80]">Create a small private space for people working toward something together.</p></header>
        {params.notice && noticeMessages[params.notice] && <p className="mb-5 rounded-xl border border-[#dce7d6] bg-[#f1f5ed] px-4 py-3 text-sm text-[#4c6848]" role="status">{noticeMessages[params.notice]}</p>}
        {params.error && errorMessages[params.error] && <p className="mb-5 rounded-xl border border-[#efd8ca] bg-[#fff7f1] px-4 py-3 text-sm text-[#9a654a]" role="alert">{errorMessages[params.error]}</p>}

        <section className="mb-7 rounded-2xl border border-[#e8e9e1] bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold">Create a private group</h2>
          <form action={createGroupAction} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d] sm:col-span-2">Group name<input name="name" required minLength={2} maxLength={100} placeholder="e.g. Study circle" className="rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d] sm:col-span-2">Description <textarea name="description" rows={2} maxLength={1000} placeholder="What are you working on together? (optional)" className="resize-y rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <div className="sm:col-span-2 sm:flex sm:justify-end"><button className="w-full rounded-xl bg-[#60795d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f694b] sm:w-auto">Create group</button></div>
          </form>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {groupRows.length === 0 && <div className="rounded-2xl border border-dashed border-[#d9dfd3] bg-white/70 px-6 py-12 text-center sm:col-span-2"><p className="text-sm font-semibold">A little more room, together</p><p className="mt-2 text-sm text-[#858b80]">Create a group, then invite the people you want to focus with.</p></div>}
          {groupRows.map((group) => {
            const canInvite = group.role === "owner" || group.role === "admin";
            return <article key={group.id} className="rounded-2xl border border-[#e8e9e1] bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2e9] text-[#60795d]"><span className="text-sm font-semibold">{group.name.charAt(0).toUpperCase()}</span></div><span className="rounded-full bg-[#f4f5f0] px-2.5 py-1 text-[10px] font-medium capitalize text-[#7b8375]">{group.role}</span></div>
              <h2 className="text-base font-semibold">{group.name}</h2>
              {group.description && <p className="mt-2 text-sm leading-6 text-[#858b80]">{group.description}</p>}
              <p className="mt-3 text-[10px] text-[#a0a59b]">Created {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(group.createdAt)}</p>
              {canInvite && <form action={inviteGroupMemberAction} className="mt-5 border-t border-[#eff0eb] pt-4"><input type="hidden" name="groupId" value={group.id} /><label className="mb-2 block text-[11px] font-medium text-[#72786d]">Invite by email</label><div className="flex gap-2"><input type="email" name="email" required maxLength={254} placeholder="teammate@example.com" className="min-w-0 flex-1 rounded-lg border border-[#e5e8df] bg-[#fcfcf9] px-3 py-2.5 text-xs outline-none focus:border-[#9bac92]" /><button className="rounded-lg bg-[#60795d] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#4f694b]">Invite</button></div><p className="mt-2 text-[10px] leading-5 text-[#a0a59b]">The invitation link expires after seven days.</p></form>}
            </article>;
          })}
        </section>
      </div>
    </main>
  );
}
