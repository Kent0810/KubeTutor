import type { Metadata } from "next";
import Link from "next/link";

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
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Track completed lessons and quiz scores on your personal dashboard as you move through each track.",
  },
];

const tracks = [
  {
    emoji: "🐳",
    title: "Docker Foundations",
    description:
      "Containers, images, volumes, networks, and Docker Compose — everything you need to ship software reliably.",
    href: "/courses",
  },
  {
    emoji: "☸️",
    title: "Kubernetes Essentials",
    description:
      "Pods, Deployments, Services, ConfigMaps, Ingress and beyond — master the orchestration layer.",
    href: "/courses",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1 bg-gray-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Free · Open · Self-paced
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              Master Docker &amp; Kubernetes
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              KubeTutor is a structured, interactive learning platform built to
              take you from zero to production-ready with containers and
              orchestration.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                Browse Courses
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            How KubeTutor works
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Learning tracks
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Pick your path
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tracks.map((track) => (
              <Link
                key={track.title}
                href={track.href}
                className="group rounded-3xl border border-slate-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="text-5xl">{track.emoji}</div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                  {track.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {track.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Start learning →
                </span>
              </Link>
            ))}
            {/* Roadmap card */}
            <Link
              href="/roadmap"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/20"
            >
              <div className="absolute inset-0 opacity-20"
                style={{ background: "radial-gradient(circle at 70% 30%, #7C3AED 0%, transparent 60%), radial-gradient(circle at 20% 80%, #0891B2 0%, transparent 60%)" }} />
              <div className="relative text-5xl">🗺️</div>
              <h3 className="relative mt-4 text-2xl font-semibold text-white">
                Skill Roadmap
              </h3>
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
        <div className="rounded-3xl bg-blue-600 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-base leading-7 text-blue-100">
            Create a free account to save your progress, take quizzes, and
            track what you&apos;ve learned.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
            >
              Sign Up Free
            </Link>
            <Link
              href="/flashcards"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Try Flashcards
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
