import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTrackTheme, readingTime } from "@/lib/courseTheme";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "KubeTutor | Module Details",
  description: "Review lessons inside a KubeTutor module.",
};

export const dynamic = "force-dynamic";

type ModuleDetailPageProps = {
  params: Promise<{ slug: string; moduleSlug: string }>;
};

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { slug, moduleSlug } = await params;
  const session = await getSession();

  const moduleRecord = await prisma.module.findFirst({
    where: { slug: moduleSlug, course: { slug } },
    include: {
      course: { include: { modules: { orderBy: { order: "asc" }, select: { slug: true, order: true, title: true } } } },
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!moduleRecord) notFound();

  const theme = getTrackTheme(moduleRecord.course.slug);

  let completedIds = new Set<string>();
  if (session && moduleRecord.lessons.length > 0) {
    const rows = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        lessonId: { in: moduleRecord.lessons.map((l) => l.id) },
        completed: true,
      },
      select: { lessonId: true },
    });
    completedIds = new Set(rows.map((r) => r.lessonId));
  }

  const completedCount = completedIds.size;
  const pct =
    moduleRecord.lessons.length > 0
      ? Math.round((completedCount / moduleRecord.lessons.length) * 100)
      : 0;

  const totalMinutes = moduleRecord.lessons.reduce((s, l) => {
    const m = readingTime(l.content).match(/(\d+)/);
    return s + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  const prevModule = moduleRecord.course.modules.find((m) => m.order === moduleRecord.order - 1);
  const nextModule = moduleRecord.course.modules.find((m) => m.order === moduleRecord.order + 1);

  // Pick a "resume" lesson — first uncompleted
  const resumeLesson = moduleRecord.lessons.find((l) => !completedIds.has(l.id)) ?? moduleRecord.lessons[0];

  return (
    <main className="flex-1 bg-slate-50">
      <section className={`${theme.heroClass} text-white`}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/courses" className="hover:text-white transition">
              Courses
            </Link>
            <span>/</span>
            <Link href={`/courses/${moduleRecord.course.slug}`} className="hover:text-white transition">
              {moduleRecord.course.title}
            </Link>
            <span>/</span>
            <span className="font-medium text-white">{moduleRecord.title}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">{theme.icon}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em]">
                  Module {moduleRecord.order} of {moduleRecord.course.modules.length}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  {moduleRecord.lessons.length} lessons
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  ⏱ ~{totalMinutes}m read
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{moduleRecord.title}</h1>
              <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">{moduleRecord.description}</p>

              {session && moduleRecord.lessons.length > 0 ? (
                <div className="mt-6 max-w-lg">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-white/80">
                    <span>Module progress</span>
                    <span className="font-semibold">
                      {completedCount} / {moduleRecord.lessons.length} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : null}

              {resumeLesson ? (
                <Link
                  href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${resumeLesson.slug}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100"
                >
                  {completedCount > 0 && completedCount < moduleRecord.lessons.length
                    ? "Resume lesson"
                    : completedCount === moduleRecord.lessons.length && completedCount > 0
                      ? "Review module"
                      : "Start module"}{" "}
                  →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ol className="relative space-y-4 border-slate-200 sm:border-l sm:pl-8">
          {moduleRecord.lessons.map((lesson) => {
            const done = completedIds.has(lesson.id);
            return (
              <li key={lesson.id} className="relative">
                <span
                  className={`absolute -left-[42px] hidden h-7 w-7 items-center justify-center rounded-full border-4 border-slate-50 text-xs font-bold text-white sm:flex`}
                  style={{ backgroundColor: done ? "#10b981" : theme.color }}
                  aria-hidden
                >
                  {done ? "✓" : lesson.order}
                </span>
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-1.5 w-full" style={{ backgroundColor: done ? "#10b981" : theme.color }} />
                  <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm sm:hidden"
                        style={{ backgroundColor: done ? "#10b981" : theme.color }}
                      >
                        {done ? "✓" : lesson.order}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Lesson {lesson.order}
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-slate-900">{lesson.title}</h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${theme.badgeClass}`}>
                            ⏱ {readingTime(lesson.content)}
                          </span>
                          {done ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                              ✓ Completed
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${lesson.slug}`}
                      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${theme.buttonClass}`}
                    >
                      {done ? "Review" : "Start lesson"}
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        {(prevModule || nextModule) && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {prevModule ? (
              <Link
                href={`/courses/${moduleRecord.course.slug}/${prevModule.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-wider text-slate-400">← Previous module</p>
                <p className="mt-1 font-semibold text-slate-900">{prevModule.title}</p>
              </Link>
            ) : (
              <div />
            )}
            {nextModule ? (
              <Link
                href={`/courses/${moduleRecord.course.slug}/${nextModule.slug}`}
                className="rounded-2xl border border-transparent p-5 text-right text-white shadow-sm transition hover:shadow-md"
                style={{ backgroundColor: theme.color }}
              >
                <p className="text-xs uppercase tracking-wider opacity-80">Next module →</p>
                <p className="mt-1 font-semibold">{nextModule.title}</p>
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
