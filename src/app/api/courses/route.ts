import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { modules: true } } },
    orderBy: { order: "asc" },
  });
  return Response.json(courses);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { title, description, slug, imageUrl, order } = await request.json();

    if (!title || !description || !slug) {
      return Response.json(
        { error: "title, description, and slug are required." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: { title, description, slug, imageUrl: imageUrl || null, order: order ?? 0 },
    });
    return Response.json(course, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return Response.json({ error: "A course with that slug already exists." }, { status: 409 });
    }
    console.error("[POST /api/courses]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
