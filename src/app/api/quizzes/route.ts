import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const moduleId = url.searchParams.get("moduleId");

  const quizzes = await prisma.quiz.findMany({
    where: moduleId ? { moduleId } : { moduleId: { not: null } },
    include: {
      _count: { select: { questions: true } },
      module: { include: { course: true } },
    },
  });
  return Response.json(quizzes);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { title, moduleId, questions } = await request.json();

    if (!title || !moduleId) {
      return Response.json({ error: "title and moduleId are required." }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        moduleId,
        questions: questions
          ? {
              create: questions.map(
                (q: {
                  text: string;
                  options: string[];
                  correctAnswer: number;
                  explanation?: string;
                }) => ({
                  text: q.text,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation ?? null,
                })
              ),
            }
          : undefined,
      },
      include: { questions: true },
    });
    return Response.json(quiz, { status: 201 });
  } catch (error) {
    console.error("[POST /api/quizzes]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
