"use client";

import React from "react";
import type { SlideProps } from "./SlideRenderer";
import { GalleryStrip } from "../components/GalleryStrip";

export function GallerySlide({ gallery, onOpenLightbox }: SlideProps) {
  return (
    <div className="stack">
      <div className="kicker">Galerie</div>
      <div className="title">Les moments en images</div>
      <div className="subtitle">Clique une miniature pour ouvrir la lightbox.</div>

      {gallery.length ? (
        <GalleryStrip images={gallery} onOpen={onOpenLightbox} />
      ) : (
        <div className="small">Aucune image dans la galerie.</div>
      )}
    </div>
  );
}

export default GallerySlide;
