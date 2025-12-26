"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type RecapSlide =
  | { id: string; type: "intro"; title: string; subtitle?: string; bgImageUrl?: string | null }
  | { id: string; type: "gallery"; title?: string; images: string[] }
  | { id: string; type: "moment"; image: string; comment: string; author?: string; meta?: string }
  | { id: string; type: "stats"; title?: string; value: number | string; label: string; hint?: string }
  | { id: string; type: "final"; image?: string | null; message: string; ctaLabel?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  slides: RecapSlide[];
  autoplay?: boolean;
  slideDurationMs?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useInterval(callback: () => void, delay: number | null) {
  const saved = React.useRef(callback);
  React.useEffect(() => {
    saved.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

function formatIndex(i: number, total: number) {
  const a = String(i + 1).padStart(2, "0");
  const b = String(total).padStart(2, "0");
  return `${a}/${b}`;
}

export type RecapReview = {
  comment: string;
  author?: string;
  imageUrl?: string | null;
  createdAt?: string | null;
};

export function buildRecapSlides(input: {
  images: string[];
  reviews: RecapReview[];
  title?: string;
  subtitle?: string;
}): RecapSlide[] {
  const cleanImages = (input.images ?? []).filter(Boolean).slice(0, 60);
  const cleanReviews = (input.reviews ?? [])
    .filter((r) => (r?.comment ?? "").trim().length > 0)
    .slice(0, 30);

  const moments: RecapSlide[] = cleanReviews.map((r, idx) => {
    const fallbackImage = cleanImages[idx % Math.max(1, cleanImages.length)] ?? "";
    return {
      id: `moment-${idx}`,
      type: "moment",
      image: (r.imageUrl && r.imageUrl.trim()) || fallbackImage,
      comment: r.comment.trim(),
      author: r.author?.trim() || undefined,
      meta: r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : undefined,
    };
  });

  const statsSlides: RecapSlide[] = [
    { id: "stats-1", type: "stats", title: "En chiffres", value: cleanImages.length, label: "images partagées" },
    { id: "stats-2", type: "stats", value: cleanReviews.length, label: "messages" },
  ];

  const intro: RecapSlide = {
    id: "intro",
    type: "intro",
    title: input.title ?? "Recap",
    subtitle: input.subtitle ?? "Les images & messages qui ont marqué ce moment",
    bgImageUrl: cleanImages[0] ?? null,
  };

  const gallery: RecapSlide = {
    id: "gallery",
    type: "gallery",
    title: "Les moments en images",
    images: cleanImages,
  };

  const final: RecapSlide = {
    id: "final",
    type: "final",
    image: cleanImages[0] ?? null,
    message: "Merci d’avoir partagé ces souvenirs.",
    ctaLabel: "Revoir",
  };

  const topMoments = moments.slice(0, 10);
  return [intro, gallery, ...topMoments, ...statsSlides, final];
}

export default function RecapPlayer({
  open,
  onClose,
  slides,
  autoplay = true,
  slideDurationMs = 5200,
  loop = true,
  onIndexChange,
}: Props) {
  const reduceMotion = useReducedMotion();

  const total = slides.length;
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(autoplay);
  const [progress, setProgress] = React.useState(0);

  const dragging = React.useRef(false);
  const dragStartX = React.useRef(0);
  const dragDeltaX = React.useRef(0);

  React.useEffect(() => {
    if (!open) return;
    setIndex(0);
    setProgress(0);
    setPlaying(autoplay);
  }, [open, autoplay]);

  React.useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const current = slides[index];

  const go = React.useCallback(
    (nextIndex: number) => {
      const n = clamp(nextIndex, 0, Math.max(0, total - 1));
      setIndex(n);
      setProgress(0);
    },
    [total]
  );

  const next = React.useCallback(() => {
    if (total === 0) return;
    if (index === total - 1) {
      if (loop) go(0);
      else setPlaying(false);
      return;
    }
    go(index + 1);
  }, [go, index, total, loop]);

  const prev = React.useCallback(() => {
    if (total === 0) return;
    if (index === 0) {
      if (loop) go(total - 1);
      return;
    }
    go(index - 1);
  }, [go, index, total, loop]);

  React.useEffect(() => {
    if (!open) return;
    if (!playing) return;
    if (reduceMotion) return;
    if (total === 0) return;

    let raf = 0;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = clamp(elapsed / slideDurationMs, 0, 1);
      setProgress(p);

      if (p >= 1) {
        setProgress(0);
        start = performance.now();
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, playing, slideDurationMs, next, reduceMotion, total]);

  useInterval(
    () => {
      if (!open) return;
      if (!playing) return;
      if (!reduceMotion) return;
      if (total === 0) return;
      next();
    },
    open && playing && reduceMotion && total > 0 ? slideDurationMs : null
  );

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setPlaying((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [open, next, prev, onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const dx = dragDeltaX.current;
    const threshold = 60;

    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();

    dragDeltaX.current = 0;
  };

  if (!open) return null;

  return (
    <div className="rpRoot" role="dialog" aria-modal="true" aria-label="Recap">
      <div className="rpTop">
        <div className="rpBrand">
          <div className="rpDot" />
          <div className="rpBrandTitle">Recap</div>
          <div className="rpCount">{formatIndex(index, total || 1)}</div>
        </div>

        <div className="rpControls">
          <button className="rpIconBtn" onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause" : "Play"}>
            <span className="rpIcon">{playing ? "❚❚" : "▶"}</span>
          </button>
          <button className="rpIconBtn" onClick={onClose} aria-label="Fermer">
            <span className="rpIcon">✕</span>
          </button>
        </div>
      </div>

      <div className="rpProgressWrap" aria-hidden="true">
        <div className="rpProgressBg">
          <div className="rpProgressFg" style={{ transform: `scaleX(${reduceMotion ? 0 : easeOutCubic(progress)})` }} />
        </div>
      </div>

      <div
        className="rpStage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button className="rpNavBtn rpLeft" onClick={prev} aria-label="Précédent">
          ‹
        </button>

        <div className="rpSlideShell">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? String(index)}
              className="rpSlide"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 16 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: -12 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {total === 0 ? <EmptySlide /> : <SlideRenderer slide={current!} onNext={next} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <button className="rpNavBtn rpRight" onClick={next} aria-label="Suivant">
          ›
        </button>
      </div>

      <div className="rpBottom">
        <button className="rpPill" onClick={prev}>
          ← Précédent
        </button>
        <button className="rpPill" onClick={next}>
          Suivant →
        </button>
      </div>

      <style jsx>{`
        .rpRoot {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: radial-gradient(1200px 800px at 20% 10%, rgba(255, 255, 255, 0.08), transparent 60%),
            radial-gradient(900px 700px at 90% 30%, rgba(255, 255, 255, 0.06), transparent 55%),
            linear-gradient(180deg, #0a0a0f, #07070b 40%, #050509);
          color: rgba(255, 255, 255, 0.92);
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          user-select: none;
          touch-action: pan-y;
        }

        .rpTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
        }

        .rpBrand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 180px;
        }
        .rpDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.08);
        }
        .rpBrandTitle {
          font-weight: 650;
          letter-spacing: 0.2px;
        }
        .rpCount {
          font-size: 12px;
          opacity: 0.75;
          padding: 4px 8px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
        }

        .rpControls {
          display: flex;
          gap: 8px;
        }
        .rpIconBtn {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .rpIconBtn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .rpIcon {
          font-size: 16px;
          line-height: 1;
        }

        .rpProgressWrap {
          padding: 0 16px 8px 16px;
        }
        .rpProgressBg {
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }
        .rpProgressFg {
          height: 100%;
          transform-origin: 0% 50%;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
        }

        .rpStage {
          display: grid;
          grid-template-columns: 64px 1fr 64px;
          align-items: center;
          padding: 10px 10px 0 10px;
        }

        .rpSlideShell {
          width: min(980px, calc(100vw - 140px));
          margin: 0 auto;
          height: min(74vh, 720px);
          position: relative;
        }

        .rpSlide {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        }

        .rpNavBtn {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
          display: grid;
          place-items: center;
          font-size: 28px;
          transition: transform 120ms ease, background 120ms ease;
        }
        .rpNavBtn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
        }
        .rpLeft {
          justify-self: center;
        }
        .rpRight {
          justify-self: center;
        }

        .rpBottom {
          padding: 14px 16px 18px 16px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .rpPill {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          border-radius: 999px;
          padding: 10px 14px;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease;
          font-weight: 600;
          letter-spacing: 0.15px;
        }
        .rpPill:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
        }

        @media (max-width: 720px) {
          .rpStage {
            grid-template-columns: 1fr;
          }
          .rpNavBtn {
            display: none;
          }
          .rpSlideShell {
            width: calc(100vw - 20px);
            height: min(76vh, 640px);
          }
          .rpBottom {
            gap: 8px;
          }
          .rpPill {
            width: 46%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

function SlideRenderer({ slide, onNext }: { slide: RecapSlide; onNext: () => void }) {
  switch (slide.type) {
    case "intro":
      return <IntroSlide slide={slide} onNext={onNext} />;
    case "gallery":
      return <GallerySlide slide={slide} />;
    case "moment":
      return <MomentSlide slide={slide} />;
    case "stats":
      return <StatsSlide slide={slide} />;
    case "final":
      return <FinalSlide slide={slide} onNext={onNext} />;
    default:
      return null;
  }
}

function EmptySlide() {
  return (
    <div className="rpEmpty">
      <div className="rpEmptyBox">
        <div className="rpEmptyTitle">Aucune donnée</div>
        <div className="rpEmptySub">Vérifie que /api/product et /api/reviews renvoient bien des données.</div>
      </div>

      <style jsx>{`
        .rpEmpty {
          width: 100%;
          height: 100%;
          display: grid;
          place-content: center;
          padding: 24px;
        }
        .rpEmptyBox {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(10px);
          padding: 18px 18px 16px 18px;
          width: min(640px, 92vw);
          text-align: center;
        }
        .rpEmptyTitle {
          font-weight: 850;
          font-size: 18px;
          letter-spacing: 0.1px;
        }
        .rpEmptySub {
          margin-top: 8px;
          opacity: 0.78;
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

function IntroSlide({ slide, onNext }: { slide: Extract<RecapSlide, { type: "intro" }>; onNext: () => void }) {
  return (
    <div className="rpIntro">
      <div className="rpIntroBg" />
      {slide.bgImageUrl ? (
        <div className="rpIntroImgWrap" aria-hidden="true">
          <motion.div
            className="rpIntroImg"
            initial={{ scale: 1.06, opacity: 0.5 }}
            animate={{ scale: 1.14, opacity: 0.72 }}
            transition={{ duration: 6.2, ease: "easeOut" }}
            style={{ backgroundImage: `url(${slide.bgImageUrl})` }}
          />
          <div className="rpIntroVignette" />
        </div>
      ) : null}

      <div className="rpIntroContent">
        <motion.h1
          className="rpIntroH1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {slide.title}
        </motion.h1>

        {slide.subtitle ? (
          <motion.p
            className="rpIntroP"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 0.88, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {slide.subtitle}
          </motion.p>
        ) : null}

        <motion.button
          className="rpIntroCta"
          onClick={onNext}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          Démarrer →
        </motion.button>
      </div>

      <style jsx>{`
        .rpIntro {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .rpIntroBg {
          position: absolute;
          inset: 0;
          background: radial-gradient(900px 520px at 20% 15%, rgba(255, 255, 255, 0.08), transparent 60%),
            radial-gradient(700px 520px at 90% 20%, rgba(255, 255, 255, 0.06), transparent 55%),
            rgba(255, 255, 255, 0.02);
        }
        .rpIntroImgWrap {
          position: absolute;
          inset: 0;
        }
        .rpIntroImg {
          position: absolute;
          inset: -40px;
          background-position: center;
          background-size: cover;
          filter: blur(18px) saturate(1.05);
        }
        .rpIntroVignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(65% 55% at 50% 42%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.55)),
            linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.6));
        }
        .rpIntroContent {
          position: absolute;
          inset: 0;
          display: grid;
          align-content: center;
          justify-items: center;
          text-align: center;
          padding: 28px;
        }
        .rpIntroH1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 56px);
          letter-spacing: -0.02em;
          line-height: 1.02;
          text-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
        }
        .rpIntroP {
          margin: 14px 0 0 0;
          font-size: 16px;
          max-width: 62ch;
          line-height: 1.55;
        }
        .rpIntroCta {
          margin-top: 22px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.92);
          border-radius: 999px;
          padding: 12px 18px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.2px;
          transition: transform 120ms ease, background 120ms ease;
        }
        .rpIntroCta:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.11);
        }
      `}</style>
    </div>
  );
}

function GallerySlide({ slide }: { slide: Extract<RecapSlide, { type: "gallery" }> }) {
  const images = (slide.images ?? []).filter(Boolean).slice(0, 48);

  return (
    <div className="rpGal">
      <div className="rpGalHead">
        <div className="rpGalTitle">{slide.title ?? "Galerie"}</div>
        <div className="rpGalSub">Un mur vivant de souvenirs.</div>
      </div>

      <div className="rpGalGrid" role="list" aria-label="Galerie">
        {images.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            className="rpGalTile"
            role="listitem"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.02, 0.5), ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="rpGalPhoto"
              style={{ backgroundImage: `url(${src})` }}
              animate={{ y: [0, -2, 0], rotate: [0, 0.18, 0] }}
              transition={{ duration: 4.8 + (i % 7) * 0.25, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .rpGal {
          width: 100%;
          height: 100%;
          padding: 22px;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 14px;
        }
        .rpGalHead {
          display: grid;
          gap: 6px;
          padding: 2px 2px 0 2px;
        }
        .rpGalTitle {
          font-weight: 750;
          font-size: 18px;
          letter-spacing: 0.1px;
        }
        .rpGalSub {
          opacity: 0.78;
          font-size: 13px;
        }

        .rpGalGrid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
          align-content: start;
          overflow: hidden;
        }

        .rpGalTile {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          overflow: hidden;
          aspect-ratio: 1/1;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }
        .rpGalPhoto {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: saturate(1.05) contrast(1.02);
        }

        @media (max-width: 980px) {
          .rpGalGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 560px) {
          .rpGal {
            padding: 16px;
          }
          .rpGalGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }
          .rpGalTile {
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}

function MomentSlide({ slide }: { slide: Extract<RecapSlide, { type: "moment" }> }) {
  return (
    <div className="rpMoment">
      <div className="rpMomentMedia" aria-hidden="true">
        <motion.div
          className="rpMomentImg"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 7.2, ease: "easeOut" }}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="rpMomentVignette" />
      </div>

      <div className="rpMomentOverlay">
        <motion.div
          className="rpMomentCard"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rpMomentQuote">“</div>
          <div className="rpMomentText">{slide.comment}</div>

          {(slide.author || slide.meta) && (
            <div className="rpMomentMeta">
              {slide.author ? <span className="rpMomentAuthor">{slide.author}</span> : null}
              {slide.author && slide.meta ? <span className="rpMomentSep">•</span> : null}
              {slide.meta ? <span className="rpMomentDate">{slide.meta}</span> : null}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .rpMoment {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .rpMomentMedia {
          position: absolute;
          inset: 0;
        }
        .rpMomentImg {
          position: absolute;
          inset: -30px;
          background-size: cover;
          background-position: center;
          filter: saturate(1.04) contrast(1.02);
        }
        .rpMomentVignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 56% at 50% 38%, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.58)),
            linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.62));
        }

        .rpMomentOverlay {
          position: absolute;
          inset: 0;
          display: grid;
          align-content: end;
          padding: 22px;
        }
        .rpMomentCard {
          width: min(740px, 100%);
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(10px);
          padding: 18px 18px 14px 18px;
          box-shadow: 0 22px 55px rgba(0, 0, 0, 0.45);
        }
        .rpMomentQuote {
          font-size: 28px;
          line-height: 1;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        .rpMomentText {
          font-size: 18px;
          line-height: 1.5;
          letter-spacing: 0.1px;
        }
        .rpMomentMeta {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 12px;
          opacity: 0.8;
        }
        .rpMomentAuthor {
          font-weight: 700;
        }
        .rpMomentSep {
          opacity: 0.7;
        }

        @media (max-width: 560px) {
          .rpMomentOverlay {
            padding: 16px;
          }
          .rpMomentText {
            font-size: 16px;
          }
          .rpMomentCard {
            border-radius: 18px;
          }
        }
      `}</style>
    </div>
  );
}

function StatsSlide({ slide }: { slide: Extract<RecapSlide, { type: "stats" }> }) {
  const valueStr = String(slide.value);

  return (
    <div className="rpStats">
      <div className="rpStatsBg" />
      <div className="rpStatsContent">
        {slide.title ? (
          <motion.div
            className="rpStatsKicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {slide.title}
          </motion.div>
        ) : null}

        <motion.div
          className="rpStatsValue"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {valueStr}
        </motion.div>

        <motion.div
          className="rpStatsLabel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.86, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {slide.label}
        </motion.div>

        {slide.hint ? (
          <motion.div
            className="rpStatsHint"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {slide.hint}
          </motion.div>
        ) : null}
      </div>

      <style jsx>{`
        .rpStats {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .rpStatsBg {
          position: absolute;
          inset: 0;
          background: radial-gradient(800px 520px at 20% 20%, rgba(255, 255, 255, 0.08), transparent 58%),
            radial-gradient(900px 560px at 80% 40%, rgba(255, 255, 255, 0.06), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
        }
        .rpStatsContent {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
          padding: 28px;
        }
        .rpStatsKicker {
          font-size: 13px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.85;
          margin-bottom: 12px;
        }
        .rpStatsValue {
          font-size: clamp(70px, 10vw, 130px);
          font-weight: 850;
          letter-spacing: -0.04em;
          line-height: 0.95;
          text-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
        }
        .rpStatsLabel {
          margin-top: 10px;
          font-size: 16px;
          letter-spacing: 0.15px;
        }
        .rpStatsHint {
          margin-top: 10px;
          font-size: 12px;
          max-width: 60ch;
        }
      `}</style>
    </div>
  );
}

function FinalSlide({ slide, onNext }: { slide: Extract<RecapSlide, { type: "final" }>; onNext: () => void }) {
  return (
    <div className="rpFinal">
      {slide.image ? (
        <div className="rpFinalMedia" aria-hidden="true">
          <motion.div
            className="rpFinalImg"
            initial={{ scale: 1.06, opacity: 0.75 }}
            animate={{ scale: 1.14, opacity: 0.9 }}
            transition={{ duration: 7.8, ease: "easeOut" }}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="rpFinalVignette" />
        </div>
      ) : (
        <div className="rpFinalPlain" />
      )}

      <div className="rpFinalContent">
        <motion.div
          className="rpFinalBox"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rpFinalMsg">{slide.message}</div>
          <button className="rpFinalCta" onClick={onNext}>
            {slide.ctaLabel ?? "Revoir"} ↻
          </button>
        </motion.div>
      </div>

      <style jsx>{`
        .rpFinal {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .rpFinalPlain {
          position: absolute;
          inset: 0;
          background: radial-gradient(800px 520px at 30% 25%, rgba(255, 255, 255, 0.08), transparent 60%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
        }
        .rpFinalMedia {
          position: absolute;
          inset: 0;
        }
        .rpFinalImg {
          position: absolute;
          inset: -40px;
          background-size: cover;
          background-position: center;
          filter: saturate(1.04) contrast(1.02);
        }
        .rpFinalVignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 56% at 50% 38%, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.62)),
            linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.68));
        }

        .rpFinalContent {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          padding: 28px;
          text-align: center;
        }
        .rpFinalBox {
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(10px);
          padding: 18px 18px 16px 18px;
          box-shadow: 0 22px 55px rgba(0, 0, 0, 0.45);
          width: min(640px, 92vw);
        }
        .rpFinalMsg {
          font-size: 20px;
          line-height: 1.45;
          letter-spacing: 0.1px;
        }
        .rpFinalCta {
          margin-top: 16px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.92);
          border-radius: 999px;
          padding: 12px 16px;
          cursor: pointer;
          font-weight: 750;
          transition: transform 120ms ease, background 120ms ease;
        }
        .rpFinalCta:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.11);
        }
      `}</style>
    </div>
  );
}
