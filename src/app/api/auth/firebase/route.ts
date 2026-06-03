import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSession, sessionCookieOptions } from "@/lib/auth";

type FirebaseTokenPayload = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

/**
 * Decode a Firebase ID token payload without signature verification.
 * In production, replace this with firebase-admin's verifyIdToken()
 * once you have a service account configured.
 */
function decodeFirebaseToken(token: string): FirebaseTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload.sub || !payload.email) return null;
    return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return Response.json({ error: "Firebase ID token is required." }, { status: 400 });
    }

    const decoded = decodeFirebaseToken(idToken);
    if (!decoded) {
      return Response.json({ error: "Invalid token format." }, { status: 401 });
    }

    // Find or create a user based on their Firebase email
    let user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: decoded.email,
          name: decoded.name ?? null,
          // Firebase users don't have a local password — store a placeholder hash
          password: `firebase:${decoded.sub}`,
        },
      });
    }

    const token = await signSession({ userId: user.id, email: user.email, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return Response.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error("[POST /api/auth/firebase]", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
