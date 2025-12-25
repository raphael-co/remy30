import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type MeResponse =
  | { loggedIn: false }
  | {
      loggedIn: true;
      user: { id: string; name: string; role: string };
      review: {
        id: string;
        rating: number;
        message: string;
        imageUrl: string | null;
        createdAt: string;
      } | null;
      defaults: {
        rating: number;
        message: string;
        imageUrl: string | null;
      };
    };

export async function GET() {
  const token = (await cookies()).get(authCookie.name)?.value || "";
  const sess = token ? verifySession(token) : null;

  if (!sess) return NextResponse.json({ loggedIn: false } satisfies MeResponse);

  // 1 avis max par user => findFirst ok
  const review = await prisma.review.findFirst({
    where: { userId: sess.sub },
    select: {
      id: true,
      rating: true,
      message: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  const defaults = {
    rating: review?.rating ?? 5,
    message: review?.message ?? "",
    imageUrl: review?.imageUrl ?? null,
  };

  return NextResponse.json({
    loggedIn: true,
    user: { id: sess.sub, name: sess.name, role: sess.role },
    review: review
      ? {
          id: review.id,
          rating: review.rating,
          message: review.message,
          imageUrl: review.imageUrl ?? null,
          createdAt: review.createdAt.toISOString(),
        }
      : null,
    defaults,
  } satisfies MeResponse);
}
