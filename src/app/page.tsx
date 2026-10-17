import { and, asc, eq, gte } from "drizzle-orm";
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
    .where(and(eq(focusSessions.userId, session.user.id), gte(focusSessions.startedAt, thirtyDaysAgo)))
    .orderBy(asc(focusSessions.startedAt));
  const initialFocusSessions = focusRows.map((item) => ({
    startedAt: item.startedAt.toISOString(),
    actualSeconds: item.actualSeconds,
  }));

  return <DashboardClient userName={session.user.name} initialTasks={initialTasks} initialFocusSessions={initialFocusSessions} />;
}