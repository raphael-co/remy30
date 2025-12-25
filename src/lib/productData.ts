export type Product = {
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  rating: number; // 0..5
  reviewCount: number;
  badges: string[];
  shortDescription: string;
  highlights: string[];
  details: { label: string; value: string }[];
  shipping: string[];
  returns: string[];
  faqs: { q: string; a: string }[];
  images: { src: string; alt: string }[];
};

export const PRODUCT: Product = {
  title: "Produit démo",
  subtitle: "Une page produit crème & marron, moderne et minimaliste",
  price: 49.9,
  currency: "EUR",
  rating: 4.6,
  reviewCount: 128,
  badges: ["Nouveau", "Livraison 48h", "Édition limitée"],
  shortDescription:
    "Description courte et propre. Ici tu peux mettre des infos brutes (sans backend) tout en gardant un rendu e-commerce premium.",
  highlights: [
    "Finition premium, look artisanal",
    "Confort d’utilisation au quotidien",
    "Matériaux durables",
    "Garantie 2 ans",
  ],
  details: [
    { label: "Matière", value: "Aluminium + textile" },
    { label: "Poids", value: "420 g" },
    { label: "Dimensions", value: "22 × 14 × 6 cm" },
    { label: "Compatibilité", value: "Universelle" },
  ],
  shipping: [
    "Expédition sous 24–48h (jours ouvrés).",
    "Livraison standard 2–4 jours.",
    "Suivi inclus.",
  ],
  returns: [
    "Retours sous 30 jours.",
    "Produit neuf/non utilisé requis.",
    "Remboursement sous 5 jours après réception.",
  ],
  faqs: [
    {
      q: "Je pourrai brancher le backend plus tard ?",
      a: "Oui. Tu remplaceras PRODUCT par un fetch/Prisma, sans changer l’UI.",
    },
    {
      q: "La modal galerie supporte le clavier ?",
      a: "Oui : Échap pour fermer, flèches gauche/droite pour naviguer.",
    },
    {
      q: "Responsive ?",
      a: "Oui : 1 colonne sur mobile, 2 colonnes sur desktop.",
    },
  ],
  images: [
    {
      src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
      alt: "Produit - vue principale",
    },
    {
      src: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
      alt: "Produit - vue détail",
    },
    {
      src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80",
      alt: "Produit - vue ambiance",
    },
    {
      src: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",
      alt: "Produit - packaging",
    },
    {
      src: "https://images.unsplash.com/photo-1518444028785-8f2f0f40a3db?auto=format&fit=crop&w=1600&q=80",
      alt: "Produit - matière",
    },
  ],
};
