import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrackTheme, totalLessons } from "@/lib/courseTheme";

export const metadata: Metadata = {
  title: "KubeTutor | Course Details",
  description: "Explore modules and lessons in a KubeTutor course.",
};

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const theme = getTrackTheme(course.slug);
  const lessonCount = totalLessons(course.modules);

  return (
    <main className="flex-1 bg-slate-50">
      <section className={`${theme.heroClass} text-white`}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex text-sm font-semibold text-white/80 transition hover:text-white">
            ← Back to courses
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">{theme.icon}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em]">
                  {theme.label} track
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{course.title}</h1>
              <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">{course.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-80">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">Modules</p>
                <p className="mt-2 text-2xl font-bold">{course.modules.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">Lessons</p>
                <p className="mt-2 text-2xl font-bold">{lessonCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {course.modules.map((module) => (
            <details
              key={module.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              open={module.order === 1}
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: theme.color }} />
              <summary className="list-none cursor-pointer px-6 py-6 lg:px-8 [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    >
                      {module.order}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Module {module.order}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">{module.title}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{module.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${theme.badgeClass}`}>
                      {module._count.lessons} lessons
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-slate-100 px-6 py-6 lg:px-8">
                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/${module.slug}/${lesson.slug}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {lesson.order}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Lesson {lesson.order}
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">{lesson.title}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: theme.color }}>
                        Open lesson →
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-5">
                  <Link
                    href={`/courses/${course.slug}/${module.slug}`}
                    className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${theme.buttonClass}`}
                  >
                    Open module page
                  </Link>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
