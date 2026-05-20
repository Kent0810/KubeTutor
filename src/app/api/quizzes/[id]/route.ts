import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: true, module: { include: { course: true } } },
  });
  if (!quiz) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(quiz);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: { title: body.title },
    });
    return Response.json(quiz);
  } catch {
    return Response.json({ error: "Quiz not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.quiz.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Quiz not found." }, { status: 404 });
  }
}
