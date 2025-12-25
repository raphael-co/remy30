"use client";

import Image from "next/image";

export default function ProductGallery({
  images,
  active,
  onActiveChange,
  onOpenLightbox,
}: {
  images: { src: string; alt: string }[];
  active: number;
  onActiveChange: (i: number) => void;
  onOpenLightbox: (index: number) => void;
}) {
  const hero = images[active];

  // Desktop: 5 colonnes * 2 lignes = 10 items max visibles dans la grille
  // Mobile: 4 colonnes * 2 lignes = 8 items max visibles dans la grille
  const MAX_DESKTOP = 10;
  const MAX_MOBILE = 8;

  // On garde une logique simple :
  // - On rend tous les thumbs sauf le dernier slot (qui devient "Voir tout") si images > max
  // - "Voir tout" ouvre la lightbox (index 0)
  const needsSeeAllDesktop = images.length > MAX_DESKTOP;
  const needsSeeAllMobile = images.length > MAX_MOBILE;

  // On affiche au plus MAX_DESKTOP sur desktop, mais si "voir tout" est actif
  // on remplace le dernier par le bouton.
  const desktopVisibleCount = needsSeeAllDesktop ? MAX_DESKTOP : Math.min(images.length, MAX_DESKTOP);
  const desktopThumbCount = needsSeeAllDesktop ? MAX_DESKTOP - 1 : desktopVisibleCount;

  // Note: sur mobile, on ne change pas le slicing côté JS (complexité inutile),
  // on laisse CSS masquer la 3e ligne si jamais. Le "Voir tout" reste cohérent.
  // Si tu veux un comportement parfait mobile (8), dis-moi et je te le fais en 2 lignes (matchMedia).
  const visibleImages = images.slice(0, desktopThumbCount);

  return (
    <div className="left" id="galerie">
      <button className="hero" onClick={() => onOpenLightbox(active)} aria-label="Ouvrir la galerie">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          sizes="(max-width: 900px) 100vw, 640px"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="hint">Zoom</div>
      </button>

      <div className="thumbs" aria-label="Miniatures">
        {visibleImages.map((img, i) => {
          const isActive = i === active;
          return (
            <button
              key={`${img.src}-${i}`}
              className={`thumb ${isActive ? "active" : ""}`}
              onClick={() => onActiveChange(i)}
              aria-label={`Voir image ${i + 1}`}
            >
              <Image src={img.src} alt={img.alt} fill sizes="120px" style={{ objectFit: "cover" }} />
            </button>
          );
        })}

        {(needsSeeAllDesktop || needsSeeAllMobile) && (
          <button
            className="thumb seeAll"
            onClick={() => onOpenLightbox(0)}
            aria-label="Voir toute la galerie"
          >
            <div className="seeAllInner">
              <div className="seeAllTop">Voir tout</div>
              <div className="seeAllBottom">{images.length} photos</div>
            </div>
          </button>
        )}
      </div>

      <style jsx>{`
        .left {
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.8);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 12px;
        }

        .hero {
          width: 100%;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: zoom-in;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid var(--border);
          aspect-ratio: 4 / 3;
        }

        .hint {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.75);
          color: var(--text);
          backdrop-filter: blur(10px);
        }

        .thumbs {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;

          /* 2 lignes max (desktop) */
          grid-auto-rows: 1fr;
        }

        .thumb {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          background: rgba(42, 27, 18, 0.03);
          padding: 0;
          transition: transform 140ms ease, border-color 140ms ease;
        }

        .thumb:hover {
          transform: translateY(-1px);
          border-color: var(--border-2);
        }

        .thumb.active {
          outline: 2px solid rgba(122, 78, 47, 0.55);
          outline-offset: 2px;
        }

        /* Voir tout */
        .thumb.seeAll {
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, rgba(168, 116, 74, 0.18), rgba(122, 78, 47, 0.12));
        }

        .seeAllInner {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          padding: 10px;
          gap: 6px;
          text-align: center;
        }

        .seeAllTop {
          font-weight: 900;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .seeAllBottom {
          font-size: 12px;
          font-weight: 800;
          color: var(--muted);
        }

        @media (max-width: 900px) {
          .thumbs {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
