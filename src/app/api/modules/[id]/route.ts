import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleRecord = await prisma.module.findUnique({
    where: { id },
    include: { lessons: { orderBy: { order: "asc" } }, course: true },
  });
  if (!moduleRecord) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(moduleRecord);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const moduleRecord = await prisma.module.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        order: body.order ?? undefined,
      },
    });
    return Response.json(moduleRecord);
  } catch {
    return Response.json({ error: "Module not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.module.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Module not found." }, { status: 404 });
  }
}
