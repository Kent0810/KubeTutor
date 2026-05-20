"use client";

import { useMemo, useState } from "react";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  topic: string;
};

type FlashcardsClientProps = {
  flashcards: Flashcard[];
};

export default function FlashcardsClient({ flashcards }: FlashcardsClientProps) {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [flippedIds, setFlippedIds] = useState<string[]>([]);

  const topics = useMemo(
    () => ["All", ...Array.from(new Set(flashcards.map((card) => card.topic)))],
    [flashcards]
  );

  const filteredFlashcards = useMemo(
    () =>
      selectedTopic === "All"
        ? flashcards
        : flashcards.filter((card) => card.topic === selectedTopic),
    [flashcards, selectedTopic]
  );

  const toggleCard = (id: string) => {
    setFlippedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {topics.map((topic, i) => {
          const active = topic === selectedTopic;

          return (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`animate-fade-in-up rounded-full px-4 py-2 text-sm font-semibold transition hover:scale-105 active:scale-95 ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredFlashcards.map((card, i) => {
          const isFlipped = flippedIds.includes(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleCard(card.id)}
              className="animate-fade-in-up group h-64 cursor-pointer rounded-3xl text-left [perspective:1200px]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="relative h-full rounded-3xl transition duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-lg"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                      {card.topic}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">{card.question}</h3>
                  </div>
                  <p className="text-sm text-slate-500">Click to reveal the answer</p>
                </div>

                <div
                  className="absolute inset-0 flex h-full flex-col justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-lg"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">
                      Answer
                    </p>
                    <p className="mt-4 text-base leading-7 text-slate-100">{card.answer}</p>
                  </div>
                  <p className="text-sm text-slate-300">Tap again to flip back</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
