"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf, LoaderCircle, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      if (result.error) setError(result.error.message ?? "We couldn't send the reset email.");
      else setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#e7e9e1] bg-white px-7 py-9 shadow-[0_24px_80px_rgba(35,43,34,0.06)] sm:px-10">
        <Link href="/sign-in" className="mb-8 inline-flex items-center gap-2 text-[11px] font-medium text-[#7f8878] hover:text-[#4f694b]"><ArrowLeft size={14} /> Back to sign in</Link>
        <Link href="/" className="mb-7 flex w-fit items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#60795d] text-white"><Leaf size={18} /></span>
          <span className="font-display text-[21px] font-bold tracking-[-1px] text-[#293026]">gara<span className="text-[#71866b]">.</span></span>
        </Link>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.7px] text-[#819177]">A small reset</p>
        <h1 className="font-display text-[27px] font-semibold tracking-[-1px] text-[#2b3228]">Forgot your password?</h1>
        <p className="mt-2 text-[12px] leading-[1.8] text-[#8a9085]">It happens. Add your email and we’ll send you a secure link to choose a new password.</p>

        {sent ? (
          <div role="status" className="mt-6 rounded-xl border border-[#dce7d6] bg-[#f3f7f0] p-4 text-[12px] leading-[1.8] text-[#4f694b]">If an account exists for that address, a password reset link is on its way. Check your inbox.</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium text-[#555e50]">Email address</span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                <Mail size={15} className="text-[#a1a89b]" />
                <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#b0b5aa]" />
              </span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-[#f0d9d1] bg-[#fff7f4] px-3 py-2.5 text-[11px] text-[#a15e4c]">{error}</p>}
            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#60795d] text-xs font-semibold text-white transition hover:bg-[#4e684a] disabled:opacity-65">
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : "Send reset link"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}