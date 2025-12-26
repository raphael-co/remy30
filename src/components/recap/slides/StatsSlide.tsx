// src/components/recap/slides/StatsSlide.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../components/Icon";
import { clamp, formatDate, stars } from "../lib/utils";

export function StatsSlide({ reviews, latestReviews, avg, gallery }: SlideProps) {
  const reviewCount = reviews?.length ?? 0;
  const galleryCount = gallery?.length ?? 0;

  const last = latestReviews?.[0] ?? null;
  const lastName = last?.name?.trim() || "—";
  const lastDate = last?.createdAt ? formatDate(last.createdAt) : "—";

  const hasReviews = reviewCount > 0;
  const avgLabel = hasReviews ? avg.toFixed(1) : "—";
  const starLabel = hasReviews ? stars(avg).slice(0, 5) : "Aucun avis";

  const ratingPct = hasReviews ? clamp(avg / 5, 0, 1) : 0;

  return (
    <div className="stack stats">
      <motion.div
        className="kicker"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        Stats
      </motion.div>

      {/* Big number + meter (Spotify-ish) */}
      <motion.div
        className="heroStat"
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.04 }}
      >
        <div className="hsTop">
          <div className="hsTitle">
            <Icon name="star" size={18} />
            Note moyenne
          </div>

          <div className="hsValue">
            <span className="hsNum">{avgLabel}</span>
            <span className="hsOut">/5</span>
          </div>
        </div>

        <div className="hsMeter" aria-label="Niveau de note">
          <div className="hsTrack" />
          <motion.div
            className="hsFill"
            initial={{ transform: "scaleX(0)" }}
            animate={{ transform: `scaleX(${ratingPct})` }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        </div>

        <div className="hsSub">
          <span className="hsStars">{starLabel}</span>
          <span className="hsMeta">
            {reviewCount} avis • {galleryCount} photos
          </span>
        </div>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        className="cards statsCards"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="card statCard">
          <div className="cardTop">
            <Icon name="quote" size={18} />
            Avis
          </div>
          <div className="cardVal">{reviewCount || "—"}</div>
          <div className="cardSub">{reviewCount ? "au total" : "aucun pour l’instant"}</div>
        </div>

        <div className="card statCard">
          <div className="cardTop">
            <Icon name="photo" size={18} />
            Galerie
          </div>
          <div className="cardVal">{galleryCount || "—"}</div>
          <div className="cardSub">{galleryCount ? "images" : "vide"}</div>
        </div>

        <div className="card statCard">
          <div className="cardTop">
            <Icon name="quote" size={18} />
            Dernier avis
          </div>
          <div className="cardVal">{lastName}</div>
          <div className="cardSub">{lastDate}</div>
        </div>
      </motion.div>

      <style jsx>{`
        .stats {
          gap: 12px;
          padding: clamp(16px, 3vw, 44px);
        }

        .heroStat {
          width: 100%;
          max-width: 980px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
          padding: 16px;
        }

        .hsTop {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
        }

        .hsTitle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.74);
          font-weight: 950;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hsValue {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          color: rgba(255, 255, 255, 0.96);
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .hsNum {
          font-size: 46px;
          line-height: 1;
        }

        .hsOut {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.62);
          font-weight: 900;
        }

        .hsMeter {
          position: relative;
          margin-top: 12px;
          height: 10px;
          border-radius: 999px;
          overflow: hidden;
        }

        .hsTrack {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.14);
        }

        .hsFill {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          transform-origin: left center;
          will-change: transform;
        }

        .hsSub {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hsStars {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.92);
          font-weight: 900;
        }

        .hsMeta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .statsCards {
          margin-top: 0;
        }

        .statCard {
          backdrop-filter: blur(10px);
        }

        @media (max-width: 980px) {
          .hsTop {
            align-items: center;
          }
          .hsNum {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}

export default StatsSlide;
