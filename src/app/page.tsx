import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTrackTheme } from "@/lib/courseTheme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KubeTutor — Learn Docker & Kubernetes",
  description:
    "Structured, interactive learning paths for Docker and Kubernetes. Practice with flashcards, quizzes, and real lesson content.",
};

const features = [
  {
    icon: "📚",
    title: "Structured Courses",
    description:
      "Curated learning paths that take you from containers to full Kubernetes orchestration, step by step.",
  },
  {
    icon: "🃏",
    title: "Flashcard Drills",
    description:
      "Reinforce key concepts with interactive flip-cards covering Docker commands, Kubernetes objects, and more.",
  },
  {
    icon: "🧠",
    title: "Module Quizzes",
    description:
      "Test your understanding at the end of every module with multiple-choice quizzes and instant feedback.",
  },
  {
    icon: "🗺️",
    title: "Visual Roadmap",
    description:
      "Navigate an interactive skill tree, diagnose real-world problems, and pick up pro tips from senior engineers.",
  },
];

const tracks = [
  {
    emoji: "🐳",
    title: "Docker Foundations",
    description:
      "Containers, images, volumes, networks, and Docker Compose — everything you need to ship software reliably.",
    href: "/courses",
    color: "blue",
  },
  {
    emoji: "☸️",
    title: "Kubernetes Essentials",
    description:
      "Pods, Deployments, Services, ConfigMaps, Ingress and beyond — master the orchestration layer.",
    href: "/courses",
    color: "violet",
  },
  {
    emoji: "🐧",
    title: "Linux & Shell Essentials",
    description:
      "Master the command line — filesystem navigation, permissions, processes, and the tools every engineer relies on daily.",
    href: "/courses",
    color: "orange",
  },
  {
    emoji: "🔀",
    title: "Git & DevOps Fundamentals",
    description:
      "From first commit to CI/CD pipelines — learn version control, branching strategies, and modern delivery practices.",
    href: "/courses",
    color: "emerald",
  },
];

const quickActions = [
  { icon: "🃏", title: "Flashcards", desc: "Review key concepts in short bursts.", href: "/flashcards" },
  { icon: "🗺️", title: "Roadmap", desc: "Visualise your path and track skills.", href: "/roadmap" },
  { icon: "📚", title: "Courses", desc: "Jump back into structured lessons.", href: "/courses" },
];

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    const [courses, lessonsCompleted, quizzesTaken, totalLessons] = await Promise.all([
      prisma.course.findMany({ orderBy: { order: "asc" } }),
      prisma.userProgress.count({ where: { userId: session.userId, completed: true } }),
      prisma.quizResult.count({ where: { userId: session.userId } }),
      prisma.lesson.count(),
    ]);

    const pct = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

    return (
      <main className="flex-1 bg-gray-50">
        {/* Dashboard hero */}
        <section className="relative overflow-hidden bg-slate-900 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-[320px] w-[320px] rounded-full bg-violet-600/15 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="animate-fade-in-up max-w-xl">
                <p className="text-xs font-bold tracking-[0.2em] text-blue-300 uppercase">Dashboard</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-5xl">
                  Welcome back! 👋
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-400">
                  Signed in as <span className="font-semibold text-slate-200">{session.email}</span>. Keep the momentum going.
                </p>
                {/* Overall progress bar */}
                <div className="mt-6">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Overall progress</span>
                    <span className="text-blue-300">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{lessonsCompleted} of {totalLessons} lessons completed</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 lg:gap-4 shrink-0">
                {[
                  { label: "Lessons Done", value: lessonsCompleted, icon: "✅", color: "from-blue-600/20 to-blue-800/10 border-blue-500/25" },
                  { label: "Quizzes Taken", value: quizzesTaken, icon: "🧠", color: "from-violet-600/20 to-violet-800/10 border-violet-500/25" },
                  { label: "Courses", value: courses.length, icon: "📚", color: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/25" },
                ].map((s) => (
                  <div key={s.label} className={`animate-float flex flex-col items-center gap-1 rounded-2xl border bg-gradient-to-br ${s.color} px-4 py-5 text-center backdrop-blur-sm`}>
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-3xl font-black text-white">{s.value}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
          {/* Courses */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
                <p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p>
              </div>
              <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                Browse all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course, i) => (
                <article
                  key={course.id}
                  className="animate-fade-in-up group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{getTrackTheme(course.slug).icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">{course.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500 line-clamp-2">{course.description}</p>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all group-hover:gap-2"
                      >
                        Continue learning →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-5 text-2xl font-bold text-slate-900">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickActions.map((a, i) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="animate-fade-in-up group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-3xl transition-transform duration-200 group-hover:scale-110">{a.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ── Logged-out marketing view ────────────────────────── */
  return (
    <main className="flex-1 bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="animate-slide-in-left text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
              Free · Open · Self-paced
            </p>
            <h1 className="animate-fade-in-up delay-100 mt-4 text-5xl leading-tight font-bold tracking-tight lg:text-6xl">
              Master Docker &amp; Kubernetes
            </h1>
            <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              KubeTutor is a structured, interactive learning platform built to take you from zero
              to production-ready with containers and orchestration.
            </p>
            <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="animate-pulse-glow-blue rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                Browse Courses
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in-up">
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">How KubeTutor works</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg hover:border-blue-200"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl transition-transform duration-300 hover:scale-110">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">
              Learning tracks
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Pick your path</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track, i) => (
              <Link
                key={track.title}
                href={track.href}
                className="animate-fade-in-up group rounded-3xl border border-slate-200 bg-gray-50 p-8 transition hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{track.emoji}</div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">{track.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{track.description}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-all duration-200 group-hover:gap-2">
                  Start learning →
                </span>
              </Link>
            ))}
            {/* Roadmap card */}
            <Link
              href="/roadmap"
              className="animate-fade-in-up group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 transition hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/20"
              style={{ animationDelay: `${tracks.length * 120}ms` }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at 70% 30%, #7C3AED 0%, transparent 60%), radial-gradient(circle at 20% 80%, #0891B2 0%, transparent 60%)",
                }}
              />
              <div className="relative text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">🗺️</div>
              <h3 className="relative mt-4 text-2xl font-semibold text-white">Skill Roadmap</h3>
              <p className="relative mt-3 text-base leading-7 text-slate-400">
                Interactive skill tree, common problems, and pro tips — all in one place.
              </p>
              <span className="relative mt-4 inline-flex text-sm font-semibold text-violet-400 group-hover:text-violet-300">
                Explore roadmap →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up rounded-3xl bg-blue-600 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-base leading-7 text-blue-100">
            Create a free account to save your progress, take quizzes, and track what you&apos;ve learned.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="animate-bounce-in rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 hover:scale-105 active:scale-95"
            >
              Sign Up Free
            </Link>
            <Link
              href="/flashcards"
              className="animate-bounce-in delay-150 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              Try Flashcards
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
