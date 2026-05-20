"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTrackTheme } from "@/lib/courseTheme";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
  firstModuleSlug?: string;
  modulePreview: { slug: string; title: string; lessonCount: number }[];
  highlights: string[];
};

const LEVELS: Record<string, { label: string; color: string }> = {
  "docker-foundations": {
    label: "Beginner → Intermediate",
    color: "bg-emerald-100 text-emerald-700",
  },
  "kubernetes-essentials": {
    label: "Intermediate → Advanced",
    color: "bg-amber-100 text-amber-800",
  },
};

export default function CoursesBrowser({ courses }: { courses: CourseCardData[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.modulePreview.some((m) => m.title.toLowerCase().includes(q))
    );
  }, [query, courses]);

  return (
    <>
      <div className="mx-auto mb-6 flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-slate-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 text-slate-400"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, topics, modules…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-full px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No courses match “{query}”. Try a different keyword.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((course) => {
            const theme = getTrackTheme(course.slug);
            const level = LEVELS[course.slug] ?? {
              label: "All levels",
              color: "bg-slate-100 text-slate-700",
            };

            return (
              <article
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`h-2 ${theme.heroClass}`} />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{theme.icon}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme.badgeClass}`}
                          >
                            {theme.label}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${level.color}`}
                          >
                            {level.label}
                          </span>
                        </div>
                        <h2 className="mt-3 text-2xl font-bold text-slate-900">{course.title}</h2>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p className="font-bold text-slate-900">{course.lessonCount}</p>
                      <p>lessons</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[15px] leading-7 text-slate-600">{course.description}</p>

                  {course.highlights.length > 0 ? (
                    <div className="mt-5">
                      <p className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">
                        What you&apos;ll learn
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {course.highlights.map((h) => (
                          <span
                            key={h}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${theme.mutedBadgeClass}`}
                          >
                            <span aria-hidden>✓</span>
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {course.modulePreview.length > 0 ? (
                    <ol className="mt-6 space-y-1.5">
                      {course.modulePreview.map((m, i) => (
                        <li
                          key={m.slug}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                        >
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: theme.color }}
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{m.title}</span>
                          <span className="text-xs text-slate-500">{m.lessonCount}L</span>
                        </li>
                      ))}
                      {course.moduleCount > course.modulePreview.length ? (
                        <li className="pl-9 text-xs text-slate-500">
                          + {course.moduleCount - course.modulePreview.length} more modules
                        </li>
                      ) : null}
                    </ol>
                  ) : null}

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${theme.buttonClass}`}
                    >
                      Explore course →
                    </Link>
                    <Link
                      href={
                        course.firstModuleSlug
                          ? `/courses/${course.slug}/${course.firstModuleSlug}`
                          : `/courses/${course.slug}`
                      }
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
      )}
    </>
  );
}
