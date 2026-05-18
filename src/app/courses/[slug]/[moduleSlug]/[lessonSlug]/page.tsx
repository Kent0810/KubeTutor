import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonContent from "@/components/LessonContent";
import { getSession } from "@/lib/auth";
import { getTrackTheme, readingTime } from "@/lib/courseTheme";
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
    where: {
      slug: moduleSlug,
      course: { slug },
    },
    include: {
      course: true,
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!moduleRecord) notFound();

  const currentLessonIndex = moduleRecord.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (currentLessonIndex === -1) notFound();

  const lesson = moduleRecord.lessons[currentLessonIndex];
  const previousLesson = currentLessonIndex > 0 ? moduleRecord.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < moduleRecord.lessons.length - 1 ? moduleRecord.lessons[currentLessonIndex + 1] : null;
  const theme = getTrackTheme(moduleRecord.course.slug);

  const isCompleted = session
    ? !!(await prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId: session.userId, lessonId: lesson.id } },
        select: { completed: true },
      }))?.completed
    : false;

  return (
    <main className="flex-1 bg-slate-50">
      <div className={`${theme.heroClass} text-white`}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/courses" className="transition hover:text-white">
              Courses
            </Link>
            <span>/</span>
            <Link href={`/courses/${moduleRecord.course.slug}`} className="transition hover:text-white">
              {moduleRecord.course.title}
            </Link>
            <span>/</span>
            <Link href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}`} className="transition hover:text-white">
              {moduleRecord.title}
            </Link>
            <span>/</span>
            <span className="font-medium text-white">{lesson.title}</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl">{theme.icon}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Lesson {lesson.order}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  ⏱ {readingTime(lesson.content)}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{theme.label}</span>
              </div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">{lesson.title}</h1>
            </div>
            <div className="sm:hidden">
              <a
                href="#lesson-progress"
                className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Track progress ↓
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start">
          <article className="min-w-0 flex-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
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

          <aside className="lg:w-72 lg:shrink-0">
            <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{moduleRecord.title}</p>
              <p className="mb-4 text-sm text-slate-500">Jump to any lesson in this module.</p>
              <ul className="space-y-1">
                {moduleRecord.lessons.map((listedLesson) => {
                  const isCurrent = listedLesson.slug === lessonSlug;

                  return (
                    <li key={listedLesson.id}>
                      <Link
                        href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${listedLesson.slug}`}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                          isCurrent ? "font-bold text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                        style={isCurrent ? { backgroundColor: theme.color } : undefined}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isCurrent ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {listedLesson.order}
                        </span>
                        <span className="min-w-0 truncate">{listedLesson.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
