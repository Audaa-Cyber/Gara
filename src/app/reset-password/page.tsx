"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Leaf, LoaderCircle, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing its token. Request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match yet.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) setError(result.error.message ?? "We couldn't update your password.");
      else setSuccess(true);
    } catch {
      setError("This link may have expired. Request a new reset link and try again.");
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
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.7px] text-[#819177]">A fresh start</p>
        <h1 className="font-display text-[27px] font-semibold tracking-[-1px] text-[#2b3228]">Choose a new password.</h1>
        <p className="mt-2 text-[12px] leading-[1.8] text-[#8a9085]">Use at least eight characters. Something memorable to you and hard to guess.</p>
        {success ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="rounded-xl border border-[#dce7d6] bg-[#f3f7f0] p-4 text-[12px] leading-[1.8] text-[#4f694b]">Your password has been updated. You can sign in with your new password now.</p>
            <button onClick={() => router.push("/sign-in")} className="h-11 w-full rounded-xl bg-[#60795d] text-xs font-semibold text-white hover:bg-[#4e684a]">Continue to sign in</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium text-[#555e50]">New password</span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                <LockKeyhole size={15} className="text-[#a1a89b]" />
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium text-[#555e50]">Confirm new password</span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                <LockKeyhole size={15} className="text-[#a1a89b]" />
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none" />
              </span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-[#f0d9d1] bg-[#fff7f4] px-3 py-2.5 text-[11px] text-[#a15e4c]">{error}</p>}
            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#60795d] text-xs font-semibold text-white transition hover:bg-[#4e684a] disabled:opacity-65">
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : "Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-[#7c8277]">Preparing your reset link…</main>}><ResetPasswordForm /></Suspense>;
}