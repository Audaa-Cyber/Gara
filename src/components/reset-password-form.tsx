"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({
  token,
  invalidToken = false,
}: {
  token: string | null;
  invalidToken?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      if (token) {
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) setError(result.error.message || "This reset link may have expired.");
        else router.replace("/sign-in?reset=success");
      } else {
        const result = await authClient.requestPasswordReset({
          email: email.trim(),
          redirectTo: "/reset-password",
        });
        if (result.error) setError(result.error.message || "We could not request a reset email.");
        else setNotice("If an account exists for that address, a password reset link will arrive shortly.");
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        {token
          ? "Choose a new password for your Gara account."
          : "Enter your account email and we’ll send you a secure reset link."}
      </p>
      {invalidToken && !token && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This reset link is invalid or has expired. Request a new link below.
        </p>
      )}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {!token ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Email address</span>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">New password</span>
            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
        )}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-[#f0f5e9] px-4 py-3 text-sm leading-6 text-[#405537]">{notice}</p>}
        <button className="w-full rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
          {busy ? "One moment…" : token ? "Update password" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-500">
        <Link href="/sign-in" className="font-medium text-ink underline decoration-stone-300 underline-offset-4">Back to sign in</Link>
      </p>
    </div>
  );
}
