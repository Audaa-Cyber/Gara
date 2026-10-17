import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createGoalAction, deleteGoalAction, updateGoalStatusAction } from "./actions";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const params = await searchParams;
  const items = await db.select().from(goals).where(eq(goals.userId, session.user.id)).orderBy(asc(goals.status), desc(goals.createdAt));
  const active = items.filter((goal) => goal.status !== "completed").length;
  const completed = items.length - active;

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-8 text-[#293026] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#71806a] hover:text-[#3f5a3b]">← Back to workspace</Link>
        <header className="mb-8 mt-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.6px] text-[#8b9285]">Direction, not pressure</p><h1 className="font-display text-3xl font-semibold tracking-[-1px]">Your goals</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#858b80]">Keep the bigger picture close. Small steps are still progress.</p></div>
          <div className="flex gap-3 text-xs text-[#7c8277]"><span className="rounded-xl border border-[#e8e9e1] bg-white px-3 py-2">{active} active</span><span className="rounded-xl border border-[#e8e9e1] bg-white px-3 py-2">{completed} completed</span></div>
        </header>

        {params.error && <p className="mb-4 rounded-xl border border-[#efd8ca] bg-[#fff7f1] px-4 py-3 text-sm text-[#9a654a]" role="alert">Please check the goal details and try again.</p>}

        <section className="mb-6 rounded-2xl border border-[#e8e9e1] bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold">Add a goal</h2>
          <form action={createGoalAction} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d] sm:col-span-2">Goal title<input name="title" required maxLength={160} placeholder="What would you like to work toward?" className="rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d] sm:col-span-2">A little context <textarea name="description" rows={2} maxLength={1000} placeholder="Why does this matter to you? (optional)" className="resize-y rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d]">Target date <input type="date" name="targetDate" className="rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <div className="flex items-end justify-end"><button className="rounded-xl bg-[#60795d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f694b]">Create goal</button></div>
          </form>
        </section>

        <section className="grid gap-3">
          {items.length === 0 && <div className="rounded-2xl border border-dashed border-[#d9dfd3] bg-white/70 px-6 py-12 text-center"><p className="text-sm font-semibold">Nothing on the horizon yet</p><p className="mt-2 text-sm text-[#858b80]">Add one meaningful goal to give your daily tasks a direction.</p></div>}
          {items.map((goal) => {
            const isCompleted = goal.status === "completed";
            return <article key={goal.id} className="rounded-2xl border border-[#e8e9e1] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${isCompleted ? "bg-[#9da69a]" : "bg-[#71866b]"}`} /><span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#92978c]">{isCompleted ? "Completed" : "In progress"}</span></div><h2 className={`text-base font-semibold ${isCompleted ? "text-[#92978c] line-through" : "text-[#363d32]"}`}>{goal.title}</h2>{goal.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#858b80]">{goal.description}</p>}{goal.targetDate && <p className="mt-3 text-xs text-[#92978c]">Target · {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(goal.targetDate)}</p>}</div>
                <div className="flex items-center gap-2">
                  <form action={updateGoalStatusAction}><input type="hidden" name="id" value={goal.id} /><input type="hidden" name="status" value={isCompleted ? "active" : "completed"} /><button className="rounded-lg border border-[#e5e8df] px-3 py-2 text-xs font-semibold text-[#60795d] hover:bg-[#f5f7f2]">{isCompleted ? "Reopen" : "Mark complete"}</button></form>
                  <form action={deleteGoalAction}><input type="hidden" name="id" value={goal.id} /><button className="rounded-lg px-2 py-2 text-xs text-[#a0a59b] hover:bg-[#faf0eb] hover:text-[#9a654a]" aria-label={`Delete ${goal.title}`}>Delete</button></form>
                </div>
              </div>
            </article>;
          })}
        </section>
      </div>
    </main>
  );
}
