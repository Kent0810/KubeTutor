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

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase">
            Lesson quiz
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Answer all questions, then check your work inline.
          </p>
        </div>
        {submitted ? (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: trackColor }}
          >
            Score: {score}/{total} ({percentage}%)
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
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
                        checked ? "bg-white" : "border-slate-200 bg-white hover:border-slate-300"
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
            : `${Object.keys(answers).length} of ${total} answered`}
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
    </section>
  );
}
