import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { groupInvitations, groups } from "@/db/schema";
import { auth } from "@/lib/auth";
import { acceptGroupInvitationAction } from "@/app/groups/actions";

export const metadata: Metadata = { title: "Accept group invitation" };

export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token ?? "";
  if (token.length < 32 || token.length > 128) {
    return <InvitationMessage title="Invitation link is invalid" description="Ask the group owner to send you a fresh invitation." />;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [invitation] = await db.select({
    id: groupInvitations.id,
    email: groupInvitations.email,
    status: groupInvitations.status,
    expiresAt: groupInvitations.expiresAt,
    groupName: groups.name,
  }).from(groupInvitations).innerJoin(groups, eq(groupInvitations.groupId, groups.id))
    .where(eq(groupInvitations.tokenHash, tokenHash)).limit(1);

  if (!invitation || invitation.status !== "pending" || invitation.expiresAt.getTime() <= Date.now()) {
    return <InvitationMessage title="Invitation expired" description="This invitation is no longer active. Ask the group owner to send a new one." />;
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const next = `/invitations/accept?token=${encodeURIComponent(token)}`;
  if (!session) {
    return <InvitationMessage title={`You're invited to ${invitation.groupName}`} description={`This invitation was sent to ${invitation.email}. Sign in with that email address to join the group.`} actionHref={`/sign-in?next=${encodeURIComponent(next)}`} actionLabel="Sign in to accept" secondaryHref={`/sign-up?next=${encodeURIComponent(next)}`} secondaryLabel="Create an account" />;
  }

  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return <InvitationMessage title="Use the invited email address" description={`This invitation was sent to ${invitation.email}. Sign out and sign in with that account to accept it.`} actionHref="/sign-in" actionLabel="Go to sign in" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f2] px-4 py-10 text-[#293026]">
      <section className="w-full max-w-lg rounded-2xl border border-[#e8e9e1] bg-white p-7 sm:p-9">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#819177]">A little more room, together</p>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.8px]">Join {invitation.groupName}</h1>
        <p className="mt-3 text-sm leading-6 text-[#858b80]">You’re accepting the invitation sent to {invitation.email}. You can leave the group later.</p>
        <form action={acceptGroupInvitationAction} className="mt-6"><input type="hidden" name="token" value={token} /><button className="w-full rounded-xl bg-[#60795d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4f694b]">Accept invitation</button></form>
        <Link href="/groups" className="mt-4 block text-center text-xs text-[#7b8375] hover:text-[#3f5a3b]">Not now</Link>
      </section>
    </main>
  );
}

function InvitationMessage({ title, description, actionHref, actionLabel, secondaryHref, secondaryLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string; secondaryHref?: string; secondaryLabel?: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f2] px-4 py-10 text-[#293026]"><section className="w-full max-w-lg rounded-2xl border border-[#e8e9e1] bg-white p-7 text-center sm:p-9"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2e9] text-[#60795d]"><span className="text-xl">G</span></div><h1 className="font-display text-2xl font-semibold tracking-[-0.8px]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#858b80]">{description}</p>{actionHref && actionLabel && <Link href={actionHref} className="mt-6 block rounded-xl bg-[#60795d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4f694b]">{actionLabel}</Link>}{secondaryHref && secondaryLabel && <Link href={secondaryHref} className="mt-3 block text-sm font-semibold text-[#60795d] hover:text-[#3f5a3b]">{secondaryLabel}</Link>}<Link href="/" className="mt-5 block text-xs text-[#9aa092] hover:text-[#60795d]">Back to Gara</Link></section></main>;
}
