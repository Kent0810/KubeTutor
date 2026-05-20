import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminFlashcardForm from "@/components/AdminFlashcardForm";

export const metadata: Metadata = {
  title: "KubeTutor | Admin — Flashcards",
};

export const dynamic = "force-dynamic";

export default async function AdminFlashcardsPage() {
  const flashcards = await prisma.flashcard.findMany({
    orderBy: [{ topic: "asc" }, { question: "asc" }],
  });

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Flashcards</h1>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Create New Flashcard</h2>
          <AdminFlashcardForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Existing Flashcards ({flashcards.length})
          </h2>
          {flashcards.length === 0 ? (
            <p className="text-sm text-slate-500">No flashcards yet.</p>
          ) : (
            <div className="space-y-3">
              {flashcards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                    {card.topic}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{card.question}</p>
                  <p className="mt-1 text-sm text-slate-600">{card.answer}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
