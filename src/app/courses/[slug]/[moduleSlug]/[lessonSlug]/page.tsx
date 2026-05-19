import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonContent from "@/components/LessonContent";
import LessonToc from "@/components/LessonToc";
import ReadingProgress from "@/components/ReadingProgress";
import { getSession } from "@/lib/auth";
import { getTrackTheme, readingTime } from "@/lib/courseTheme";
import { extractOutline, parseLessonContent } from "@/lib/lessonParser";
import { prisma } from "@/lib/prisma";
import LessonProgressButton from "./LessonProgressButton";

export const metadata: Metadata = {
  title: "KubeTutor | Lesson Viewer",
  description: "Read a KubeTutor lesson and continue through the course.",
};

export const dynamic = "force-dynamic";

type LessonViewerPageProps = {
  params: Promise<{ slug: string; moduleSlug: string; lessonSlug: string }>;
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function LessonViewerPage({ params }: LessonViewerPageProps) {
  const { slug, moduleSlug, lessonSlug } = await params;
  const session = await getSession();

  const moduleRecord = await prisma.module.findFirst({
    where: { slug: moduleSlug, course: { slug } },
    include: {
      course: true,
      lessons: { orderBy: { order: "asc" } },
    },
  });
  if (!moduleRecord) notFound();

  const currentLessonIndex = moduleRecord.lessons.findIndex((l) => l.slug === lessonSlug);
  if (currentLessonIndex === -1) notFound();

  const lesson = moduleRecord.lessons[currentLessonIndex];
  const previousLesson = currentLessonIndex > 0 ? moduleRecord.lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < moduleRecord.lessons.length - 1
      ? moduleRecord.lessons[currentLessonIndex + 1]
      : null;
  const theme = getTrackTheme(moduleRecord.course.slug);

  const outline = extractOutline(parseLessonContent(lesson.content));

  // Completion progress for the whole module (logged-in users)
  let isCompleted = false;
  let completedIds = new Set<string>();
  if (session) {
    const progressRows = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        lessonId: { in: moduleRecord.lessons.map((l) => l.id) },
        completed: true,
      },
      select: { lessonId: true },
    });
    completedIds = new Set(progressRows.map((p) => p.lessonId));
    isCompleted = completedIds.has(lesson.id);
  }

  const totalLessonsInModule = moduleRecord.lessons.length;
  const completedCount = completedIds.size;
  const progressPct =
    totalLessonsInModule > 0 ? Math.round((completedCount / totalLessonsInModule) * 100) : 0;

  return (
    <main className="flex-1 bg-slate-50">
      <ReadingProgress color={theme.color} />

      <div className={`${theme.heroClass} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/courses" className="transition hover:text-white">
              Courses
            </Link>
            <span>/</span>
            <Link href={`/courses/${moduleRecord.course.slug}`} className="transition hover:text-white">
              {moduleRecord.course.title}
            </Link>
            <span>/</span>
            <Link
              href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}`}
              className="transition hover:text-white"
            >
              {moduleRecord.title}
            </Link>
            <span>/</span>
            <span className="font-medium text-white">{lesson.title}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-3xl">{theme.icon}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Lesson {lesson.order} of {totalLessonsInModule}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  ⏱ {readingTime(lesson.content)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  {theme.label}
                </span>
                {isCompleted ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                    ✓ Completed
                  </span>
                ) : null}
              </div>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{lesson.title}</h1>

              {session ? (
                <div className="mt-5 max-w-lg">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-white/80">
                    <span>Module progress</span>
                    <span className="font-semibold">
                      {completedCount} / {totalLessonsInModule} lessons
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left: module lesson list */}
          <aside className="lg:w-64 lg:shrink-0">
            <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Module
              </p>
              <p className="mb-4 text-sm font-semibold text-slate-900">{moduleRecord.title}</p>
              <ul className="space-y-1">
                {moduleRecord.lessons.map((listedLesson) => {
                  const isCurrent = listedLesson.slug === lessonSlug;
                  const done = completedIds.has(listedLesson.id);
                  return (
                    <li key={listedLesson.id}>
                      <Link
                        href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${listedLesson.slug}`}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                          isCurrent
                            ? "font-bold text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                        style={isCurrent ? { backgroundColor: theme.color } : undefined}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            isCurrent
                              ? "bg-white/25 text-white"
                              : done
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {done && !isCurrent ? "✓" : listedLesson.order}
                        </span>
                        <span className="min-w-0 truncate">{listedLesson.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Center: lesson body */}
          <article className="min-w-0 flex-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <LessonContent content={lesson.content} trackColor={theme.color} />
            </div>

            <div
              id="lesson-progress"
              className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isCompleted ? "✅ Lesson completed" : "Track your progress"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {session
                    ? isCompleted
                      ? "Nice work! Continue to the next lesson."
                      : "Mark this lesson done to track your progress."
                    : "Sign in to save your progress across all devices."}
                </p>
              </div>
              {session ? (
                <LessonProgressButton lessonId={lesson.id} initialCompleted={isCompleted} />
              ) : (
                <Link
                  href="/auth/login"
                  className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${theme.buttonClass}`}
                >
                  Sign In to Track
                </Link>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
              {previousLesson ? (
                <Link
                  href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${previousLesson.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <ArrowLeftIcon />
                  <div>
                    <p className="text-xs text-slate-400">Previous</p>
                    <p className="font-semibold text-slate-800">{previousLesson.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${nextLesson.slug}`}
                  className="group ml-auto flex items-center gap-3 rounded-2xl border border-transparent px-5 py-4 text-white shadow-sm transition hover:shadow-md"
                  style={{ backgroundColor: theme.color }}
                >
                  <div className="text-right">
                    <p className="text-xs opacity-70">Next lesson</p>
                    <p className="font-semibold">{nextLesson.title}</p>
                  </div>
                  <ArrowRightIcon />
                </Link>
              ) : (
                <Link
                  href={`/courses/${moduleRecord.course.slug}`}
                  className="ml-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Back to course
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
          </article>

          {/* Right: table of contents */}
          {outline.length > 0 ? (
            <aside className="lg:w-60 lg:shrink-0">
              <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <LessonToc outline={outline} trackColor={theme.color} />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}
