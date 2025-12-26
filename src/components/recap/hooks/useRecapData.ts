"use client";

import * as React from "react";
import type { Product, Review } from "../types";

export function useRecapData(open: boolean) {
  const [loading, setLoading] = React.useState(false);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [pRes, rRes] = await Promise.all([
          fetch("/api/product", { cache: "no-store", signal: ctrl.signal }),
          fetch("/api/reviews", { cache: "no-store", signal: ctrl.signal }),
        ]);

        if (!pRes.ok) throw new Error("Impossible de charger /api/product");
        if (!rRes.ok) throw new Error("Impossible de charger /api/reviews");

        const p = (await pRes.json()) as Product;
        const r = (await rRes.json()) as Review[];

        setProduct(p);
        setReviews(Array.isArray(r) ? r : []);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [open]);

  return { loading, product, reviews, err, setProduct, setReviews };
}
