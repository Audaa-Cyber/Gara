import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create your account" };

export default function SignUpPage() {
  return <main className="grid min-h-screen lg:grid-cols-2">
    <section className="flex items-center justify-center px-6 py-12 sm:px-10"><div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm text-white">g.</span>Gara</Link>
      <p className="mt-14 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Start with a little space</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Make room for what matters.</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">Create your account. We’ll send you an email to verify it before you sign in.</p>
      <AuthForm mode="sign-up" />
      <p className="mt-7 text-center text-sm text-stone-500">Already have an account? <Link href="/sign-in" className="font-semibold text-ink underline decoration-stone-300 underline-offset-4">Sign in</Link></p>
      <p className="mt-10 text-center text-xs text-stone-400">By continuing, you agree to use Gara thoughtfully and respectfully.</p>
    </div></section>
    <aside className="relative hidden overflow-hidden bg-[#e9eddf] p-12 lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-white/75 blur-3xl" /><div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#c9d5b9] blur-3xl" /><p className="relative text-sm font-semibold text-stone-700">Gara / Start small, build steadily</p><div className="relative max-w-lg"><p className="text-4xl font-medium leading-tight tracking-tight">You don’t need a perfect plan. You need a next step.</p><p className="mt-5 max-w-sm text-base leading-7 text-stone-600">Bring your goals and projects into one quiet place, then make progress at your own pace.</p></div><p className="relative text-xs text-stone-500">Focus independently. Make progress together.</p></aside>
  </main>;
}
