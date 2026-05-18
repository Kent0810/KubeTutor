import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signSession({ userId: user.id, email: user.email, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return Response.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
