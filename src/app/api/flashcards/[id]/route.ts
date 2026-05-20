import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(card);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const card = await prisma.flashcard.update({
      where: { id },
      data: { question: body.question, answer: body.answer, topic: body.topic },
    });
    return Response.json(card);
  } catch {
    return Response.json({ error: "Flashcard not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.flashcard.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Flashcard not found." }, { status: 404 });
  }
}
