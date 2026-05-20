"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Course = { id: string; title: string };
type Module = { id: string; title: string };

export default function AdminLessonForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState("1");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatedSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setCourseId(data[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/modules?courseId=${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        setModules(data);
        if (data.length > 0) setModuleId(data[0].id);
        else setModuleId("");
      })
      .catch(() => {});
  }, [courseId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, slug, order: Number(order), moduleId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unable to create lesson.");
      }

      setTitle("");
      setContent("");
      setSlug("");
      setOrder("1");
      setSlugTouched(false);
      setStatus({ type: "success", message: "Lesson created successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Course</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Module</span>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
            disabled={modules.length === 0}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {modules.length === 0 ? (
              <option value="">No modules yet</option>
            ) : (
              modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Title</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Introduction to Containers"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Lesson content goes here…"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder={generatedSlug || "intro-to-containers"}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Order</span>
          <input
            type="number"
            min="0"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      {status ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${status.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {status.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !moduleId}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating Lesson…" : "Create Lesson"}
      </button>
    </form>
  );
}
