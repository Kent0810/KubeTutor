import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "KubeTutor | Dashboard",
  description: "Track your Docker and Kubernetes learning progress.",
};

export const dynamic = "force-dynamic";

const quickLinks = [
  { title: "Courses", href: "/courses", description: "Jump back into structured lessons." },
  { title: "Flashcards", href: "/flashcards", description: "Review key concepts in short bursts." },
  { title: "Quizzes", href: "/quizzes", description: "Test your module knowledge." },
];

export default async function DashboardPage() {
  const session = await getSession();

  const [courses, lessonsCompleted, quizzesTaken] = await Promise.all([
    prisma.course.findMany({ orderBy: { order: "asc" } }),
    session
      ? prisma.userProgress.count({ where: { userId: session.userId, completed: true } })
      : Promise.resolve(0),
    session ? prisma.quizResult.count({ where: { userId: session.userId } }) : Promise.resolve(0),
  ]);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl lg:p-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
            Dashboard
          </p>
          {session ? (
            <>
              <h1 className="mt-3 text-4xl font-bold">Welcome back! 👋</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Keep up the great work, <strong>{session.email}</strong>. Pick up where you left
                off.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-4xl font-bold">Welcome to KubeTutor</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Sign in to track your progress, take quizzes, and pick up where you left off.
              </p>
              <div className="mt-5 flex gap-4">
                <Link
                  href="/auth/login"
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Sign Up Free
                </Link>
              </div>
            </>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Courses Available", value: courses.length.toString() },
            { label: "Lessons Completed", value: lessonsCompleted.toString() },
            { label: "Quizzes Taken", value: quizzesTaken.toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Recent courses</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Continue exploring the foundational DevOps topics available in KubeTutor.
                </p>
              </div>
              <Link
                href="/courses"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Browse all
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-md"
                >
                  <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open course →
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Quick links</h2>
            <div className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-900">{link.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{link.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
