import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  try {
    const { answers } = (await request.json()) as { answers: Record<string, number> };

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      return Response.json({ error: "Quiz not found." }, { status: 404 });
    }

    let score = 0;
    const results = quiz.questions.map((question) => {
      const chosen = answers[question.id] ?? -1;
      const correct = chosen === question.correctAnswer;
      if (correct) score++;
      return {
        questionId: question.id,
        text: question.text,
        chosen,
        correctAnswer: question.correctAnswer,
        correct,
        explanation: question.explanation,
      };
    });

    if (session) {
      await prisma.quizResult.create({
        data: {
          userId: session.userId,
          quizId: id,
          score,
          total: quiz.questions.length,
        },
      });
    }

    return Response.json({
      score,
      total: quiz.questions.length,
      results,
    });
  } catch (error) {
    console.error("[POST /api/quizzes/[id]/submit]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
