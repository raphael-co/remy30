// src/app/galerie/page.tsx
import BackButton from "./BackButton";
import styles from "./galerie.module.css";
import GalleryLightbox from "./GalleryLightbox";

type Product = {
  heroImageUrl?: string | null;
  gallery?: string[] | null;
  title?: string | null;
  subtitle?: string | null;
};

type Review = {
  imageUrl?: string | null;
};

function uniqStrings(xs: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of xs) {
    const v = (x || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export default async function GaleriePage(props: {
  searchParams: Promise<{ photo?: string }>;
}) {
  const sp = await props.searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const productUrl = `${baseUrl}/api/product`;
  const reviewsUrl = `${baseUrl}/api/reviews`;

  const [pRes, rRes] = await Promise.allSettled([
    fetch(productUrl, { cache: "no-store" }),
    fetch(reviewsUrl, { cache: "no-store" }),
  ]);

  const product: Product | null =
    pRes.status === "fulfilled" && pRes.value.ok
      ? ((await pRes.value.json()) as Product)
      : null;

  const reviews: Review[] =
    rRes.status === "fulfilled" && rRes.value.ok
      ? ((await rRes.value.json()) as Review[])
      : [];

  const productImgs = [
    product?.heroImageUrl || "",
    ...((product?.gallery as string[]) || []),
  ].filter(Boolean);

  const reviewImgs = (reviews || [])
    .map((r) => r.imageUrl || "")
    .filter(Boolean);

  const images = uniqStrings([...productImgs, ...reviewImgs]);

  const raw = sp?.photo || "";
  const selectedFromUrl = raw ? decodeURIComponent(raw) : "";

  const ordered = selectedFromUrl
    ? [selectedFromUrl, ...images.filter((x) => x !== selectedFromUrl)]
    : images;

  const title = product?.title || "Galerie";
  const subtitle = product?.subtitle || "Fais défiler pour explorer";

  return (
    <div className={styles.external}>
      <BackButton />

      <header className={styles.header}>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.kicker}>{subtitle}</p>
        <p className={styles.hint}>
          Astuce : clique une photo pour zoomer. <code>Esc</code> pour fermer.
        </p>
      </header>

      <GalleryLightbox images={ordered} initialSelected={selectedFromUrl} />
    </div>
  );
}
