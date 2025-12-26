"use client";

import * as React from "react";
import { clamp } from "../lib/utils";

export function useRecapControls(opts: {
  open: boolean;
  total: number;
  reduced: boolean;
  loading: boolean;
  lbOpen: boolean;
  onClose: () => void;
}) {
  const { open, total, reduced, loading, lbOpen, onClose } = opts;

  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const reset = React.useCallback(() => {
    setIdx(0);
    setProgress(0);
    setPaused(false);
  }, []);

  const next = React.useCallback(() => {
    setIdx((x) => clamp(x + 1, 0, total - 1));
    setProgress(0);
  }, [total]);

  const prev = React.useCallback(() => {
    setIdx((x) => clamp(x - 1, 0, total - 1));
    setProgress(0);
  }, [total]);

  // autoplay
  React.useEffect(() => {
    if (!open) return;
    if (paused) return;
    if (reduced) return;
    if (loading) return;
    if (lbOpen) return;

    const durationMs = 5600;
    let raf = 0;
    const start = performance.now();

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = clamp(elapsed / durationMs, 0, 1);
      setProgress(p);

      if (p >= 1) {
        if (idx < total - 1) {
          setIdx((x) => x + 1);
          setProgress(0);
        } else {
          setPaused(true);
          setProgress(1);
        }
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, paused, reduced, loading, lbOpen, idx, total]);

  // keyboard
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, next, prev]);

  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  return { idx, paused, progress, canPrev, canNext, setPaused, setIdx, reset, next, prev };
}
