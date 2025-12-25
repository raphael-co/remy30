import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authCookie, signSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof (body as any).name === "string" ? (body as any).name.trim() : "";
  const password = typeof (body as any).password === "string" ? (body as any).password : "";

  if (!name || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { name },
    select: { id: true, name: true, passwordHash: true, role: true },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signSession(user.id, user.name, user.role);
  const res = NextResponse.json({ ok: true, id: user.id, name: user.name, role: user.role });
  res.headers.set("Set-Cookie", authCookie.serialize(token));
  return res;
}
