"use client";

import React from "react";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import Modal from "@/components/ui/Modal";
import { useProduct } from "@/components/product/useProduct";
import Image from "next/image";
import { clamp } from "@/lib/utils";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/useAuth";
import RecapButton from "../recap/RecapButton";

function normalizeImages(heroImageUrl: string | null, gallery: string[]) {
  const urls = [heroImageUrl, ...gallery].filter(Boolean) as string[];
  const unique = Array.from(new Set(urls)).slice(0, 30);

  if (unique.length === 0) {
    return [
      {
        src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
        alt: "Image par défaut",
      },
    ];
  }

  return unique.map((src, i) => ({ src, alt: `Image ${i + 1}` }));
}

function GalleryLightbox({
  images,
  startIndex,
  open,
  onClose,
}: {
  images: { src: string; alt: string }[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    if (!open) return;
    setIndex(startIndex);
  }, [open, startIndex]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, onClose]);

  const img = images[clamp(index, 0, images.length - 1)];

  return (
    <Modal open={open} onClose={onClose} title={`${index + 1} / ${images.length}`}>
      <div className="lb">
        <button
          className="nav"
          aria-label="Précédent"
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        >
          ‹
        </button>

        <div className="stage">
          <div className="imgWrap">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="caption">{img.alt}</div>
        </div>

        <button
          className="nav"
          aria-label="Suivant"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
        >
          ›
        </button>
      </div>

      <style jsx>{`
        .lb {
          display: grid;
          grid-template-columns: 46px 1fr 46px;
          gap: 10px;
          align-items: center;
        }
        .nav {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          cursor: pointer;
          color: var(--text);
          font-size: 28px;
          line-height: 1;
          font-weight: 900;
        }
        .nav:hover {
          transform: translateY(-1px);
        }
        .stage {
          display: grid;
          gap: 10px;
        }
        .imgWrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          border-radius: 18px;
          background: rgba(42, 27, 18, 0.04);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .caption {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          font-weight: 700;
        }
        @media (max-width: 640px) {
          .lb {
            grid-template-columns: 40px 1fr 40px;
          }
          .nav {
            width: 40px;
            height: 40px;
            border-radius: 14px;
          }
        }
      `}</style>
    </Modal>
  );
}

export default function ProductPage() {
  const { data, loading, error, refetch } = useProduct();
  const auth = useAuth();

  const [active, setActive] = React.useState(0);
  const [qty, setQty] = React.useState(0);

  const [openLb, setOpenLb] = React.useState(false);
  const [lbIndex, setLbIndex] = React.useState(0);

  const [authOpen, setAuthOpen] = React.useState(false);

  const images = normalizeImages(data?.heroImageUrl ?? null, data?.gallery ?? []);
  const safeActive = clamp(active, 0, Math.max(0, images.length - 1));

  React.useEffect(() => {
    setActive(0);
  }, [data?.heroImageUrl, (data?.gallery ?? []).join("|")]);

  return (
    <main className="page">
      <div className="shell">
        <Topbar onOpenAuth={() => setAuthOpen(true)} />

        <section className="product">
          <div className="card" style={{
            border: "none",
            background: "transparent",
            boxShadow: "none"
          }}>
            {loading ? (
              <div className="state">Chargement…</div>
            ) : error ? (
              <div className="state">
                <div className="err">Erreur: {error}</div>
                <button className="retry" onClick={refetch}>
                  Recharger
                </button>
              </div>
            ) : data ? (
              <div className="grid">
                <ProductGallery
                  images={images}
                  active={safeActive}
                  onActiveChange={setActive}
                  onOpenLightbox={(i) => {
                    setLbIndex(i);
                    setOpenLb(true);
                  }}
                />

                <ProductInfo
                  title={data.title}
                  subtitle={data.subtitle}
                  description={data.description}
                  qty={qty}
                  setQty={setQty}
                />
              </div>
            ) : (
              <div className="state">Aucune donnée.</div>
            )}
          </div>
        </section>

        <RecapButton />

        <ReviewsSection onRequireAuth={() => setAuthOpen(true)} />

        <Footer />
      </div>

      <GalleryLightbox
        images={images}
        startIndex={lbIndex}
        open={openLb}
        onClose={() => setOpenLb(false)}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={auth.refresh}
        defaultMode="login"
      />

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 22px 16px 42px;
        }
        .shell {
          max-width: var(--container);
          margin: 0 auto;
        }

        .product {
          margin-top: 14px;
        }

        .card {
          border-radius: var(--radius);
          overflow: visible;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 14px;
          align-items: start;
        }

        .state {
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.85);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 16px;
          color: var(--muted);
          font-weight: 800;
        }

        .err {
          color: #7a2a1f;
          margin-bottom: 10px;
        }

        .retry {
          height: 42px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          cursor: pointer;
          font-weight: 900;
          color: var(--text);
        }
        .retry:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
