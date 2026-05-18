import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminLessonForm from "@/components/AdminLessonForm";

export const metadata: Metadata = {
  title: "KubeTutor | Admin — Lessons",
};

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    include: { module: { include: { course: true } } },
    orderBy: [
      { module: { course: { order: "asc" } } },
      { module: { order: "asc" } },
      { order: "asc" },
    ],
  });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Lessons</h1>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Create New Lesson</h2>
          <AdminLessonForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Existing Lessons ({lessons.length})
          </h2>
          {lessons.length === 0 ? (
            <p className="text-sm text-slate-500">No lessons yet.</p>
          ) : (
            <div className="space-y-3">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-xs font-semibold text-blue-600">
                      {l.module.course.title} · {l.module.title}
                    </p>
                    <p className="font-semibold text-slate-900">{l.title}</p>
                    <p className="text-xs text-slate-500">/{l.slug}</p>
                  </div>
                  <span className="text-sm text-slate-400">Order: {l.order}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
