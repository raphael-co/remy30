"use client";

import { useEffect, useState } from "react";
import type { Product, Review } from "../types";

export function useRecapData() {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [p, r] = await Promise.all([
          fetch("/api/product", { cache: "no-store" }).then((x) => x.json()),
          fetch("/api/reviews", { cache: "no-store" }).then((x) => x.json()),
        ]);

        if (!alive) return;
        setProduct(p || null);
        setReviews(Array.isArray(r) ? r : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { loading, product, reviews };
}
