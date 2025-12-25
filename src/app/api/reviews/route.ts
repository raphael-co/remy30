import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Review } from "@prisma/client";
import { cookies } from "next/headers";
import { authCookie, verifySession } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

export const runtime = "nodejs";

function isValidRating(n: unknown) {
  return Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;
}

function isValidOptionalImageUrl(url: unknown) {
  if (url == null) return true;
  if (typeof url !== "string") return false;

  const v = url.trim();
  if (!v) return true;

  if (v.length > 600) return false;

  const base = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (base) {
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    if (!v.startsWith(b)) return false;
  }

  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  } catch {
    return false;
  }

  return true;
}

type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  message: string;
  imageUrl: string | null;
  createdAt: string;
};

function getSession() {
  return cookies()
    .then((c) => c.get(authCookie.name)?.value || "")
    .then((token) => (token ? verifySession(token) : null));
}

export async function GET() {
  const reviews: Review[] = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const dto: ReviewDTO[] = reviews.map((r: any) => ({
    id: r.id,
    name: r.nameSnapshot ?? r.name,
    rating: r.rating,
    message: r.message,
    imageUrl: (r.imageUrl ?? null) as string | null,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(dto);
}

export async function POST(req: Request) {
  const sess = await getSession();
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ max 1 review par user
  const existing = await prisma.review.findFirst({
    where: { userId: sess.sub },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already posted a review. Use PUT to update it.", id: existing.id },
      { status: 409 }
    );
  }

  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as { message?: unknown; rating?: unknown; imageUrl?: unknown };

  const message = typeof b.message === "string" ? b.message.trim() : "";
  const ratingRaw = b.rating;
  const rating = typeof ratingRaw === "number" ? ratingRaw : Number(ratingRaw);

  const imageUrlRaw = typeof b.imageUrl === "string" ? b.imageUrl.trim() : "";
  const imageUrl = imageUrlRaw ? imageUrlRaw : null;

  if (!message || message.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  if (!isValidRating(rating)) {
    return NextResponse.json({ error: "Invalid rating (1..5)" }, { status: 400 });
  }
  if (!isValidOptionalImageUrl(imageUrl)) {
    return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 });
  }

  const created = await prisma.review.create({
    data: {
      userId: sess.sub,
      nameSnapshot: sess.name,
      rating,
      message,
      imageUrl,
      approved: true,
    },
  });

  return NextResponse.json({ ok: true, id: created.id });
}

function extractR2KeyFromPublicUrl(url: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;

  const b = base.endsWith("/") ? base : base + "/";
  if (!url.startsWith(b)) return null;

  return url.slice(b.length);
}

export async function PUT(req: Request) {
  const token = (await cookies()).get(authCookie.name)?.value || "";
  const sess = token ? verifySession(token) : null;
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const review = await prisma.review.findFirst({
    where: { userId: sess.sub },
  });

  if (!review) {
    return NextResponse.json({ error: "No review to update" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as {
    message?: unknown;
    rating?: unknown;
    imageUrl?: unknown;
  };

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const rating = Number(body.rating);
  const imageUrlRaw = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!message || message.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  // 🧨 suppression image R2 si nécessaire
  if (!imageUrlRaw && review.imageUrl) {
    const key = extractR2KeyFromPublicUrl(review.imageUrl);
    if (key) {
      await deleteFromR2(key);
    }
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: {
      message,
      rating,
      imageUrl: imageUrlRaw || null,
      nameSnapshot: sess.name,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}