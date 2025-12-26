"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { clamp, formatDate, stars } from "../../utils";
import { Icon } from "../Icon";

export function ReviewsSlide({ latestReviews }: SlideProps) {
  const items = React.useMemo(() => latestReviews || [], [latestReviews]);

  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // progress (0..1) + autoplay
  const DURATION_MS = 5200;
  const [p, setP] = React.useState(0);

  React.useEffect(() => {
    setIdx(0);
    setP(0);
  }, [items.length]);

  React.useEffect(() => {
    if (!items.length) return;
    if (paused) return;

    let raf = 0;
    let start = performance.now();

    const tick = (t: number) => {
      const dt = t - start;
      const prog = clamp(dt / DURATION_MS, 0, 1);
      setP(prog);

      if (prog >= 1) {
        start = performance.now();
        setP(0);
        setIdx((x) => (x + 1) % items.length);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items.length, paused]);

  const r = items[idx] ?? null;

  const rating = clamp(r?.rating || 0, 0, 5);
  const starLabel = stars(rating);

  const total = items.length || 1;

  const prev = () => {
    if (!items.length) return;
    setIdx((x) => (x - 1 + items.length) % items.length);
    setP(0);
  };

  const next = () => {
    if (!items.length) return;
    setIdx((x) => (x + 1) % items.length);
    setP(0);
  };

  const img = (r?.imageUrl || "").trim() || null;

  return (
    <div
      className="stack review"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="kicker">Avis</div>

      <div className="headRow">
        <div>
          <div className="title">Ce qu’ils en pensent</div>
          <div className="subtitle">{items.length ? "Top avis récents" : "Pas encore d’avis."}</div>
        </div>

        <div className="headRight">
          <div className="count">{items.length ? `${idx + 1}/${items.length}` : "—"}</div>
          <button className="navBtn" onClick={prev} aria-label="Avis précédent" disabled={!items.length}>
            ‹
          </button>
          <button className="navBtn" onClick={next} aria-label="Avis suivant" disabled={!items.length}>
            ›
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="bars" aria-label="Progression des avis">
        {Array.from({ length: total }).map((_, i) => {
          const v = i < idx ? 1 : i > idx ? 0 : p;
          return (
            <div key={i} className="bar">
              <div className="fill" style={{ transform: `scaleX(${v})` }} />
            </div>
          );
        })}
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          {r ? (
            <motion.div
              key={r.id}
              className="rWrap"
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="content">
                {img ? (
                  <div className="imgWrap" aria-hidden="true">
                    <img className="img" src={img} alt="" loading="lazy" />
                    <div className="imgGlow" />
                  </div>
                ) : null}

                <div className="text">
                  <div className="top">
                    <div className="who">
                      <div className="av">{(r.name || "?").slice(0, 1).toUpperCase()}</div>
                      <div className="whoTxt">
                        <div className="name">{r.name || "Anonyme"}</div>
                        <div className="date">{r.createdAt ? formatDate(r.createdAt) : "—"}</div>
                      </div>
                    </div>

                    <div className="rating">
                      <Icon name="star" />
                      <span className="stars">{starLabel}</span>
                    </div>
                  </div>

                  <div className="msg">{r.message?.trim() || "—"}</div>

                  <div className="footer">
                    <span className="pill">{paused ? "Pause" : "Auto"}</span>
                    <span className="pill">Maintiens pour pause</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="empty">Aucun avis pour le moment.</div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .stack {
          height: 100%;
          width: 100%;
          padding: clamp(16px, 3vw, 44px);
          display: grid;
          align-content: center;
          gap: 12px;
        }

        .kicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }

        .headRow {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .title {
          font-size: 26px;
          font-weight: 950;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.78);
          margin-top: 4px;
        }

        .headRight {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.68);
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .navBtn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.22);
          color: #fff;
          font-size: 22px;
          line-height: 1;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .navBtn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .bars {
          display: grid;
          grid-template-columns: repeat(${total}, minmax(0, 1fr));
          gap: 8px;
          margin-top: 2px;
          margin-bottom: 2px;
        }

        .bar {
          height: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          overflow: hidden;
        }

        .fill {
          height: 100%;
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          transform-origin: left center;
          transition: transform 80ms linear;
          will-change: transform;
        }

        .card {
          width: min(860px, 100%);
          margin: 0 auto;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
          overflow: hidden;
          box-shadow: 0 40px 130px rgba(0, 0, 0, 0.45);
          padding: 16px;
          min-height: 240px;
          display: grid;
          align-content: center;
        }

        .content {
          display: grid;
          grid-template-columns: ${img ? "220px 1fr" : "1fr"};
          gap: 14px;
          align-items: center;
        }

        .imgWrap {
          position: relative;
          width: 100%;
          height: 220px;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
        }

        .img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.03);
          filter: saturate(1.12) contrast(1.05);
        }

        .imgGlow {
          position: absolute;
          inset: -80px;
          background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.16), transparent 60%);
          pointer-events: none;
        }

        .text {
          min-width: 0;
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .who {
          display: flex;
          gap: 10px;
          align-items: center;
          min-width: 0;
        }

        .whoTxt {
          min-width: 0;
        }

        .av {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-weight: 950;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          flex: 0 0 auto;
        }

        .name {
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 34ch;
        }

        .date {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .rating {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 950;
          color: rgba(255, 255, 255, 0.9);
          flex: 0 0 auto;
        }

        .stars {
          letter-spacing: -0.02em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .msg {
          margin-top: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.88);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .footer {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .pill {
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.78);
          font-weight: 900;
        }

        .empty {
          opacity: 0.8;
          text-align: center;
          padding: 18px 0;
        }

        @media (max-width: 720px) {
          .content {
            grid-template-columns: 1fr;
          }
          .imgWrap {
            height: 220px;
          }
          .name {
            max-width: 22ch;
          }
        }

        @media (max-width: 520px) {
          .navBtn {
            width: 38px;
            height: 38px;
          }
          .card {
            min-height: 280px;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewsSlide;
