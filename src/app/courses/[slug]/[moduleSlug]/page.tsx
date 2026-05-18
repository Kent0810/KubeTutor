import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTrackTheme, readingTime } from "@/lib/courseTheme";

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

  const moduleRecord = await prisma.module.findFirst({
    where: {
      slug: moduleSlug,
      course: {
        slug,
      },
    },
    include: {
      course: true,
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!moduleRecord) {
    notFound();
  }

  const theme = getTrackTheme(moduleRecord.course.slug);

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
                  {theme.label} module
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  {moduleRecord.lessons.length} lessons
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{moduleRecord.title}</h1>
              <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">{moduleRecord.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {moduleRecord.lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: theme.color }} />
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
                    style={{ backgroundColor: theme.color }}
                  >
                    {lesson.order}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lesson {lesson.order}</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">{lesson.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${theme.badgeClass}`}>
                        ⏱ {readingTime(lesson.content)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/courses/${moduleRecord.course.slug}/${moduleRecord.slug}/${lesson.slug}`}
                  className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${theme.buttonClass}`}
                >
                  Start lesson
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
