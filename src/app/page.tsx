import Link from "next/link";

const features = [
  { number: "01", title: "Make space for focus", description: "A gentle timer and clear priorities help you give your attention to one thing at a time." },
  { number: "02", title: "Move meaningful work forward", description: "Keep goals, projects, and next actions together instead of scattering them across tools." },
  { number: "03", title: "Work alongside your people", description: "Shared spaces make progress visible without turning your day into another noisy feed." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm text-white">g.</span>Gara</Link>
        <div className="flex items-center gap-3"><Link href="/sign-in" className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white">Sign in</Link><Link href="/sign-up" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700">Get started <span aria-hidden="true">↗</span></Link></div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-16 sm:px-10 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32">
        <div className="max-w-2xl">
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-2 text-xs font-medium text-stone-600"><span className="h-2 w-2 rounded-full bg-[#81976b]" />A calmer way to make progress</p>
          <h1 className="text-5xl font-medium leading-[1.04] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Do your best work.<span className="mt-2 block text-stone-500">Together, quietly.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">Gara brings your goals, projects, focus sessions, and people into one grounded workspace — so you can spend less energy organizing and more energy doing.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3"><Link href="/sign-up" className="rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-stone-700">Create your workspace <span aria-hidden="true">↗</span></Link><Link href="/sign-in" className="rounded-full border border-line bg-white/70 px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-white">I already have an account</Link></div>
          <p className="mt-6 text-xs leading-5 text-stone-500">Designed for meaningful progress, not endless productivity theater.</p>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-10 -top-8 h-48 w-48 rounded-full bg-[#e8eadb] blur-3xl" /><div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-[#e1e7d7] blur-3xl" />
          <div className="relative rounded-[2rem] border border-white bg-white/80 p-4 shadow-soft backdrop-blur sm:p-6">
            <div className="flex items-center justify-between border-b border-line px-2 pb-5"><div><p className="text-xs font-medium text-stone-500">MONDAY, YOUR PACE</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Today, with intention</h2></div><span className="rounded-full bg-[#edf2e7] px-3 py-1.5 text-xs font-semibold text-[#536346]">In progress</span></div>
            <div className="grid grid-cols-2 gap-3 py-5"><div className="rounded-2xl bg-paper p-4"><p className="text-xs text-stone-500">Focus time</p><p className="mt-2 text-2xl font-medium tracking-tight">01:42 <span className="text-sm text-stone-400">hrs</span></p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e5e7dc]"><div className="h-full w-2/3 rounded-full bg-[#92a47e]" /></div></div><div className="rounded-2xl bg-paper p-4"><p className="text-xs text-stone-500">Small wins</p><p className="mt-2 text-2xl font-medium tracking-tight">4 <span className="text-sm text-stone-400">of 6</span></p><div className="mt-4 flex gap-1.5">{[0, 1, 2, 3, 4, 5].map((item) => <span key={item} className={"h-1.5 flex-1 rounded-full " + (item < 4 ? "bg-[#92a47e]" : "bg-[#e5e7dc]")} />)}</div></div></div>
            <div className="rounded-2xl border border-line p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Your next steps</p><span className="text-xs text-stone-400">2 left</span></div><div className="mt-4 space-y-3"><div className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#9bad88] text-[10px] text-white">✓</span><span className="text-sm text-stone-400 line-through">Outline the project brief</span><span className="ml-auto text-[11px] text-stone-400">Done</span></div><div className="flex items-center gap-3"><span className="h-5 w-5 rounded-full border border-stone-300" /><span className="text-sm font-medium">Build the first useful version</span><span className="ml-auto rounded-full bg-[#f5eee0] px-2 py-1 text-[10px] font-medium text-[#8a7046]">Focus</span></div><div className="flex items-center gap-3"><span className="h-5 w-5 rounded-full border border-stone-300" /><span className="text-sm text-stone-600">Share progress with the team</span></div></div></div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink p-4 text-white"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg">◷</div><div className="min-w-0 flex-1"><p className="text-sm font-medium">A little room to focus</p><p className="mt-1 text-xs text-white/55">25 minutes · One thing at a time</p></div><span className="text-xl text-white/80">↗</span></div>
          </div>
        </div>
      </section>
      <section className="border-y border-line bg-white/45"><div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20"><div className="mb-10 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Built around your attention</p><h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">Structure that gives you room to think.</h2></div><div className="grid gap-4 md:grid-cols-3">{features.map((feature) => <article key={feature.number} className="rounded-3xl border border-line bg-white/75 p-6 sm:p-7"><p className="text-xs font-semibold text-stone-400">{feature.number}</p><h3 className="mt-8 text-lg font-semibold tracking-tight">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p></article>)}</div></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-10"><p>© {new Date().getFullYear()} Gara. Make room for what matters.</p><p>Focus independently. Make progress together.</p></footer>
    </main>
  );
}
