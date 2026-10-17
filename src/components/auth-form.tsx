"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Leaf, LoaderCircle, Mail, LockKeyhole, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: "/",
        });
        if (result.error) {
          setError(result.error.message ?? "We couldn't create your account. Please try again.");
        } else {
          setMessage("Your account is almost ready. Check your inbox for the verification link.");
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/",
        });
        if (result.error) {
          setError(result.error.message ?? "We couldn't sign you in. Check your details and try again.");
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="grid w-full max-w-[960px] overflow-hidden rounded-[26px] border border-[#e7e9e1] bg-white shadow-[0_24px_80px_rgba(35,43,34,0.07)] md:min-h-[600px] md:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#eef2e9] p-10 md:flex">
          <div className="absolute -right-24 top-28 h-64 w-64 rounded-full border border-[#dbe3d5]" />
          <div className="absolute -right-12 top-40 h-40 w-40 rounded-full border border-[#dbe3d5]" />
          <div className="absolute bottom-20 left-12 h-28 w-28 rounded-full bg-[#dfe8d9]/70 blur-2xl" />
          <Link href="/" className="relative z-10 flex w-fit items-center gap-3 text-[#293026]">
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#60795d] text-white"><Leaf size={20} /></span>
            <span className="font-display text-[22px] font-bold tracking-[-1px]">gara<span className="text-[#71866b]">.</span></span>
          </Link>
          <div className="relative z-10 max-w-[310px] pb-5">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#71866b]"><span className="h-1.5 w-1.5 rounded-full bg-[#71866b]" /> A gentler way to get things done</div>
            <h1 className="font-display text-[35px] font-semibold leading-[1.15] tracking-[-1.7px] text-[#2c3528]">Make room for the work that matters.</h1>
            <p className="mt-4 text-[13px] leading-[1.9] text-[#7c8575]">A little focus, a little progress, and a little more space to be yourself. You can do good things at your own pace.</p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#eef2e9] bg-[#e5d0bd] text-[10px] font-semibold text-[#795f4a]">M</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#eef2e9] bg-[#d9e1d2] text-[10px] font-semibold text-[#53664c]">S</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#eef2e9] bg-[#e8dfe9] text-[10px] font-semibold text-[#79627e]">A</span>
              </div>
              <span className="text-[10px] text-[#858d7d]">Focus on your own terms.</span>
            </div>
          </div>
          <p className="relative z-10 text-[10px] text-[#9aa292]">Focus independently. Make progress together.</p>
        </section>

        <section className="flex flex-col justify-center px-6 py-9 sm:px-12 md:px-14">
          <Link href="/" className="mb-9 flex w-fit items-center gap-2 text-[#66745f] md:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#60795d] text-white"><Leaf size={17} /></span>
            <span className="font-display text-[20px] font-bold tracking-[-1px] text-[#293026]">gara<span className="text-[#71866b]">.</span></span>
          </Link>
          <div className="mb-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[1.7px] text-[#819177]">{isSignUp ? "A fresh start" : "Welcome back"}</p>
            <h2 className="font-display text-[29px] font-semibold tracking-[-1.1px] text-[#2b3228]">{isSignUp ? "Create your space." : "Good to have you back."}</h2>
            <p className="mt-2 text-[12px] leading-[1.8] text-[#8a9085]">{isSignUp ? "Start small. Build a rhythm that feels like yours." : "Pick up where you left off, one thing at a time."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <label className="block">
                <span className="mb-2 block text-[11px] font-medium text-[#555e50]">Your name</span>
                <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 transition focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                  <UserRound size={15} className="text-[#a1a89b]" />
                  <input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#30382d] outline-none placeholder:text-[#b0b5aa]" />
                </span>
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium text-[#555e50]">Email address</span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 transition focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                <Mail size={15} className="text-[#a1a89b]" />
                <input autoComplete="email" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#30382d] outline-none placeholder:text-[#b0b5aa]" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-[11px] font-medium text-[#555e50]">
                Password
                {!isSignUp && <Link href="/forgot-password" className="font-medium text-[#71866b] hover:text-[#4f694b]">Forgot password?</Link>}
              </span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-[#e5e8df] px-3.5 transition focus-within:border-[#9eaf96] focus-within:ring-2 focus-within:ring-[#eaf0e6]">
                <LockKeyhole size={15} className="text-[#a1a89b]" />
                <input autoComplete={isSignUp ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignUp ? "At least 8 characters" : "Your password"} className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#30382d] outline-none placeholder:text-[#b0b5aa]" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-md p-1 text-[#a1a89b] hover:text-[#586750]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </span>
            </label>

            {error && <p role="alert" className="rounded-lg border border-[#f0d9d1] bg-[#fff7f4] px-3 py-2.5 text-[11px] leading-[1.6] text-[#a15e4c]">{error}</p>}
            {message && <p role="status" className="rounded-lg border border-[#dce7d6] bg-[#f3f7f0] px-3 py-2.5 text-[11px] leading-[1.6] text-[#4f694b]">{message}</p>}

            <button type="submit" disabled={loading} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#60795d] px-4 text-xs font-semibold text-white transition hover:bg-[#4e684a] disabled:cursor-not-allowed disabled:opacity-65">
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <>{isSignUp ? "Create your account" : "Sign in to Gara"} <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#92988d]">
            {isSignUp ? "Already have an account?" : "New to Gara?"}{" "}
            <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-semibold text-[#60795d] hover:text-[#435b3e]">{isSignUp ? "Sign in" : "Create an account"}</Link>
          </p>
          <p className="mt-8 text-center text-[10px] leading-[1.7] text-[#adb2a8]">By continuing, you agree to use Gara thoughtfully and respectfully.</p>
        </section>
      </div>
    </main>
  );
}