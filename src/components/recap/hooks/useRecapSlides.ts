"use client";

import * as React from "react";
import type { Product, Review } from "../types";
import { buildSlides } from "../lib/slides";
import { avgRating } from "../lib/utils";

export function useRecapSlides(product: Product | null, reviews: Review[]) {
  const slides = React.useMemo(() => buildSlides(product, reviews), [product, reviews]);
  const total = slides.length;

  const gallery = product?.gallery ?? [];
  const hero = product?.heroImageUrl ?? null;

  const latestReviews = React.useMemo(() => {
    return [...reviews].sort(
      (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
    );
  }, [reviews]);

  const stats = React.useMemo(() => {
    const a = avgRating(reviews);
    return { avg: a, count: reviews.length, galleryCount: gallery.length };
  }, [reviews, gallery.length]);

  const bgForSlide = React.useCallback(
    (slideType: string) => {
      if (slideType === "gallery") return gallery[0] || hero;
      if (slideType === "reviews") return latestReviews[0]?.imageUrl || hero;
      return hero;
    },
    [gallery, hero, latestReviews]
  );

  return { slides, total, gallery, hero, latestReviews, stats, bgForSlide };
}
