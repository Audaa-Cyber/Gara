import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata = { title: "Reset your password" };
export default async function ResetPasswordPage({ params }: { params: Promise<{ token?: string[] }> }) {
  const { token } = await params;
  const resetToken = token?.[0] ?? null;
  return <main className="flex min-h-screen items-center justify-center px-6 py-12"><section className="w-full max-w-md rounded-3xl border border-line bg-white/75 p-7 shadow-soft sm:p-9">
    <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm text-white">g.</span>Gara</Link>
    <h1 className="mt-10 text-3xl font-medium tracking-tight">{resetToken ? "Choose a new password." : "Let’s get you back in."}</h1>
    <ResetPasswordForm token={resetToken} />
  </section></main>;
}
