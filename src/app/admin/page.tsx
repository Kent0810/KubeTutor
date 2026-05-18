import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "KubeTutor | Admin",
  description: "KubeTutor admin overview.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [courseCount, moduleCount, lessonCount, flashcardCount, userCount, quizCount] =
    await Promise.all([
      prisma.course.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.flashcard.count(),
      prisma.user.count(),
      prisma.quiz.count(),
    ]);

  const stats = [
    { label: "Courses", value: courseCount, href: "/admin/courses" },
    { label: "Modules", value: moduleCount, href: "/admin/modules" },
    { label: "Lessons", value: lessonCount, href: "/admin/lessons" },
    { label: "Quizzes", value: quizCount, href: "/admin/quizzes" },
    { label: "Flashcards", value: flashcardCount, href: "/admin/flashcards" },
    { label: "Users", value: userCount, href: "#" },
  ];

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Admin Panel
          </p>
          <h1 className="mt-3 text-4xl font-bold">Content Overview</h1>
          <p className="mt-3 text-slate-300">
            Manage courses, modules, lessons, quizzes, and flashcards.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">{stat.value}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { href: "/admin/courses", label: "Manage Courses", icon: "📚" },
            { href: "/admin/modules", label: "Manage Modules", icon: "📂" },
            { href: "/admin/lessons", label: "Manage Lessons", icon: "📄" },
            { href: "/admin/quizzes", label: "Manage Quizzes", icon: "🧠" },
            { href: "/admin/flashcards", label: "Manage Flashcards", icon: "🃏" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="text-3xl">{link.icon}</span>
              <span className="text-base font-semibold text-slate-900">{link.label}</span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
