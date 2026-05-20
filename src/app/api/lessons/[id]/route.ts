import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(lesson);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        slug: body.slug,
        order: body.order ?? undefined,
      },
    });
    return Response.json(lesson);
  } catch {
    return Response.json({ error: "Lesson not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.lesson.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Lesson not found." }, { status: 404 });
  }
}
