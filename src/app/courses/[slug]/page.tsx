import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTrackTheme, readingTime, totalLessons } from "@/lib/courseTheme";
import { prisma } from "@/lib/prisma";

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
  const session = await getSession();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        include: {
          lessons: { orderBy: { order: "asc" } },
          _count: { select: { lessons: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) notFound();

  const theme = getTrackTheme(course.slug);
  const lessonCount = totalLessons(course.modules);
  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  let completedIds = new Set<string>();
  if (session && allLessonIds.length > 0) {
    const rows = await prisma.userProgress.findMany({
      where: { userId: session.userId, lessonId: { in: allLessonIds }, completed: true },
      select: { lessonId: true },
    });
    completedIds = new Set(rows.map((r) => r.lessonId));
  }

  const totalReadingMinutes = course.modules.reduce(
    (sum, m) =>
      sum +
      m.lessons.reduce((s, l) => {
        const t = readingTime(l.content).match(/(\d+)/);
        return s + (t ? parseInt(t[1], 10) : 0);
      }, 0),
    0
  );

  const completedCount = completedIds.size;
  const overallPct = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  // Find next lesson to resume
  let resumeHref = `/courses/${course.slug}`;
  outer: for (const m of course.modules) {
    for (const l of m.lessons) {
      if (!completedIds.has(l.id)) {
        resumeHref = `/courses/${course.slug}/${m.slug}/${l.slug}`;
        break outer;
      }
    }
  }
  const allDone = completedCount > 0 && completedCount === lessonCount;

  return (
    <main className="flex-1 bg-slate-50">
      <section className={`${theme.heroClass} text-white`}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex text-sm font-semibold text-white/80 transition hover:text-white"
          >
            ← Back to courses
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">{theme.icon}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-[0.25em] uppercase">
                  {theme.label} track
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{course.title}</h1>
              <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">
                {course.description}
              </p>

              {session && allLessonIds.length > 0 ? (
                <div className="mt-6 max-w-lg">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-white/80">
                    <span>Your progress</span>
                    <span className="font-semibold">
                      {completedCount} / {lessonCount} lessons · {overallPct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <Link
                    href={resumeHref}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100"
                  >
                    {allDone
                      ? "Review from the beginning"
                      : completedCount > 0
                        ? "Resume learning"
                        : "Start course"}{" "}
                    →
                  </Link>
                </div>
              ) : !session ? (
                <Link
                  href="/auth/login"
                  className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100"
                >
                  Sign in to track your progress
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs tracking-wider text-white/70 uppercase">Modules</p>
                <p className="mt-2 text-2xl font-bold">{course.modules.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs tracking-wider text-white/70 uppercase">Lessons</p>
                <p className="mt-2 text-2xl font-bold">{lessonCount}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs tracking-wider text-white/70 uppercase">Reading</p>
                <p className="mt-2 text-2xl font-bold">~{totalReadingMinutes}m</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {course.modules.map((module) => {
            const moduleCompleted = module.lessons.filter((l) => completedIds.has(l.id)).length;
            const modulePct =
              module.lessons.length > 0
                ? Math.round((moduleCompleted / module.lessons.length) * 100)
                : 0;
            const moduleDone =
              module.lessons.length > 0 && moduleCompleted === module.lessons.length;

            return (
              <details
                key={module.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                open={module.order === 1}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: theme.color }} />
                <summary className="cursor-pointer list-none px-6 py-6 lg:px-8 [&::-webkit-details-marker]:hidden">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
                        style={{ backgroundColor: theme.color }}
                      >
                        {moduleDone ? "✓" : module.order}
                      </span>
                      <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
                          Module {module.order}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">{module.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                          {module.description}
                        </p>

                        {session && module.lessons.length > 0 ? (
                          <div className="mt-4 flex max-w-sm items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${modulePct}%`, backgroundColor: theme.color }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {moduleCompleted}/{module.lessons.length}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${theme.badgeClass}`}
                      >
                        {module._count.lessons} lessons
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-slate-100 px-6 py-6 lg:px-8">
                  <div className="space-y-3">
                    {module.lessons.map((lesson) => {
                      const done = completedIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.slug}/${module.slug}/${lesson.slug}`}
                          className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                done
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {done ? "✓" : lesson.order}
                            </span>
                            <div>
                              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                Lesson {lesson.order} · ⏱ {readingTime(lesson.content)}
                              </p>
                              <p className="mt-1 font-semibold text-slate-900">{lesson.title}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: theme.color }}>
                            {done ? "Review →" : "Open lesson →"}
                          </span>
                        </Link>
                      );
                    })}
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
            );
          })}
        </div>
      </section>
    </main>
  );
}
