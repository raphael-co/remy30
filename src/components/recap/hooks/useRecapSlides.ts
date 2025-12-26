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

  // helpers : choisir une image de manière safe
  const pick = React.useCallback(
    (i: number) => (gallery[i] ? gallery[i] : null),
    [gallery]
  );

  const bgForSlide = React.useCallback(
    (slideType: string) => {
      // ✅ Intro : hero (ou 1ère photo) => cover "officielle"
      if (slideType === "intro") return hero || pick(0);

      // ✅ Product : change le fond => 2ème photo si possible, sinon 1ère, sinon hero
    //   if (slideType === "product") return pick(1) || pick(0) || hero;

      // ✅ Stats : un autre fond encore => 3ème photo si possible
      if (slideType === "stats") return pick(2) || pick(1) || pick(0) || hero;

      // ✅ Gallery : 1ère photo de la galerie
      if (slideType === "gallery") return pick(0) || hero;

      // ✅ Reviews : image du dernier avis (si existe), sinon hero/galerie
      if (slideType === "reviews") return latestReviews[0]?.imageUrl || pick(0) || hero;

      // ✅ Outro : sombre / neutre => hero (ou aucune image si tu veux un fond “plain”)
      if (slideType === "outro") return hero || pick(0);

      return hero || pick(0);
    },
    [hero, pick, latestReviews]
  );

  return { slides, total, gallery, hero, latestReviews, stats, bgForSlide };
}
