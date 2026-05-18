"use client";

import { FormEvent, useEffect, useState } from "react";

type Course = { id: string; title: string };
type Module = { id: string; title: string };

type QuestionInput = {
  text: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
};

function emptyQuestion(): QuestionInput {
  return { text: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" };
}

export default function AdminQuizForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateQuestion = (idx: number, updates: Partial<QuestionInput>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options] as [string, string, string, string];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          moduleId,
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unable to create quiz.");
      }

      setTitle("");
      setQuestions([emptyQuestion()]);
      setStatus({ type: "success", message: "Quiz created successfully." });
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
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Course</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Module</span>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
            disabled={modules.length === 0}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {modules.length === 0
              ? <option value="">No modules yet</option>
              : modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Quiz Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Module 1 Quiz"
          />
        </label>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Questions ({questions.length})
          </h3>
          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            + Add Question
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Question {qIdx + 1}</p>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-semibold text-slate-600">Question Text</span>
              <input
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="What does docker ps do?"
              />
            </label>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600">Options (select the correct answer)</span>
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctAnswer === optIdx}
                    onChange={() => updateQuestion(qIdx, { correctAnswer: optIdx })}
                    className="accent-blue-600"
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    required
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  />
                </div>
              ))}
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-semibold text-slate-600">Explanation (optional)</span>
              <input
                value={q.explanation}
                onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Brief explanation shown after submission…"
              />
            </label>
          </div>
        ))}
      </div>

      {status ? (
        <div className={`rounded-2xl px-4 py-3 text-sm ${status.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>
          {status.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !moduleId}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating Quiz…" : "Create Quiz"}
      </button>
    </form>
  );
}
