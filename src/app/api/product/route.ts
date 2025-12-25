import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

function parseGallery(gallery: unknown): string[] {
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, 30);
}

async function ensureSingletonProduct() {
  const existing = await prisma.product.findFirst();
  if (existing) return existing;

  return prisma.product.create({
    data: {
      title: "30 ans de Rémy",
      subtitle: "La page officielle 🎉",
      description: "Modifie-moi depuis /admin",
      heroImageUrl: null,
      galleryJson: "[]",
    },
  });
}

function defaultProductData() {
  return {
    title: "30 ans de Rémy",
    subtitle: "La page officielle 🎉",
    description: "Modifie-moi depuis /admin",
    heroImageUrl: null as string | null,
    galleryJson: "[]",
  };
}

export async function GET() {
  const p = await ensureSingletonProduct();
  const gallery = JSON.parse(p.galleryJson || "[]");

  return NextResponse.json({
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    heroImageUrl: p.heroImageUrl,
    gallery,
  });
}

/**
 * POST /api/product
 * Admin only
 */
export async function POST() {
  const guard = requireAdmin();
  if (!(await guard).ok) return NextResponse.json({ error: (await guard).error }, { status: (await guard).status });

  const existing = await prisma.product.findFirst();
  if (existing) {
    return NextResponse.json(
      { error: "Product already exists", id: existing.id },
      { status: 409 }
    );
  }

  const created = await prisma.product.create({ data: defaultProductData() });
  return NextResponse.json({ ok: true, id: created.id });
}

/**
 * PUT /api/product
 * Admin only
 */
export async function PUT(req: Request) {
  const guard = requireAdmin();
  if (!(await guard).ok) return NextResponse.json({ error: (await guard).error }, { status: (await guard).status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const title =
    typeof (body as any).title === "string" ? (body as any).title.trim().slice(0, 120) : "";
  const subtitle =
    typeof (body as any).subtitle === "string" ? (body as any).subtitle.trim().slice(0, 200) : null;
  const description =
    typeof (body as any).description === "string"
      ? (body as any).description.trim().slice(0, 5000)
      : "";
  const heroImageUrl =
    typeof (body as any).heroImageUrl === "string"
      ? (body as any).heroImageUrl.trim().slice(0, 1000)
      : null;

  const gallery = parseGallery((body as any).gallery);

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }

  const p = await ensureSingletonProduct();

  const updated = await prisma.product.update({
    where: { id: p.id },
    data: {
      title,
      subtitle: subtitle || null,
      description,
      heroImageUrl: heroImageUrl || null,
      galleryJson: JSON.stringify(gallery),
    },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
