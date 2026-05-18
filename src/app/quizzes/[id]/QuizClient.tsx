"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  id: string;
  text: string;
  options: string[];
  explanation: string | null;
};

type SubmitResult = {
  score: number;
  total: number;
  results: Array<{
    questionId: string;
    text: string;
    chosen: number;
    correctAnswer: number;
    correct: boolean;
    explanation: string | null;
  }>;
};

type QuizClientProps = {
  quizId: string;
  questions: Question[];
};

export default function QuizClient({ quizId, questions }: QuizClientProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const allAnswered = answered === questions.length;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Submission failed.");
      const data: SubmitResult = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    const passed = pct >= 70;

    return (
      <div className="space-y-6">
        <div
          className={`rounded-3xl p-8 text-white shadow-xl ${
            passed ? "bg-emerald-700" : "bg-rose-700"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-75">
            {passed ? "🎉 Well done!" : "Keep practicing"}
          </p>
          <p className="mt-2 text-5xl font-bold">
            {result.score}/{result.total}
          </p>
          <p className="mt-1 text-lg opacity-90">{pct}% correct</p>
        </div>

        <div className="space-y-4">
          {result.results.map((r, idx) => (
            <div
              key={r.questionId}
              className={`rounded-3xl border p-6 ${
                r.correct
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Question {idx + 1}
              </p>
              <p className="mt-2 font-semibold text-slate-900">{r.text}</p>

              <div className="mt-3 space-y-1 text-sm">
                {r.correct ? (
                  <p className="text-emerald-700">
                    ✓ Correct — {questions[idx]?.options[r.correctAnswer]}
                  </p>
                ) : (
                  <>
                    <p className="text-rose-700">
                      ✗ Your answer:{" "}
                      {r.chosen >= 0
                        ? questions[idx]?.options[r.chosen]
                        : "Not answered"}
                    </p>
                    <p className="text-emerald-700">
                      ✓ Correct answer: {questions[idx]?.options[r.correctAnswer]}
                    </p>
                  </>
                )}
                {r.explanation ? (
                  <p className="mt-2 leading-6 text-slate-600">{r.explanation}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
          >
            Try Again
          </button>
          <Link
            href="/quizzes"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            All Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {questions.map((question, idx) => (
        <div
          key={question.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Question {idx + 1} of {questions.length}
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{question.text}</p>

          <div className="mt-4 space-y-3">
            {question.options.map((option, optIdx) => {
              const selected = answers[question.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: optIdx }))
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 font-semibold text-blue-700 ring-2 ring-blue-200"
                      : "border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {answered} of {questions.length} answered
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
