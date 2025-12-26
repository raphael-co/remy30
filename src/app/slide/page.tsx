"use client";

import React from "react";
import RecapPlayer, { buildRecapSlides, type RecapReview } from "@/components/RecapPlayer";

type ProductApi = {
  title: string;
  subtitle: string | null;
  description: string;
  heroImageUrl: string | null;
  gallery: string[];
};

type ReviewsApiItem = {
  id: string;
  name: string;
  rating: number;
  message: string;
  imageUrl: string | null;
  createdAt: string; // ISO
};

function uniqueStrings(arr: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of arr) {
    const v = (s ?? "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export default function RecapDemo() {
  const [open, setOpen] = React.useState(false);
  const [slides, setSlides] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function openRecap() {
    setLoading(true);
    setErr(null);

    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/product", { cache: "no-store" }),
        fetch("/api/reviews", { cache: "no-store" }),
      ]);

      if (!pRes.ok) {
        const j = await pRes.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to fetch /api/product");
      }
      if (!rRes.ok) {
        const j = await rRes.json().catch(() => null);
        throw new Error(j?.error ?? "Failed to fetch /api/reviews");
      }

      const product = (await pRes.json()) as ProductApi;
      const reviewsApi = (await rRes.json()) as ReviewsApiItem[];

      // Images: hero + gallery, uniques, limit
      const images = uniqueStrings([product.heroImageUrl ?? "", ...(product.gallery ?? [])]).slice(0, 60);

      // Reviews -> RecapReview
      const reviews: RecapReview[] = (reviewsApi ?? [])
        .map((r) => ({
          comment: (r.message ?? "").trim(),
          author: (r.name ?? "").trim() || undefined,
          imageUrl: (r.imageUrl ?? "").trim() || null,
          createdAt: r.createdAt ?? null,
        }))
        .filter((r) => r.comment.length > 0)
        .slice(0, 30);

      const built = buildRecapSlides({
        images,
        reviews,
        title: (product.title ?? "").trim() || "30 ans de Rémy",
        subtitle: (product.subtitle ?? "").trim() || "Les images & messages partagés",
      });

      setSlides(built);
      setOpen(true);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={openRecap}
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: 999,
          border: "1px solid rgba(15, 23, 42, 0.14)",
          background: "white",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 800,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Chargement…" : "Ouvrir le recap"}
      </button>

      {err ? (
        <div style={{ marginTop: 10, fontSize: 13, color: "#7a2a1f", fontWeight: 800 }}>
          {err}
        </div>
      ) : null}

      <RecapPlayer
        open={open}
        onClose={() => setOpen(false)}
        slides={slides}
        autoplay
        slideDurationMs={5200}
        loop
      />
    </div>
  );
}
