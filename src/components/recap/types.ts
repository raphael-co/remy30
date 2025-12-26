export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  imageUrl: string | null;
  createdAt: string;
};

export type Product = {
  title: string;
  subtitle: string;
  description: string;
  heroImageUrl: string | null;
  gallery: string[];
};

export type Slide =
  | { type: "intro" }
  | { type: "product" }
  | { type: "stats" }
  | { type: "gallery" }
  | { type: "reviews" }
  | { type: "outro" };
