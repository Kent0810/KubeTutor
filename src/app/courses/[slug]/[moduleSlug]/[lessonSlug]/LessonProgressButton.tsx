"use client";

import { useState } from "react";

type LessonProgressButtonProps = {
  lessonId: string;
  initialCompleted: boolean;
};

export default function LessonProgressButton({ lessonId, initialCompleted }: LessonProgressButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleMark = async () => {
    if (completed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-700">
        ✓ Completed
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleMark}
      disabled={loading}
      className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      {loading ? "Saving…" : "Mark as Complete"}
    </button>
  );
}
