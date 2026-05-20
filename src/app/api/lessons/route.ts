import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const moduleId = url.searchParams.get("moduleId");

  const lessons = await prisma.lesson.findMany({
    where: moduleId ? { moduleId } : undefined,
    orderBy: { order: "asc" },
  });
  return Response.json(lessons);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { title, content, slug, order, moduleId } = await request.json();

    if (!title || !content || !slug || !moduleId) {
      return Response.json(
        { error: "title, content, slug, and moduleId are required." },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: { title, content, slug, order: order ?? 0, moduleId },
    });
    return Response.json(lesson, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint")) {
      return Response.json(
        { error: "A lesson with that slug already exists in this module." },
        { status: 409 }
      );
    }
    console.error("[POST /api/lessons]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
