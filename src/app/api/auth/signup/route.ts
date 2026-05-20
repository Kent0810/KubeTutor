import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashed },
    });

    const token = await signSession({ userId: user.id, email: user.email, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return Response.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error("[POST /api/auth/signup]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
