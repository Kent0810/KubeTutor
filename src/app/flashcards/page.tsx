import type { Metadata } from "next";
import FlashcardsClient from "@/components/FlashcardsClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "KubeTutor | Flashcards",
  description: "Review Docker and Kubernetes flashcards interactively.",
};

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const flashcards = await prisma.flashcard.findMany({
    orderBy: [{ topic: "asc" }, { question: "asc" }],
  });

  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">
            Study mode
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Flashcard Review</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Drill key Docker and Kubernetes concepts with quick question-and-answer practice.
          </p>
        </div>

        <div className="mt-10">
          <FlashcardsClient flashcards={flashcards} />
        </div>
      </section>
    </main>
  );
}
