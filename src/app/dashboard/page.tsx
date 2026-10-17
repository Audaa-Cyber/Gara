import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your workspace" };

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const firstName = session.user.name.trim().split(/\s+/)[0] || "there";
  return <main className="min-h-screen">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10"><div className="flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm text-white">g.</span>Gara</div><div className="flex items-center gap-4"><span className="hidden text-sm text-stone-500 sm:block">{session.user.email}</span><SignOutButton /></div></nav>
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 sm:px-10 sm:pt-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Your workspace</p>
      <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Good to have you here, {firstName}.</h1><p className="mt-4 max-w-xl text-base leading-7 text-stone-600">Your account is ready. This is your starting point for goals, projects, and more intentional focus sessions.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7e3cb] bg-[#f0f5e9] px-3.5 py-2 text-xs font-medium text-[#405537]"><span className="h-2 w-2 rounded-full bg-[#81976b]" />Signed in securely</span></div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-line bg-white/70 p-6"><p className="text-sm text-stone-500">Your goals</p><h2 className="mt-3 text-xl font-semibold tracking-tight">Keep the bigger picture close.</h2><p className="mt-3 text-sm leading-6 text-stone-600">A home for the outcomes you’re working toward. Goal tracking is the next feature to connect.</p><span className="mt-6 inline-block rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-stone-600">Coming next</span></article>
        <article className="rounded-3xl border border-line bg-white/70 p-6"><p className="text-sm text-stone-500">Your projects</p><h2 className="mt-3 text-xl font-semibold tracking-tight">Turn intention into action.</h2><p className="mt-3 text-sm leading-6 text-stone-600">Keep the work, decisions, and next steps in one place. Project management is ready for its first UI pass.</p><span className="mt-6 inline-block rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-stone-600">Coming next</span></article>
        <article className="rounded-3xl border border-line bg-white/70 p-6"><p className="text-sm text-stone-500">Your focus</p><h2 className="mt-3 text-xl font-semibold tracking-tight">Give one thing your attention.</h2><p className="mt-3 text-sm leading-6 text-stone-600">A focused timer and personal sessions are part of the next implementation phase.</p><span className="mt-6 inline-block rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-stone-600">Coming next</span></article>
      </div>
    </section>
  </main>;
}
