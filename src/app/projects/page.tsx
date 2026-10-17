import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createProjectAction, deleteProjectAction, toggleProjectArchiveAction } from "./actions";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const params = await searchParams;
  const rows = await db.select({
    id: projects.id,
    name: projects.name,
    description: projects.description,
    color: projects.color,
    archived: projects.archived,
    createdAt: projects.createdAt,
    taskCount: tasks.id,
    taskStatus: tasks.status,
  }).from(projects).leftJoin(tasks, and(eq(tasks.projectId, projects.id), eq(tasks.userId, session.user.id))).where(eq(projects.userId, session.user.id)).orderBy(asc(projects.createdAt));

  const grouped = new Map<string, { id: string; name: string; description: string | null; color: string; archived: boolean; createdAt: Date; total: number; completed: number }>();
  for (const row of rows) {
    const current = grouped.get(row.id) ?? { id: row.id, name: row.name, description: row.description, color: row.color, archived: row.archived, createdAt: row.createdAt, total: 0, completed: 0 };
    if (row.taskCount) {
      current.total += 1;
      if (row.taskStatus === "done") current.completed += 1;
    }
    grouped.set(row.id, current);
  }
  const items = [...grouped.values()];
  const active = items.filter((project) => !project.archived);
  const archived = items.filter((project) => project.archived);

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-8 text-[#293026] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#71806a] hover:text-[#3f5a3b]">← Back to workspace</Link>
        <header className="mb-8 mt-7"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.6px] text-[#8b9285]">A home for the things you’re building</p><h1 className="font-display text-3xl font-semibold tracking-[-1px]">Your projects</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#858b80]">Give related tasks a shared place to live, without adding more noise.</p></header>
        {params.error && <p className="mb-4 rounded-xl border border-[#efd8ca] bg-[#fff7f1] px-4 py-3 text-sm text-[#9a654a]" role="alert">Please check the project details and try again.</p>}
        <section className="mb-7 rounded-2xl border border-[#e8e9e1] bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold">Create a project</h2>
          <form action={createProjectAction} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d]">Project name<input name="name" required maxLength={100} placeholder="e.g. Learn a new skill" className="rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d]">Color<input type="color" name="color" defaultValue="#7b8f70" className="h-[42px] w-full cursor-pointer rounded-xl border border-[#e5e8df] bg-[#fcfcf9] p-1 sm:w-20" /></label>
            <label className="grid gap-1.5 text-xs font-medium text-[#72786d] sm:col-span-2">Description <textarea name="description" rows={2} maxLength={1000} placeholder="What belongs in this project? (optional)" className="resize-y rounded-xl border border-[#e5e8df] bg-[#fcfcf9] px-3 py-3 text-sm text-[#293026] outline-none focus:border-[#9bac92]" /></label>
            <div className="sm:col-span-2 sm:flex sm:justify-end"><button className="w-full rounded-xl bg-[#60795d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f694b] sm:w-auto">Create project</button></div>
          </form>
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          {active.length === 0 && <div className="rounded-2xl border border-dashed border-[#d9dfd3] bg-white/70 px-6 py-12 text-center sm:col-span-2"><p className="text-sm font-semibold">A fresh start</p><p className="mt-2 text-sm text-[#858b80]">Create your first project to group related tasks together.</p></div>}
          {active.map((project) => <article key={project.id} className="rounded-2xl border border-[#e8e9e1] bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3"><span className="mt-1 h-3 w-3 rounded-[4px]" style={{ backgroundColor: project.color }} /><div className="flex-1"><h2 className="text-base font-semibold">{project.name}</h2>{project.description && <p className="mt-2 text-sm leading-6 text-[#858b80]">{project.description}</p>}</div></div>
            <div className="mb-4 flex items-center justify-between border-t border-[#eff0eb] pt-4 text-xs text-[#92978c]"><span>{project.total} {project.total === 1 ? "task" : "tasks"}</span><span>{project.total ? Math.round((project.completed / project.total) * 100) : 0}% complete</span></div>
            <div className="flex items-center justify-between gap-2"><form action={toggleProjectArchiveAction}><input type="hidden" name="id" value={project.id} /><input type="hidden" name="archived" value="true" /><button className="rounded-lg border border-[#e5e8df] px-3 py-2 text-xs font-semibold text-[#60795d] hover:bg-[#f5f7f2]">Archive</button></form><form action={deleteProjectAction}><input type="hidden" name="id" value={project.id} /><button className="rounded-lg px-2 py-2 text-xs text-[#a0a59b] hover:bg-[#faf0eb] hover:text-[#9a654a]">Delete</button></form></div>
          </article>)}
        </section>
        {archived.length > 0 && <section className="mt-8"><h2 className="mb-3 text-xs font-semibold uppercase tracking-[1.3px] text-[#92978c]">Archived</h2><div className="grid gap-3 sm:grid-cols-2">{archived.map((project) => <article key={project.id} className="rounded-2xl border border-[#e8e9e1] bg-white/70 p-4"><h3 className="text-sm font-semibold text-[#7d8478]">{project.name}</h3><div className="mt-3 flex justify-between"><form action={toggleProjectArchiveAction}><input type="hidden" name="id" value={project.id} /><input type="hidden" name="archived" value="false" /><button className="text-xs font-semibold text-[#60795d]">Restore</button></form><form action={deleteProjectAction}><input type="hidden" name="id" value={project.id} /><button className="text-xs text-[#a0a59b] hover:text-[#9a654a]">Delete</button></form></div></article>)}</div></section>}
      </div>
    </main>
  );
}
