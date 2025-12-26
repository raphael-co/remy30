"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../Icon";

export function ProductSlide({ product, reviews, gallery }: SlideProps) {
  const title = product?.title?.trim() || "—";
  const desc = product?.description?.trim() || "Ajoute une description dans /admin pour personnaliser cette slide.";

  const reviewCount = reviews?.length ?? 0;
  const galleryCount = gallery?.length ?? 0;

  const cover = gallery?.[0] || product?.heroImageUrl || null;

  return (
    <div className="stack product">
      <motion.div className="kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        Produit
      </motion.div>

      <motion.div className="pCard" initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: "easeOut", delay: 0.04 }}>
        <div className="pCover">
          {cover ? <img className="pImg" src={cover} alt="" /> : <div className="pFallback" />}
          <div className="pGlow" />
        </div>

        <div className="pBody">
          <div className="pTitle">{title}</div>
          <div className="pDesc">{desc}</div>

          <div className="pMeta">
            <span className="pill">
              <Icon name="photo" size={16} /> {galleryCount} photos
            </span>
            <span className="pill">
              <Icon name="quote" size={16} /> {reviewCount} avis
            </span>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .stack {
          height: 100%;
          width: 100%;
          padding: 22px;
          display: grid;
          align-content: center;
          gap: 14px;
        }
        .kicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }
        .pCard {
          width: min(620px, 100%);
          margin: 0 auto;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
          overflow: hidden;
          box-shadow: 0 40px 130px rgba(0, 0, 0, 0.45);
          display: grid;
          grid-template-columns: 220px 1fr;
        }
        .pCover {
          position: relative;
          min-height: 220px;
          background: rgba(255, 255, 255, 0.06);
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }
        .pImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.03);
          filter: saturate(1.15) contrast(1.06);
        }
        .pFallback {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18), transparent 60%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.92));
        }
        .pGlow {
          position: absolute;
          inset: -80px;
          background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.18), transparent 60%);
          pointer-events: none;
        }
        .pBody {
          padding: 18px;
          display: grid;
          gap: 10px;
          align-content: center;
        }
        .pTitle {
          font-size: 24px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .pDesc {
          font-size: 14px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.82);
        }
        .pMeta {
          margin-top: 6px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          font-weight: 800;
          font-size: 12px;
        }

        @media (max-width: 520px) {
          .pCard {
            grid-template-columns: 1fr;
          }
          .pCover {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            min-height: 180px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductSlide;
