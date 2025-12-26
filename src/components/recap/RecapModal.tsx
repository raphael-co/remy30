// app/recap/RecapModal.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Product, Review, Slide } from "./types";
import { Icon } from "./components/Icon";
import { ProgressBars } from "./components/ProgressBars";
import { SlideShell } from "./components/SlideShell";
import { TapZones } from "./components/TapZones";
import { Lightbox } from "./components/Lightbox";
import SlideRenderer from "./slides/SlideRenderer";
import { recapCss } from "./recap.styles";
import Portal from "../Portal";

type Controls = {
  idx: number;
  paused: boolean;
  progress: number;
  canPrev: boolean;
  canNext: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

export default function RecapModal(props: {
  open: boolean;
  onClose: () => void;
  reduced: boolean;
  loading: boolean;
  err: string | null;

  product: Product | null;
  reviews: Review[];

  slides: Slide[];
  total: number;
  gallery: string[];
  latestReviews: Review[];
  avg: number;

  bg: string | null | undefined;
  controls: Controls;
}) {
  const {
    open,
    onClose,
    reduced,
    loading,
    err,
    product,
    reviews,
    slides,
    total,
    gallery,
    latestReviews,
    avg,
    bg,
    controls,
  } = props;

  const [lbOpen, setLbOpen] = React.useState(false);
  const [lbIndex, setLbIndex] = React.useState(0);

  if (!open) return null;

  const slide = slides[controls.idx];

  const pageVariants = {
    initial: { opacity: 0, y: 18, scale: 0.985 },
    enter: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -18, scale: 0.985 },
  };

  return (
    <Portal>
      <>
        <div className="recap" role="dialog" aria-modal="true" aria-label="Recap plein écran">
          <div className="frame">
            {/* ===== HUD TOP ===== */}
            <div className="hudTop">
              <ProgressBars
                total={total}
                index={controls.idx}
                progress={reduced ? 0 : controls.progress}
              />

              <div className="hudRow">
                <div className="hudLeft">
                  <span className="badge">
                    <Icon name="sparkles" size={16} />
                    Recap
                  </span>
                  <span className="hint">← → naviguer • Espace pause • ESC fermer</span>
                </div>

                <div className="hudRight">
                  <button
                    className="hudBtn"
                    onClick={() => controls.setPaused((p) => !p)}
                    aria-label={controls.paused ? "Lecture" : "Pause"}
                  >
                    {controls.paused ? <Icon name="play" /> : <Icon name="pause" />}
                  </button>

                  <button className="hudBtn" onClick={onClose} aria-label="Fermer">
                    <Icon name="close" />
                  </button>
                </div>
              </div>
            </div>

            {/* ===== STAGE ===== */}
            <div className="stage">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${slide.type}-${controls.idx}`}
                  className="slide"
                  variants={pageVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
                >
                  <SlideShell bgUrl={bg}>
                    <TapZones
                      onPrev={() => controls.canPrev && controls.prev()}
                      onNext={() => controls.canNext && controls.next()}
                    />

                    <div className="content">
                      {loading ? (
                        <div className="center">
                          <div className="big">Chargement…</div>
                          <div className="small">/api/product • /api/reviews</div>
                        </div>
                      ) : err ? (
                        <div className="center">
                          <div className="big">Erreur</div>
                          <div className="small">{err}</div>
                        </div>
                      ) : (
                        <SlideRenderer
                          slide={slide}
                          product={product}
                          reviews={reviews}
                          latestReviews={latestReviews}
                          avg={avg}
                          gallery={gallery}
                          onOpenLightbox={(i) => {
                            setLbIndex(i);
                            setLbOpen(true);
                            controls.setPaused(true);
                          }}
                          onReplay={controls.reset}
                          onClose={onClose}
                        />
                      )}
                    </div>

                    {/* ===== HUD BOTTOM ===== */}
                    <div className="hudBottom">
                      <button
                        className="nav"
                        onClick={controls.prev}
                        disabled={!controls.canPrev}
                        aria-label="Précédent"
                      >
                        <Icon name="arrowLeft" />
                      </button>

                      <div className="counter">
                        {controls.idx + 1}/{total}
                      </div>

                      <button
                        className="nav"
                        onClick={controls.next}
                        disabled={!controls.canNext}
                        aria-label="Suivant"
                      >
                        <Icon name="arrowRight" />
                      </button>
                    </div>
                  </SlideShell>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <style jsx>{recapCss}</style>
        </div>

        {/* ===== LIGHTBOX ===== */}
        <Lightbox
          open={lbOpen}
          images={gallery}
          index={lbIndex}
          onClose={() => setLbOpen(false)}
          onPrev={() => setLbIndex((x) => (x - 1 + gallery.length) % gallery.length)}
          onNext={() => setLbIndex((x) => (x + 1) % gallery.length)}
        />
      </>
    </Portal>
  );
}
