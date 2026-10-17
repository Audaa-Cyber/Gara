"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    try { await authClient.signOut(); router.replace("/sign-in"); router.refresh(); }
    finally { setBusy(false); }
  }
  return <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-60" disabled={busy} onClick={signOut} type="button">{busy ? "Signing out…" : "Sign out"}</button>;
}
