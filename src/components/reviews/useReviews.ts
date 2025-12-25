"use client";

import React from "react";

export type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  message: string;
  imageUrl: string | null;
  createdAt: string;
};

type CreateOrUpdateReviewInput = {
  rating: number;
  message: string;
  imageUrl?: string | null | "";
};

export function useReviews() {
  const [items, setItems] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ReviewItem[];
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(e?.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Helpers optionnels si tu veux garder une API propre
  const createReview = React.useCallback(async (input: CreateOrUpdateReviewInput) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      throw new Error(j?.error ?? `HTTP ${res.status}`);
    }
    return (await res.json()) as { ok: true; id: string };
  }, []);

  const updateReview = React.useCallback(async (input: CreateOrUpdateReviewInput) => {
    const res = await fetch("/api/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      throw new Error(j?.error ?? `HTTP ${res.status}`);
    }
    return (await res.json()) as { ok: true; id: string };
  }, []);

  return { items, loading, error, refetch, createReview, updateReview };
}
