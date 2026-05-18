import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "KubeTutor | Quizzes",
  description: "Test your Docker and Kubernetes knowledge with module quizzes.",
};

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      _count: { select: { questions: true } },
      module: { include: { course: true } },
    },
    orderBy: { module: { course: { order: "asc" } } },
  });

  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Practice
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Quizzes</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Test your understanding with module-based multiple-choice quizzes.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-4xl">📝</p>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No quizzes yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Quizzes will appear here once they are added to course modules.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  {quiz.module.course.title} · {quiz.module.title}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{quiz.title}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                </p>
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Take Quiz
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
