import { and, asc, desc, eq, gte, or } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient, type Task } from "@/app/dashboard-client";
import { db } from "@/db";
import { focusSessions, projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(tasks.userId, session.user.id))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));

  const initialTasks: Task[] = rows.map((task) => ({
    id: task.id,
    title: task.title,
    project: task.projectName ?? "Personal",
    done: task.status === "done",
    priority: task.priority === "high" || task.priority === "medium" ? task.priority : undefined,
  }));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const focusRows = await db
    .select({ startedAt: focusSessions.startedAt, actualSeconds: focusSessions.actualSeconds })
    .from(focusSessions)
    .where(and(eq(focusSessions.userId, session.user.id), eq(focusSessions.status, "completed"), gte(focusSessions.startedAt, thirtyDaysAgo)))
    .orderBy(asc(focusSessions.startedAt));
  const initialFocusSessions = focusRows.map((item) => ({
    startedAt: item.startedAt.toISOString(),
    actualSeconds: item.actualSeconds,
  }));

  const [activeRow] = await db.select({
    id: focusSessions.id,
    status: focusSessions.status,
    startedAt: focusSessions.startedAt,
    plannedSeconds: focusSessions.plannedSeconds,
    remainingSeconds: focusSessions.remainingSeconds,
    endsAt: focusSessions.endsAt,
  }).from(focusSessions).where(and(
    eq(focusSessions.userId, session.user.id),
    or(eq(focusSessions.status, "in_progress"), eq(focusSessions.status, "paused")),
  )).orderBy(desc(focusSessions.createdAt)).limit(1);

  const initialActiveFocusSession = activeRow ? {
    id: activeRow.id,
    status: activeRow.status === "paused" ? "paused" as const : "in_progress" as const,
    startedAt: activeRow.startedAt.toISOString(),
    plannedSeconds: activeRow.plannedSeconds,
    remainingSeconds: activeRow.remainingSeconds ?? activeRow.plannedSeconds,
    endsAt: activeRow.endsAt?.toISOString() ?? null,
  } : null;

  return <DashboardClient userName={session.user.name} initialTasks={initialTasks} initialFocusSessions={initialFocusSessions} initialActiveFocusSession={initialActiveFocusSession} />;
}