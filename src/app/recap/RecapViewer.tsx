"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRecapData } from "./hooks/useRecapData";
import { useLockScroll } from "./hooks/useLockScroll";
import { useSwipe } from "./hooks/useSwipe";
import { uniqStrings, clamp } from "./utils";
import type { Slide } from "./types";

import { SlideShell } from "./components/SlideShell";
import { ProgressBars } from "./components/ProgressBars";
import { TapZones } from "./components/TapZones";
import { Icon } from "./components/Icon";
import SlideRenderer from "./components/slides/SlideRenderer";
import { recapCss } from "./components/recap.styles";

const SLIDE_MS = 6500;

export default function RecapViewer() {
  const router = useRouter();
  const { loading, product, reviews } = useRecapData();

  useLockScroll(true);

  const gallery = React.useMemo(() => {
    const g = product?.gallery || [];
    const r = reviews.map((x) => x.imageUrl || "").filter(Boolean) as string[];
    return uniqStrings([...g, ...r]);
  }, [product, reviews]);

  const latestReviews = React.useMemo(() => {
    return [...reviews].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [reviews]);

  const avg = React.useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, x) => acc + (x.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const slides: Slide[] = React.useMemo(
    () => [
      { type: "intro" },
      // { type: "product" },
      { type: "stats" },
      { type: "gallery" },
      { type: "reviews" },
      { type: "outro" },
    ],
    []
  );

  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const go = React.useCallback(
    (dir: -1 | 1) => {
      setIndex((v) => clamp(v + dir, 0, slides.length - 1));
      setProgress(0);
    },
    [slides.length]
  );

  const onReplay = React.useCallback(() => {
    setIndex(0);
    setProgress(0);
    setPlaying(true);
  }, []);

  const onClose = React.useCallback(() => {
    router.back();
  }, [router]);

  // ✅ Keyboard navigation (desktop)
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (target?.isContentEditable ?? false);
      if (isTyping) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setPlaying((p) => !p);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [go, onClose]);

  const swipe = useSwipe(
    () => go(1),
    () => go(-1)
  );

  React.useEffect(() => {
    if (!playing) return;
    if (loading) return;

    let raf = 0;
    let start = performance.now();

    const tick = (t: number) => {
      const dt = t - start;
      const p = clamp(dt / SLIDE_MS, 0, 1);
      setProgress(p);

      if (p >= 1) {
        start = performance.now();
        setProgress(0);
        setIndex((v) => {
          const next = v + 1;
          return next >= slides.length ? v : next;
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, loading, slides.length]);

  const slide = slides[index];
  const bgUrl = product?.heroImageUrl || gallery[0] || null;

  return (
    <div
      className="wrap"
      tabIndex={0}
      onClick={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest("button,a,input,textarea,select,[role='button']")) return;

        const x = (e as any).clientX as number | undefined;
        if (typeof x === "number") {
          const w = window.innerWidth || 1;
          if (x > w / 2) go(1);
          else go(-1);
        }
      }}
      onTouchStart={(e) => {
        swipe.onTouchStart(e);
        setPlaying(false);
      }}
      onTouchEnd={(e) => {
        swipe.onTouchEnd(e);
        setPlaying(true);
      }}
    >
      <div className="top">
        <button className="close" onClick={onClose} aria-label="Fermer">
          <Icon name="close" />
        </button>

        <div className="bars">
          <ProgressBars total={slides.length} index={index} progress={progress} />
        </div>

        <button
          className="play"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
        >
          <Icon name={playing ? "pause" : "play"} />
        </button>
      </div>

      <div className="stage">
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : (
          <SlideShell bgUrl={bgUrl}>
            <SlideRenderer
              slide={slide}
              product={product}
              reviews={reviews}
              latestReviews={latestReviews}
              avg={avg}
              gallery={gallery}
              onReplay={onReplay}
              onClose={onClose}
            />
          </SlideShell>
        )}

        <TapZones onPrev={() => go(-1)} onNext={() => go(1)} />
      </div>

      <style jsx>{recapCss}</style>

      <style jsx>{`
        .wrap {
          height: 100svh;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: #05060a;
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          outline: none;
        }
        .top {
          position: absolute;
          z-index: 50;
          top: 0;
          left: 0;
          right: 0;
          padding: 12px 12px 10px;
          display: grid;
          grid-template-columns: 46px 1fr 46px;
          gap: 10px;
          align-items: center;
        }
        .close,
        .play {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.28);
          color: #fff;
          display: grid;
          place-items: center;
        }
        .bars {
          padding: 0 2px;
        }
        .stage {
          position: absolute;
          inset: 0;
        }
        .loading {
          height: 100%;
          display: grid;
          place-items: center;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
