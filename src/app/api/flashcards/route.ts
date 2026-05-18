import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const flashcards = await prisma.flashcard.findMany({
    orderBy: [{ topic: "asc" }, { question: "asc" }],
  });
  return Response.json(flashcards);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { question, answer, topic } = await request.json();

    if (!question || !answer || !topic) {
      return Response.json({ error: "question, answer, and topic are required." }, { status: 400 });
    }

    const flashcard = await prisma.flashcard.create({ data: { question, answer, topic } });
    return Response.json(flashcard, { status: 201 });
  } catch (error) {
    console.error("[POST /api/flashcards]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
