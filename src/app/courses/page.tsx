import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTrackTheme, totalLessons } from "@/lib/courseTheme";

export const metadata: Metadata = {
  title: "KubeTutor | Courses",
  description: "Browse Docker and Kubernetes learning tracks.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        select: {
          slug: true,
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: {
        select: { modules: true },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <main className="flex-1 bg-slate-50">
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Learning Library</p>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Choose your next platform skill track</h1>
            <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
              Build hands-on Docker and Kubernetes knowledge through guided modules, structured lessons,
              and clear next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => {
            const theme = getTrackTheme(course.slug);
            const lessonCount = totalLessons(course.modules);
            const firstModule = course.modules[0];

            return (
              <article
                key={course.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`h-2 ${theme.heroClass}`} />
                <div className="p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{theme.icon}</span>
                      <div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme.badgeClass}`}>
                          {theme.label}
                        </span>
                        <h2 className="mt-4 text-2xl font-bold text-slate-900">{course.title}</h2>
                        <p className="mt-3 text-base leading-7 text-slate-600">{course.description}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${theme.badgeClass}`}>
                      {lessonCount} lessons
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      {course._count.modules} modules
                    </span>
                    <span className={`rounded-full px-3 py-1 font-medium ${theme.mutedBadgeClass}`}>
                      {lessonCount} lessons
                    </span>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${theme.buttonClass}`}
                    >
                      Explore course
                    </Link>
                    <Link
                      href={firstModule ? `/courses/${course.slug}/${firstModule.slug}` : `/courses/${course.slug}`}
                      className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Start first module
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
