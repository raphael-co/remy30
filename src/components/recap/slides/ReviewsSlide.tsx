// src/components/recap/slides/ReviewsSlide.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { clamp, formatDate, stars } from "../lib/utils";
import { Icon } from "../components/Icon";

export function ReviewsSlide({ reviews, latestReviews }: SlideProps) {
  const items = React.useMemo(() => latestReviews || [], [latestReviews]);

  // défilement auto (un par un)
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // reset si la liste change
  React.useEffect(() => {
    setIdx(0);
  }, [items.length]);

  // auto-advance
  React.useEffect(() => {
    if (!items.length) return;
    if (paused) return;

    const t = window.setInterval(() => {
      setIdx((x) => (x + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(t);
  }, [items.length, paused]);

  const r = items[idx] ?? null;

  return (
    <div className="stack review">
      <div className="kicker">Avis</div>
      <div className="title">Ce qu’ils en pensent</div>
      <div className="subtitle">
        {reviews.length ? `Avis ${Math.min(idx + 1, items.length)}/${items.length}` : "Pas encore d’avis."}
      </div>

      {!reviews.length ? null : (
        <div className="stage">
          <button
            type="button"
            className="pauseBtn"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Reprendre" : "Pause"}
          >
            {paused ? <Icon name="play" size={16} /> : <Icon name="pause" size={16} />}
            {paused ? "Reprendre" : "Pause"}
          </button>

          <AnimatePresence mode="wait">
            {r ? (
              <motion.div
                key={r.id}
                className="card"
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.99 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* top */}
                <div className="top">
                  <div className="who">
                    <span className="avatar">
                      {(r.name || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="txt">
                      <div className="name">{r.name || "Anonyme"}</div>
                      <div className="date">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>

                  <div className="rate">
                    <span className="stars">{stars(r.rating).slice(0, 5)}</span>
                    <span className="num">{clamp(r.rating, 0, 5)}/5</span>
                  </div>
                </div>

                {/* body */}
                {r.message ? <div className="msg">{r.message}</div> : null}

                {/* image (si existe) */}
                {r.imageUrl ? (
                  <div className="imgWrap">
                    <img className="img" src={r.imageUrl} alt="" loading="lazy" />
                    <div className="imgShade" />
                  </div>
                ) : null}

                {/* dots */}
                <div className="dots" aria-label="Progression">
                  {items.slice(0, 8).map((it, i) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`dot ${i === idx ? "on" : ""}`}
                      onClick={() => setIdx(i)}
                      aria-label={`Afficher avis ${i + 1}`}
                    />
                  ))}
                  {items.length > 8 ? <span className="more">+{items.length - 8}</span> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      <style jsx>{`
        .review {
          gap: 14px;
          padding: clamp(16px, 3vw, 44px);
          max-width: none;
        }

        .stage {
          position: relative;
          width: 100%;
          max-width: 980px;
        }

        .pauseBtn {
          position: absolute;
          right: 0;
          top: -48px;
          height: 40px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .pauseBtn:hover {
          background: rgba(0, 0, 0, 0.36);
        }

        .card {
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
        }

        .who {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-weight: 1000;
          background: rgba(255, 255, 255, 0.92);
          color: rgba(0, 0, 0, 0.9);
        }

        .txt {
          min-width: 0;
        }

        .name {
          font-weight: 1000;
          letter-spacing: -0.02em;
          color: rgba(255, 255, 255, 0.92);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 520px;
        }

        .date {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
        }

        .rate {
          display: grid;
          justify-items: end;
          gap: 2px;
          padding-top: 2px;
        }

        .stars {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.92);
          font-weight: 900;
        }

        .num {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
        }

        .msg {
          padding: 0 16px 16px;
          font-size: 16px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.82);
        }

        .imgWrap {
          position: relative;
          height: min(42vh, 320px);
          background: rgba(255, 255, 255, 0.06);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          display : flex;
          justify-content : center;
          align-items: center;
        }

        .img {
          height: 100%;
          object-fit: constain;
          display: block;
        }

        .imgShade {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.12), transparent 55%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.35));
          pointer-events: none;
        }

        .dots {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          border: 0;
          background: rgba(255, 255, 255, 0.22);
          cursor: pointer;
          padding: 0;
        }

        .dot.on {
          background: rgba(255, 255, 255, 0.92);
        }

        .more {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          font-weight: 900;
          margin-left: 2px;
        }

        @media (max-width: 520px) {
          .pauseBtn {
            top: -44px;
          }
          .name {
            max-width: 220px;
          }
          .imgWrap {
            height: 220px;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewsSlide;
