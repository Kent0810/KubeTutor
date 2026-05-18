import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });
  if (!course) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(course);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        imageUrl: body.imageUrl ?? undefined,
        order: body.order ?? undefined,
      },
    });
    return Response.json(course);
  } catch {
    return Response.json({ error: "Course not found or slug conflict." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.course.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }
}
