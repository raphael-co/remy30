"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../Icon";

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

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function GallerySlide({ gallery, reviews }: SlideProps) {
  const router = useRouter();
  const [hoveredSrc, setHoveredSrc] = React.useState<string | null>(null);

  const reviewImgs = React.useMemo(
    () => (reviews || []).map((r) => r.imageUrl || "").filter(Boolean),
    [reviews]
  );

  const images = React.useMemo(() => uniqStrings([...(gallery || []), ...reviewImgs]), [
    gallery,
    reviewImgs,
  ]);

  const tiles = React.useMemo(() => {
    const seed = hashStr(images.join("|")) || 1;
    const rnd = mulberry32(seed);

    const max = 100;
    const slice = images.slice(0, max);

    return slice.map((src, i) => {
      const w = 130 + Math.floor(rnd() * 220);
      const h = 90 + Math.floor(rnd() * 210);

      const x = 12 + rnd() * 76;
      const y = 16 + rnd() * 72;

      const r0 = rnd() * 24 - 12;
      const s = 0.92 + rnd() * 0.45;

      const dx = rnd() * 10 - 5;
      const dy = rnd() * 10 - 5;
      const r1 = r0 + (rnd() * 10 - 5);

      const dur = 2.8 + rnd() * 2.8;
      const delay = rnd() * 0.6;

      const z = 10 + Math.floor(rnd() * 10);

      return { src, i, x, y, w, h, r0, r1, s, dx, dy, dur, delay, z };
    });
  }, [images]);

  const count = images.length;
  const productCount = gallery?.length ?? 0;
  const commentsCount = reviewImgs.length;

  function openGallery(src: string) {
    const q = encodeURIComponent(src);
    router.push(`/galerie?photo=${q}`);
  }

  return (
    <div className="galRoot">
      <div className="galHeader">
        <div className="kicker">Galerie</div>
        <div className="title">Moments capturés</div>

        <div className="galBadges">
          <span className="pill">
            <Icon name="photo" size={16} />
            {productCount} produit
          </span>
          <span className="pill">
            <Icon name="quote" size={16} />
            {commentsCount} commentaires
          </span>
          <span className="pill">
            <Icon name="sparkles" size={16} />
            {count} au total
          </span>
        </div>
      </div>

      <div className="wall" aria-label="Mur d'images">
        {!count ? (
          <div className="empty">
            <div className="big">Galerie vide</div>
            <div className="small">Ajoute des images au produit ou aux avis.</div>
          </div>
        ) : (
          <>
            <div className="fog" />
            <div className="vignette" />

            {tiles.map((t) => {
              const isHover = hoveredSrc === t.src;

              return (
                <motion.button
                  key={`${t.src}-${t.i}`}
                  type="button"
                  className={`${isHover ? "isHover" : ""}`}
                  onClick={() => openGallery(t.src)}
                  onMouseEnter={() => setHoveredSrc(t.src)}
                  onMouseLeave={() => setHoveredSrc(null)}
                  onFocus={() => setHoveredSrc(t.src)}
                  onBlur={() => setHoveredSrc(null)}
                  aria-label="Ouvrir dans la galerie"
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    width: `${t.w}px`,
                    height: `${t.h}px`,
                    zIndex: isHover ? 9999 : t.z,
                    background : 'transparent',
                    border: "none"
                  }}
                  initial={{ opacity: 0, scale: 0.96, rotate: t.r0, x: "0%", y: "0%" }}
                  animate={{ opacity: 1, scale: t.s, rotate: t.r1, x: `${t.dx}%`, y: `${t.dy}%` }}
                  transition={{ duration: t.dur, ease: "easeOut", delay: t.delay }}
                  whileHover={{ scale: t.s * 1.08, rotate: t.r1 * 0.5 }}
                  whileTap={{ scale: t.s * 0.98 }}
                >
                  <img className="imgT" src={t.src} alt="" loading="lazy" />
                  <span className="shine" aria-hidden="true" />
                </motion.button>
              );
            })}
          </>
        )}
      </div>

      {/* <div className="galHint">Tape une image pour l’ouvrir dans /galerie.</div> */}

      <style jsx>{`
        .galRoot {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 0;
        }

        .galHeader {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 20;
          padding: 10px;
          pointer-events: none;
          max-width: 100%;
        }

        .galBadges {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          pointer-events: none;
        }

        .wall {
          position: absolute;
          inset: 0;
          overflow: hidden;
          isolation: isolate;
        }

        .fog {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.12), transparent 60%),
            radial-gradient(circle at 82% 70%, rgba(255, 255, 255, 0.10), transparent 60%);
          pointer-events: none;
          z-index: 1;
        }

        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.62));
          pointer-events: none;
          z-index: 2;
        }

        .tile {
          position: absolute;
          transform: translate(-50%, -50%);
          border: 0;
          padding: 0;
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          z-index: 10;
          will-change: transform;
          outline: none;
        }

        .tile.isHover {
          box-shadow: 0 34px 110px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.22);
        }

        .imgT {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transform: scale(1.03);
          filter: saturate(1.12) contrast(1.05);
        }

        .shine {
          position: absolute;
          inset: -60px;
          background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.16), transparent 55%);
          opacity: 0.9;
          pointer-events: none;
        }

        .empty {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          gap: 8px;
          padding: 20px;
          z-index: 10;
        }

        .galHint {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 18px;
          z-index: 20;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          pointer-events: none;
        }

        @media (max-width: 520px) {
          .galHeader {
            padding: 16px 16px 10px;
          }
          .galHint {
            left: 16px;
            right: 16px;
            bottom: 14px;
          }
          .tile {
            border-radius: 18px;
          }
        }
      `}</style>
    </div>
  );
}

export default GallerySlide;
