"use client";

import { FormEvent, useState } from "react";

export default function AdminFlashcardForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("Docker");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer, topic }),
      });

      if (!response.ok) {
        throw new Error("Unable to create flashcard.");
      }

      setQuestion("");
      setAnswer("");
      setTopic("Docker");
      setStatus({ type: "success", message: "Flashcard created successfully." });
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
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Question</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="What command lists all running containers?"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Answer</span>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          required
          rows={5}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Use docker ps to list currently running containers."
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Topic</span>
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="Docker">Docker</option>
          <option value="Kubernetes">Kubernetes</option>
        </select>
      </label>

      {status ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating Flashcard..." : "Create Flashcard"}
      </button>
    </form>
  );
}
