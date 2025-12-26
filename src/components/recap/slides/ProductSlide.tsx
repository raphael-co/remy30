// src/components/recap/slides/ProductSlide.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../components/Icon";

export function ProductSlide({ product, reviews, gallery }: SlideProps) {
  const title = product?.title?.trim() || "—";
  const desc =
    product?.description?.trim() ||
    "Ajoute une description dans /admin pour personnaliser cette slide.";

  const reviewCount = reviews?.length ?? 0;
  const galleryCount = gallery?.length ?? 0;

  // "photo de fond" (utilisée par SlideShell via bg dans RecapPlayer/useRecapSlides)
  // Ici on te propose juste une "cover card" qui montre la photo sélectionnée + un effet.
  // Pour changer le fond réel de la slide, voir note tout en bas (bgForSlide).
  const cover = gallery?.[0] || product?.heroImageUrl || null;

  return (
    <div className="stack product">
      {/* Header */}
      <motion.div
        className="kicker"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        Produit
      </motion.div>

      {/* Card (style Spotify/YouTube recap) */}
      <motion.div
        className="pCard"
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.04 }}
      >
        <div className="pGrid">
          <div className="pImgWrap" aria-hidden="true">
            {cover ? <img className="pImg" src={cover} alt="" /> : <div className="pImgFallback" />}
            <div className="pImgGlow" />
          </div>

          <div className="pMeta">
            <div className="pTitle">{title}</div>
            <div className="pDesc">{desc}</div>

            <div className="pStats">
              <span className="pill">
                <Icon name="photo" size={16} />
                {galleryCount} photos
              </span>
              <span className="pill">
                <Icon name="quote" size={16} />
                {reviewCount} avis
              </span>
              <span className="pill">
                <Icon name="sparkles" size={16} />
                Story mode
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Secondary hint */}
      <motion.div
        className="pHint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.14 }}
      >
        Astuce : clique à droite pour continuer
      </motion.div>

      <style jsx>{`
        .product {
          gap: 12px;
        }

        .pCard {
          width: 100%;
          max-width: 980px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .pGrid {
          display: grid;
          grid-template-columns: 210px 1fr;
          gap: 18px;
          padding: 16px;
        }

        .pImgWrap {
          position: relative;
          width: 210px;
          height: 210px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
        }

        .pImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.03);
          filter: saturate(1.1) contrast(1.05);
        }

        .pImgFallback {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.18), transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.12), transparent 55%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.92));
        }

        .pImgGlow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.14), transparent 55%);
          pointer-events: none;
        }

        .pMeta {
          display: grid;
          align-content: center;
          gap: 10px;
          min-width: 0;
        }

        .pTitle {
          font-size: clamp(26px, 4vw, 52px);
          line-height: 1.02;
          font-weight: 1000;
          letter-spacing: -0.04em;
          color: rgba(255, 255, 255, 0.96);
          text-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pDesc {
          font-size: 15px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.74);
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pStats {
          margin-top: 6px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pHint {
          margin-top: 2px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          max-width: 860px;
        }

        @media (max-width: 820px) {
          .pGrid {
            grid-template-columns: 160px 1fr;
          }
          .pImgWrap {
            width: 160px;
            height: 160px;
            border-radius: 20px;
          }
          .pTitle {
            white-space: normal;
          }
        }

        @media (max-width: 560px) {
          .pGrid {
            grid-template-columns: 1fr;
          }
          .pImgWrap {
            width: 100%;
            height: 190px;
          }
          .pTitle {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductSlide;
