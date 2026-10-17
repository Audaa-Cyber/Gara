import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/app/dashboard-client";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return <DashboardClient userName={session.user.name} />;
}