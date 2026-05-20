import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");

  const modules = await prisma.module.findMany({
    where: courseId ? { courseId } : undefined,
    include: { _count: { select: { lessons: true } } },
    orderBy: { order: "asc" },
  });
  return Response.json(modules);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { title, description, slug, order, courseId } = await request.json();

    if (!title || !description || !slug || !courseId) {
      return Response.json(
        { error: "title, description, slug, and courseId are required." },
        { status: 400 }
      );
    }

    const moduleRecord = await prisma.module.create({
      data: { title, description, slug, order: order ?? 0, courseId },
    });
    return Response.json(moduleRecord, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint")) {
      return Response.json(
        { error: "A module with that slug already exists in this course." },
        { status: 409 }
      );
    }
    console.error("[POST /api/modules]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
