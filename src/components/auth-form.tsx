"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: "/dashboard" });
        if (result.error) setError(result.error.message || "We could not create your account.");
        else setNotice("Your account has been created. Check your inbox for the verification link before signing in.");
      } else {
        const result = await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/dashboard" });
        if (result.error) setError(result.error.message || "We could not sign you in.");
        else { router.replace("/dashboard"); router.refresh(); }
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      {isSignUp && <label className="block"><span className="mb-2 block text-sm font-medium text-stone-700">Your name</span><input autoComplete="name" className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-100" maxLength={120} onChange={(event) => setName(event.target.value)} placeholder="How should we call you?" required value={name} /></label>}
      <label className="block"><span className="mb-2 block text-sm font-medium text-stone-700">Email address</span><input autoComplete="email" className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-100" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
      <label className="block"><span className="mb-2 block text-sm font-medium text-stone-700">Password</span><input autoComplete={isSignUp ? "new-password" : "current-password"} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-100" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder={isSignUp ? "At least 8 characters" : "Your password"} required type="password" value={password} /></label>
      {!isSignUp && <div className="text-right"><Link className="text-xs font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-ink" href="/reset-password">Forgot password?</Link></div>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-[#d7e3cb] bg-[#f0f5e9] px-4 py-3 text-sm leading-6 text-[#405537]">{notice}</p>}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy} type="submit">{busy ? "One moment…" : isSignUp ? "Create account" : "Sign in"}{!busy && <span aria-hidden="true">↗</span>}</button>
    </form>
  );
}
