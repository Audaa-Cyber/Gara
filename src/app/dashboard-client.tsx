"use client";

import {
  AlarmClock,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Compass,
  Flame,
  Leaf,
  ListTodo,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

type Task = {
  id: number;
  title: string;
  project: string;
  time?: string;
  done: boolean;
  priority?: "high" | "medium";
};

const initialTasks: Task[] = [
  { id: 1, title: "Map out the onboarding flow", project: "Gara redesign", time: "25 min", done: false, priority: "high" },
  { id: 2, title: "Review feedback from the team", project: "Studio", time: "15 min", done: false, priority: "medium" },
  { id: 3, title: "Read chapter 04 — Deep Work", project: "Personal", time: "30 min", done: false },
  { id: 4, title: "Tidy up project notes", project: "Gara redesign", done: true },
];

const navigation = [
  { label: "Home", icon: Compass },
  { label: "My tasks", icon: ListTodo },
  { label: "Focus", icon: AlarmClock },
  { label: "Rooms", icon: Users },
];

const projectColors: Record<string, string> = {
  "Gara redesign": "#7b8f70",
  Studio: "#c39a63",
  Personal: "#8996bd",
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function DashboardClient({ userName }: { userName: string }) {
  const [activeNav, setActiveNav] = useState("Home");
  const [tasks, setTasks] = useState(initialTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [duration, setDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("Forest");
  const [showThemes, setShowThemes] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          setNotice(timerMode === "focus" ? "Focus session complete. Take a little breather." : "Break complete. Ready for another round?");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, timerMode]);

  const completedCount = tasks.filter((task) => task.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const currentDuration = duration || 25 * 60;
  const timerProgress = Math.max(0, Math.min(100, ((currentDuration - secondsLeft) / currentDuration) * 100));
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [{ id: Date.now(), title, project: "Personal", done: false }, ...current]);
    setNewTask("");
    setIsAddingTask(false);
  }

  function changeTimerMode(mode: "focus" | "break") {
    const nextDuration = mode === "focus" ? 25 * 60 : 5 * 60;
    setTimerMode(mode);
    setDuration(nextDuration);
    setSecondsLeft(nextDuration);
    setIsRunning(false);
    setNotice("");
  }

  function resetTimer() {
    setSecondsLeft(duration);
    setIsRunning(false);
    setNotice("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand flex items-center gap-3 px-3 pb-10">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#60795d] text-white shadow-sm">
            <Leaf size={19} strokeWidth={2.2} />
          </div>
          <div className="brand-word">
            <div className="font-display text-[19px] font-bold tracking-[-0.8px]">gara<span className="text-[#71866b]">.</span></div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[1.4px] text-[#9a9e94]">Make room for focus</div>
          </div>
        </div>

        <div className="workspace-label mb-3 flex items-center justify-between px-3">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#a1a59b]">Workspace</span>
          <button className="rounded-md p-1 text-[#9a9e94] hover:bg-[#f0f1eb]" aria-label="Workspace settings"><Settings2 size={14} /></button>
        </div>
        <nav className="sidebar-nav flex flex-col gap-1" aria-label="Workspace">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className="nav-item" aria-current={activeNav === label ? "page" : undefined} onClick={() => setActiveNav(label)}>
              <Icon size={17} strokeWidth={1.8} />
              <span className="nav-label">{label}</span>
              {label === "Rooms" && <span className="nav-trailing ml-auto rounded-full bg-[#edf0e9] px-2 py-0.5 text-[10px] text-[#687563]">2</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-projects mt-9">
          <div className="sidebar-section-label mb-3 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#a1a59b]">Your projects</span>
            <button className="rounded-md p-1 text-[#9a9e94] hover:bg-[#f0f1eb]" aria-label="Add project"><Plus size={14} /></button>
          </div>
          <div className="flex flex-col gap-1">
            {Object.entries(projectColors).map(([project, color]) => (
              <button key={project} className="nav-item" onClick={() => setActiveNav(project)}>
                <span className="h-2.5 w-2.5 rounded-[4px]" style={{ background: color }} />
                <span className="nav-label">{project}</span>
                <span className="nav-trailing ml-auto text-[11px] text-[#b1b4ac]">{project === "Gara redesign" ? "4" : project === "Studio" ? "2" : "3"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom mt-auto">
          <div className="mb-4 rounded-xl border border-[#e9ebe3] bg-[#f5f6f0] p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[#5e7757]"><Sparkles size={14} /><span className="text-xs font-semibold">A little room to grow</span></div>
            <p className="sidebar-bottom-copy text-[11px] leading-[1.65] text-[#858b7e]">Small, steady steps add up. You’re doing better than you think.</p>
          </div>
          <button className="nav-item"><CircleHelp size={17} /><span className="nav-label">Help & feedback</span></button>
          <button className="nav-item"><Settings2 size={17} /><span className="nav-label">Settings</span></button>
          <div className="mt-4 flex items-center gap-3 border-t border-[#e9ebe3] px-2 pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e8d9c9] text-xs font-semibold text-[#795e48]">{userName.trim().charAt(0).toUpperCase() || "G"}</div>
            <div className="brand-word min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[#41473d]">{userName}</div>
              <div className="mt-0.5 text-[10px] text-[#999e93]">Personal workspace</div>
            </div>
            <button className="brand-word rounded-md p-1 text-[#a0a49b] hover:bg-[#f0f1eb]" aria-label="Account menu"><MoreHorizontal size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="mb-9 flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-[#92978c]">
              <CalendarDays size={13} />
              <span>{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span>
            </div>
            <h1 className="font-display text-[27px] font-semibold tracking-[-1.1px] text-[#293026] sm:text-[31px]">{greeting}, {userName.split(" ")[0] || "there"}<span className="ml-1">☀️</span></h1>
            <p className="mt-1.5 text-[13px] text-[#858b80]">A fresh day to make a little progress.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e7e9e1] bg-white text-[#747b70] transition hover:bg-[#f7f8f3]" aria-label="Notifications">
              <Bell size={17} strokeWidth={1.7} />
              <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-[#cb8d68]" />
            </button>
            <button className="hidden h-10 items-center gap-2 rounded-xl bg-[#60795d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4f694b] sm:flex" onClick={() => { setIsAddingTask(true); setActiveNav("My tasks"); }}>
              <Plus size={15} /> New task
            </button>
          </div>
        </header>

        {notice && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#dce7d6] bg-[#f1f5ed] px-4 py-3 text-sm text-[#4c6848]" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Your progress">
          <div className="panel flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef2e9] text-[#6b8064]"><Target size={20} strokeWidth={1.7} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-[#93988e]">Tasks completed</p>
              <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[25px] font-semibold tracking-[-1px]">{completedCount}<span className="text-[16px] font-medium text-[#aeb2a8]">/{tasks.length}</span></span><span className="text-[10px] font-medium text-[#6e8a66]">{progress}%</span></div>
            </div>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#e7ece2] sm:flex"><span className="text-[10px] font-semibold text-[#71866b]">{progress}%</span></div>
          </div>
          <div className="panel flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#f6eee2] text-[#bb925c]"><Clock3 size={20} strokeWidth={1.7} /></div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-[#93988e]">Focus time</p>
              <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[25px] font-semibold tracking-[-1px]">1h 20m</span></div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-[#73906c]"><ArrowUpRight size={13} /> 12%</div>
          </div>
          <div className="panel flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#f5e9e6] text-[#bd806d]"><Flame size={20} strokeWidth={1.7} /></div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-[#93988e]">Focus streak</p>
              <div className="mt-1 flex items-baseline gap-2"><span className="font-display text-[25px] font-semibold tracking-[-1px]">4 days</span></div>
            </div>
            <span className="rounded-full bg-[#f8f0e9] px-2 py-1 text-[10px] font-medium text-[#b17d5c]">On a roll</span>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(330px,0.9fr)]">
          <div className="panel overflow-hidden">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <div className="mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#7e9676]" /><span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8b9285]">Your focus space</span></div>
                <h2 className="font-display text-[19px] font-semibold tracking-[-0.5px]">Find your flow</h2>
                <p className="mt-1 text-xs text-[#92978d]">One thing at a time. You’ve got this.</p>
              </div>
              <button onClick={() => setShowThemes((value) => !value)} className="flex items-center gap-1.5 rounded-lg border border-[#e9ebe4] px-2.5 py-2 text-[11px] font-medium text-[#777e72] transition hover:bg-[#f7f8f4]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme === "Forest" ? "#74886b" : theme === "Midnight" ? "#353d55" : theme === "Paper" ? "#c8ad85" : theme === "Studio" ? "#bf8f8a" : "#c2c9ba" }} />
                {theme}<ChevronDown size={13} />
              </button>
            </div>
            {showThemes && (
              <div className="mx-6 mt-3 flex flex-wrap gap-2 rounded-xl bg-[#f8f9f5] p-3">
                {["Minimal", "Midnight", "Paper", "Forest", "Studio"].map((option) => (
                  <button key={option} onClick={() => { setTheme(option); setShowThemes(false); }} className={`rounded-lg border px-3 py-1.5 text-[11px] transition ${theme === option ? "border-[#a9b9a1] bg-[#e9eee5] text-[#4e6749]" : "border-[#e8eae2] bg-white text-[#777d72] hover:border-[#cbd4c4]"}`}>{option}</button>
                ))}
              </div>
            )}
            <div className="relative mx-5 mt-5 flex flex-col items-center overflow-hidden rounded-[15px] bg-[#f4f6f0] px-4 pb-6 pt-5">
              <div className="soft-dots pointer-events-none absolute inset-0 opacity-35" />
              <div className="relative mb-4 flex rounded-full border border-[#e4e8df] bg-white/80 p-1">
                <button onClick={() => changeTimerMode("focus")} className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition ${timerMode === "focus" ? "bg-[#60795d] text-white shadow-sm" : "text-[#82897c] hover:text-[#3e493a]"}`}>Focus</button>
                <button onClick={() => changeTimerMode("break")} className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition ${timerMode === "break" ? "bg-[#60795d] text-white shadow-sm" : "text-[#82897c] hover:text-[#3e493a]"}`}>Short break</button>
              </div>
              <div className="timer-ring relative z-[1]" style={{ "--progress": `${timerProgress}%` } as CSSProperties & { "--progress": string }} aria-label={`${formatTime(secondsLeft)} remaining`}>
                <div className="timer-inner">
                  <span className="mb-1 text-[10px] font-medium uppercase tracking-[1.7px] text-[#a0a69a]">{isRunning ? "In the zone" : secondsLeft === 0 ? "All done" : "Time to focus"}</span>
                  <span className="font-display text-[39px] font-semibold tracking-[-2px] text-[#313b2e] tabular-nums">{formatTime(secondsLeft)}</span>
                  <span className="mt-1 text-[10px] text-[#939a8e]">{timerMode === "focus" ? "A little progress goes far" : "Step away for a moment"}</span>
                </div>
              </div>
              <div className="relative z-[1] mt-5 flex items-center gap-3">
                <button onClick={resetTimer} className="grid h-10 w-10 place-items-center rounded-full border border-[#e0e5da] bg-white text-[#7c8675] transition hover:bg-[#f8faf5]" aria-label="Reset timer"><ArrowDownRight size={16} className="rotate-45" /></button>
                <button onClick={() => { setNotice(""); if (secondsLeft === 0) setSecondsLeft(duration); setIsRunning((running) => !running); }} className="flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full bg-[#60795d] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4e684a]">
                  {isRunning ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                  {isRunning ? "Pause session" : "Start focusing"}
                </button>
                <button onClick={() => changeTimerMode(timerMode === "focus" ? "break" : "focus")} className="grid h-10 w-10 place-items-center rounded-full border border-[#e0e5da] bg-white text-[#7c8675] transition hover:bg-[#f8faf5]" aria-label="Switch focus or break"><ArrowRight size={16} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4">
              <div className="flex items-center gap-2 text-[11px] text-[#8e9588]"><Command size={13} /><span>Make space for what matters.</span></div>
              <button onClick={() => setActiveNav("Focus")} className="flex items-center gap-1 text-[11px] font-semibold text-[#60795d] hover:text-[#3f5a3b]">Focus settings <ArrowUpRight size={13} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div><div className="mb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#999f92]">Today’s intention</div><h2 className="font-display text-[18px] font-semibold tracking-[-0.5px]">Make it meaningful.</h2></div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f3eee5] text-[#b69a6e]"><Sparkles size={17} /></div>
              </div>
              <p className="max-w-[310px] text-[13px] leading-[1.8] text-[#777f72]">You don’t have to do everything today. Just give your attention to the next right thing.</p>
              <div className="mt-5 flex items-center justify-between border-t border-[#eff0eb] pt-4">
                <span className="text-[11px] text-[#a0a59b]">A reminder from Gara</span>
                <span className="text-[11px] font-medium text-[#8b9a81]">Take it gently ↗</span>
              </div>
            </div>

            <div className="panel p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="font-display text-[17px] font-semibold tracking-[-0.4px]">Your week</h2><p className="mt-1 text-[11px] text-[#969c91]">Showing up is what counts.</p></div>
                <button className="rounded-lg p-2 text-[#9ba194] hover:bg-[#f5f6f1]" aria-label="More weekly progress options"><MoreHorizontal size={17} /></button>
              </div>
              <div className="flex h-[94px] items-end justify-between gap-2 px-1 pt-2">
                {[
                  { day: "M", value: 48, active: false },
                  { day: "T", value: 70, active: false },
                  { day: "W", value: 42, active: false },
                  { day: "T", value: 88, active: true },
                  { day: "F", value: 30, active: false },
                  { day: "S", value: 18, active: false },
                  { day: "S", value: 12, active: false },
                ].map((item, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-[70px] w-full items-end justify-center rounded-md bg-[#f4f5f0]">
                      <div className={`w-full max-w-[19px] rounded-t-[5px] transition-all ${item.active ? "bg-[#71866b]" : "bg-[#d7dfd1]"}`} style={{ height: `${item.value}%` }} />
                    </div>
                    <span className={`text-[10px] ${item.active ? "font-semibold text-[#526a4c]" : "text-[#a4a99f]"}`}>{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#eff0eb] pt-4">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#71866b]" /><span className="text-[11px] text-[#858c80]">Focus sessions</span></div>
                <div className="text-xs font-semibold text-[#4e5c48]">8 <span className="font-normal text-[#a0a59b]">this week</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <div>
              <div className="mb-1 flex items-center gap-2"><ListTodo size={14} className="text-[#7f9276]" /><span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#969d90]">A little at a time</span></div>
              <h2 className="font-display text-[18px] font-semibold tracking-[-0.5px]">Your tasks <span className="ml-1 text-sm font-medium text-[#a4aa9e]">{tasks.filter((task) => !task.done).length}</span></h2>
            </div>
            <button onClick={() => setIsAddingTask((value) => !value)} className="flex items-center gap-1.5 rounded-lg border border-[#e7e9e1] px-3 py-2 text-[11px] font-semibold text-[#65765e] transition hover:bg-[#f6f8f3]"><Plus size={14} /> Add task</button>
          </div>
          {isAddingTask && (
            <form onSubmit={addTask} className="mx-5 mb-3 flex gap-2 rounded-xl border border-[#dfe6d9] bg-[#f8faf6] p-2 sm:mx-6">
              <input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="What would you like to make progress on?" className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none placeholder:text-[#a6aca0]" aria-label="New task title" />
              <button type="submit" className="rounded-lg bg-[#60795d] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#4e684a]">Add</button>
              <button type="button" onClick={() => { setIsAddingTask(false); setNewTask(""); }} className="rounded-lg px-2 text-[#92998c] hover:bg-white" aria-label="Cancel adding task"><X size={15} /></button>
            </form>
          )}
          <div className="divide-y divide-[#f0f1ec] px-5 sm:px-6">
            {tasks.map((task) => (
              <div key={task.id} className="group flex items-center gap-3 py-3.5">
                <button className="task-check" aria-pressed={task.done} aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done && <Check size={12} strokeWidth={2.8} />}</button>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[12px] font-medium transition ${task.done ? "text-[#a7aca2] line-through" : "text-[#454c40]"}`}>{task.title}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: projectColors[task.project] || "#8996bd" }} />
                    <span className="text-[10px] text-[#9ba195]">{task.project}</span>
                    {task.time && <><span className="text-[#d5d8d0]">·</span><span className="flex items-center gap-1 text-[10px] text-[#a0a69a]"><Clock3 size={10} />{task.time}</span></>}
                  </div>
                </div>
                {task.priority && !task.done && <span className={`hidden rounded-md px-2 py-1 text-[9px] font-medium sm:inline-flex ${task.priority === "high" ? "bg-[#f7eee8] text-[#b27f5f]" : "bg-[#f5f3e9] text-[#a19461]"}`}>{task.priority === "high" ? "Important" : "Medium"}</span>}
                <button className="rounded-md p-1.5 text-[#c1c5bb] opacity-0 transition hover:bg-[#f5f6f1] hover:text-[#737b6d] group-hover:opacity-100 focus:opacity-100" aria-label={`More options for ${task.title}`}><MoreHorizontal size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveNav("My tasks")} className="flex w-full items-center justify-center gap-2 border-t border-[#eff0eb] py-3.5 text-[11px] font-semibold text-[#7a8972] transition hover:bg-[#fafbf8]">See all tasks <ArrowRight size={13} /></button>
        </section>

        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-[#a3a89f]">
          <span>Made for the work that matters.</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#91a487]" /> Your space, at your pace.</span>
        </footer>
      </main>
    </div>
  );
}