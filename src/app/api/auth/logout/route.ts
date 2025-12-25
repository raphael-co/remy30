import { NextResponse } from "next/server";
import { authCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", authCookie.clear());
  return res;
}
