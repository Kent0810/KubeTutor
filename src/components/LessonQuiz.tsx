"use client";

import { useMemo, useState } from "react";

type LessonQuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
};

type LessonQuizProps = {
  title: string;
  questions: LessonQuizQuestion[];
  trackColor: string;
};

export default function LessonQuiz({ title, questions, trackColor }: LessonQuizProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(
    () =>
      submitted
        ? questions.map((question) => {
            const chosen = answers[question.id] ?? -1;
            return {
              questionId: question.id,
              chosen,
              correct: chosen === question.correctAnswer,
            };
          })
        : [],
    [answers, questions, submitted]
  );

  const score = results.filter((result) => result.correct).length;
  const total = questions.length;
  const allAnswered =
    total > 0 && questions.every((question) => answers[question.id] !== undefined);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const answeredCount = Object.keys(answers).length;
  const estimatedMinutes = Math.max(1, Math.ceil(total * 0.75));

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Trigger header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50/80 sm:px-8"
      >
        {/* Icon */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${trackColor}bb, ${trackColor})` }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Lesson Quiz
          </p>
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-900">{title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {total} question{total !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ~{estimatedMinutes} min
            </span>
            {isOpen && !submitted && answeredCount > 0 && (
              <span className="font-semibold" style={{ color: trackColor }}>
                {answeredCount}/{total} answered
              </span>
            )}
            {submitted && (
              <span className="font-semibold" style={{ color: trackColor }}>
                Score: {score}/{total} ({percentage}%)
              </span>
            )}
          </div>
        </div>

        {/* CTA + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          {!isOpen && (
            <span
              className="hidden rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-sm sm:inline-block"
              style={{ background: `linear-gradient(135deg, ${trackColor}bb, ${trackColor})` }}
            >
              Start Quiz
            </span>
          )}
          <svg
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable quiz body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-6 pb-8 pt-6 sm:px-8">
          {/* Post-submit score banner */}
          {submitted && (
            <div
              className="mb-6 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${trackColor}bb, ${trackColor})` }}
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Quiz complete — {score}/{total} correct ({percentage}%)
              {percentage === 100 && <span className="ml-auto">🎉 Perfect score!</span>}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => {
              const result = results.find((entry) => entry.questionId === question.id);
              return (
                <fieldset
                  key={question.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5"
                  disabled={submitted}
                >
                  <legend className="text-sm font-semibold text-slate-900">
                    {index + 1}. {question.text}
                  </legend>

                  <div className="mt-4 space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const checked = answers[question.id] === optionIndex;
                      return (
                        <label
                          key={optionIndex}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            checked
                              ? "bg-white"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          } ${submitted ? "cursor-default" : ""}`}
                          style={
                            checked
                              ? {
                                  borderColor: trackColor,
                                  boxShadow: `0 0 0 2px ${trackColor}33`,
                                }
                              : undefined
                          }
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={optionIndex}
                            checked={checked}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                            }
                            className="mt-0.5 h-4 w-4 border-slate-300 text-slate-900"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      );
                    })}
                  </div>

                  {submitted && result ? (
                    <div
                      className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                        result.correct
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      <p className="font-semibold">
                        {result.correct
                          ? "✓ Correct"
                          : `✗ Wrong — correct answer: ${question.options[question.correctAnswer]}`}
                      </p>
                      {question.explanation ? (
                        <p className="mt-2 leading-6">{question.explanation}</p>
                      ) : null}
                    </div>
                  ) : null}
                </fieldset>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {submitted
                ? "Review the feedback above or try again."
                : `${answeredCount} of ${total} answered`}
            </p>
            <div className="flex flex-wrap gap-3">
              {submitted ? (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Try again
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                disabled={!allAnswered || submitted}
                className="rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                style={{ backgroundColor: !allAnswered || submitted ? undefined : trackColor }}
              >
                Check answers
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
