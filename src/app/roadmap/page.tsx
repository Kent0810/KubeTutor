import type { Metadata } from "next";
import HomeTabs from "@/components/HomeTabs";

export const metadata: Metadata = {
  title: "Roadmap — KubeTutor",
  description:
    "Interactive skill tree, common Docker & Kubernetes problems, and pro tips to level up your container engineering.",
};

const PATH = [
  {
    icon: "🐳",
    label: "Docker",
    sub: "Foundations",
    desc: "CLI · Images · Volumes · Compose · Multi-stage builds",
    skills: 8,
    color: "from-blue-500 to-cyan-500",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/25",
    pill: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  {
    icon: "☸️",
    label: "Kubernetes",
    sub: "Essentials",
    desc: "Pods · Services · Deployments · RBAC · Ingress",
    skills: 8,
    color: "from-violet-500 to-purple-600",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/25",
    pill: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  },
  {
    icon: "🚀",
    label: "Production",
    sub: "Engineering",
    desc: "Helm · CI/CD · Observability · Security · GitOps",
    skills: 4,
    color: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/25",
    pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
];

export default function RoadmapPage() {
  return (
    <main className="flex-1 bg-slate-950">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-56 -left-56 h-[600px] w-[600px] rounded-full bg-blue-600/12 blur-[80px]" />
          <div className="absolute -right-56 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/8 blur-[60px]" />
        </div>
        {/* Dot-grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 sm:px-6 lg:px-8">
          {/* Top badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-blue-300 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Interactive · Self-paced · Free
          </div>

          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            {/* Left: headline */}
            <div className="animate-fade-in-up max-w-2xl">
              <h1 className="text-5xl font-black leading-[1.06] tracking-tight lg:text-7xl">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
                  Your Learning
                </span>
                <br />
                <span className="text-white">Roadmap</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">
                Master containers — from Docker basics to production Kubernetes. Navigate the
                interactive skill tree, diagnose real-world failures, and pick up pro tips used
                by senior engineers every day.
              </p>
            </div>

            {/* Right: stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:gap-4 xl:grid-cols-4">
              {[
                { v: "20", l: "Skills", i: "🎯", c: "from-blue-600/20 to-blue-900/10 border-blue-500/25 hover:border-blue-400/60 hover:shadow-blue-500/20" },
                { v: "3", l: "Tracks", i: "🛤️", c: "from-violet-600/20 to-violet-900/10 border-violet-500/25 hover:border-violet-400/60 hover:shadow-violet-500/20" },
                { v: "14", l: "Diagnostics", i: "🔥", c: "from-rose-600/20 to-rose-900/10 border-rose-500/25 hover:border-rose-400/60 hover:shadow-rose-500/20" },
                { v: "14", l: "Pro Tips", i: "💡", c: "from-amber-600/20 to-amber-900/10 border-amber-500/25 hover:border-amber-400/60 hover:shadow-amber-500/20" },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={`animate-float flex flex-col items-center gap-1.5 rounded-2xl border bg-gradient-to-br ${s.c} px-5 py-5 text-center backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <span className="text-3xl">{s.i}</span>
                  <span className="text-4xl font-black leading-none text-white">{s.v}</span>
                  <span className="text-xs font-semibold text-slate-400">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Learning Path strip ─────────────────────────── */}
        <div className="relative border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="mb-6 text-center text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
              The Path
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
              {PATH.map((track, i) => (
                <div key={track.label} className="flex flex-1 flex-col sm:flex-row sm:items-center">
                  {/* Card */}
                  <div
                    className={`group relative flex-1 overflow-hidden rounded-2xl border ${track.border} bg-white/4 backdrop-blur-sm p-5 transition-all duration-200 hover:bg-white/8 hover:shadow-xl ${track.glow}`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${track.color}`}
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{track.icon}</span>
                      <div>
                        <p className="font-black text-white">
                          {track.label}
                          <span className="ml-1.5 text-slate-400 font-normal">·</span>
                          <span className="ml-1.5 text-slate-400 font-semibold text-sm">{track.sub}</span>
                        </p>
                        <div className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${track.pill}`}>
                          {track.skills} skills
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{track.desc}</p>
                  </div>
                  {/* Arrow connector */}
                  {i < PATH.length - 1 && (
                    <div className="flex items-center justify-center sm:px-3 py-2 sm:py-0">
                      <svg className="h-5 w-5 rotate-90 text-slate-600 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="bg-slate-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <HomeTabs />
        </div>
      </div>
    </main>
  );
}
