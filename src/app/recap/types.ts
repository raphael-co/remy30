export type Product = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  heroImageUrl?: string | null;
  gallery?: string[] | null;
};

export type Review = {
  id: string;
  name?: string | null;
  rating?: number | null;
  message?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
};

export type Slide =
  | { type: "intro" }
  | { type: "product" }
  | { type: "stats" }
  | { type: "gallery" }
  | { type: "reviews" }
  | { type: "outro" };
