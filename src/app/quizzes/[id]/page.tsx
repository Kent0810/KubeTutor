import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

type QuizPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  return {
    title: quiz ? `KubeTutor | ${quiz.title}` : "KubeTutor | Quiz",
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;

  const quiz = await prisma.quiz.findFirst({
    where: { id, moduleId: { not: null } },
    include: {
      questions: true,
      module: { include: { course: true } },
    },
  });

  if (!quiz || !quiz.module) notFound();

  return (
    <main className="flex-1 bg-gray-50">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/quizzes" className="font-medium hover:text-blue-600">
            Quizzes
          </Link>
          <span>→</span>
          <span className="font-semibold text-slate-900">{quiz.title}</span>
        </nav>

        <div className="mt-6 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">
            {quiz.module.course.title} · {quiz.module.title}
          </p>
          <h1 className="mt-3 text-3xl font-bold">{quiz.title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-8">
          <QuizClient
            quizId={quiz.id}
            questions={quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: q.options,
              explanation: q.explanation,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
