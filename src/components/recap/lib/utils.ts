import type { Review } from "../types";

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce(
    (acc, r) => acc + (Number.isFinite(r.rating) ? r.rating : 0),
    0
  );
  return sum / reviews.length;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mn}`;
}

export function stars(rating: number) {
  const r = clamp(Math.round(rating), 0, 5);
  return "★★★★★☆☆☆☆☆".slice(5 - r, 10 - r);
}
