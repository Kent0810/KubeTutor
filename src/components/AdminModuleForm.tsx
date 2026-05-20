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

export default function AdminModuleForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, slug, order: Number(order), courseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unable to create module.");
      }

      setTitle("");
      setDescription("");
      setSlug("");
      setOrder("1");
      setSlugTouched(false);
      setStatus({ type: "success", message: "Module created successfully." });
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
        <label className="space-y-2 md:col-span-2">
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
            placeholder="Getting Started with Docker"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="What will learners cover in this module?"
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
            placeholder={generatedSlug || "getting-started"}
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
        disabled={isSubmitting}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating Module…" : "Create Module"}
      </button>
    </form>
  );
}
