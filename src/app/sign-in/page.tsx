import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const params = await searchParams;
  return <main className="grid min-h-screen lg:grid-cols-2">
    <section className="flex items-center justify-center px-6 py-12 sm:px-10"><div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm text-white">g.</span>Gara</Link>
      <p className="mt-14 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Welcome back</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Pick up where you left off.</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">Sign in to return to your projects, priorities, and focus time.</p>
      {params.reset === "success" && <p className="mt-5 rounded-xl border border-[#d7e3cb] bg-[#f0f5e9] px-4 py-3 text-sm text-[#405537]">Your password was updated. Sign in with your new password.</p>}
      <AuthForm mode="sign-in" />
      <p className="mt-7 text-center text-sm text-stone-500">New to Gara? <Link href="/sign-up" className="font-semibold text-ink underline decoration-stone-300 underline-offset-4">Create an account</Link></p>
      <p className="mt-10 text-center text-xs text-stone-400">Focus independently. Make progress together.</p>
    </div></section>
    <aside className="relative hidden overflow-hidden bg-[#e9eddf] p-12 lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-white/75 blur-3xl" /><div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#c9d5b9] blur-3xl" /><p className="relative text-sm font-semibold text-stone-700">Gara / Your space to focus</p><div className="relative max-w-lg"><p className="text-4xl font-medium leading-tight tracking-tight">A little more intention. A little less noise.</p><p className="mt-5 max-w-sm text-base leading-7 text-stone-600">Give your attention to what matters, and let the rest wait.</p></div><p className="relative text-xs text-stone-500">A calmer workspace for meaningful progress.</p></aside>
  </main>;
}
