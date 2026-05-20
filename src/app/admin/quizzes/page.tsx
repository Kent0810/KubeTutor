import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminQuizForm from "@/components/AdminQuizForm";

export const metadata: Metadata = {
  title: "KubeTutor | Admin — Quizzes",
};

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    where: { moduleId: { not: null } },
    include: {
      _count: { select: { questions: true } },
      module: { include: { course: true } },
    },
    orderBy: [{ module: { course: { order: "asc" } } }, { module: { order: "asc" } }],
  });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Quizzes</h1>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Create New Quiz</h2>
          <AdminQuizForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Existing Quizzes ({quizzes.length})
          </h2>
          {quizzes.length === 0 ? (
            <p className="text-sm text-slate-500">No quizzes yet.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q) => {
                if (!q.module) return null;

                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        {q.module.course.title} · {q.module.title}
                      </p>
                      <p className="font-semibold text-slate-900">{q.title}</p>
                      <p className="text-xs text-slate-500">{q._count.questions} questions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
