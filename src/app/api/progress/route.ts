import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return Response.json({ error: "lessonId is required." }, { status: 400 });
    }

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
      create: { userId: session.userId, lessonId, completed: true },
      update: { completed: true },
    });

    return Response.json(progress);
  } catch (error) {
    console.error("[POST /api/progress]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const lessonId = url.searchParams.get("lessonId");

  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.userId,
      ...(lessonId ? { lessonId } : {}),
    },
  });

  return Response.json(progress);
}
