"use client";

import React from "react";
import { useLockBodyScroll } from "./hooks/useLockBodyScroll";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useRecapData } from "./hooks/useRecapData";
import { useRecapSlides } from "./hooks/useRecapSlides";
import { useRecapControls } from "./hooks/useRecapControls";
import RecapModal from "./RecapModal";

export function RecapPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useLockBodyScroll(open);

  const reduced = usePrefersReducedMotion();
  const { loading, product, reviews, err } = useRecapData(open);
  const { slides, total, gallery, latestReviews, stats, bgForSlide } = useRecapSlides(product, reviews);

  const controls = useRecapControls({
    open,
    total,
    reduced,
    loading,
    lbOpen: false, // RecapModal remontera l'état lightbox et te le passera ici si tu veux bloquer l'autoplay
    onClose,
  });

  if (!open) return null;

  return (
    <RecapModal
      open={open}
      onClose={onClose}
      reduced={reduced}
      loading={loading}
      err={err}
      product={product}
      reviews={reviews}
      slides={slides}
      total={total}
      gallery={gallery}
      latestReviews={latestReviews}
      avg={stats.avg}
      bg={bgForSlide(slides[controls.idx]?.type)}
      controls={controls}
    />
  );
}
