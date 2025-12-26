import type { Product, Review, Slide } from "../types";

export function buildSlides(_product: Product | null, _reviews: Review[]): Slide[] {
  return [
    { type: "intro" },
    { type: "product" },
    { type: "stats" },
    { type: "gallery" },
    { type: "reviews" },
    { type: "outro" },
  ];
}
