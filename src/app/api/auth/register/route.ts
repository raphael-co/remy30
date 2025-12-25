import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authCookie, hashPassword, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof (body as any).name === "string" ? (body as any).name.trim() : "";
  const password = typeof (body as any).password === "string" ? (body as any).password : "";

  if (!name || name.length < 2 || name.length > 30) {
    return NextResponse.json({ error: "Invalid name (2..30)" }, { status: 400 });
  }
  if (!password || password.length < 6 || password.length > 72) {
    return NextResponse.json({ error: "Invalid password (6..72)" }, { status: 400 });
  }

  const passwordHash = hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { name, passwordHash },
      select: { id: true, name: true, role: true },
    });

    const token = signSession(user.id, user.name, user.role);
    const res = NextResponse.json({ ok: true, id: user.id, name: user.name });
    res.headers.set("Set-Cookie", authCookie.serialize(token));
    return res;
  } catch (e: any) {
    // unique violation
    return NextResponse.json({ error: "Name already taken" }, { status: 409 });
  }
}
