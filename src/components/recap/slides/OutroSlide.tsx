"use client";

import React from "react";
import type { SlideProps } from "./SlideRenderer";

export function OutroSlide({ onReplay, onClose }: SlideProps) {
  return (
    <div className="center">
      <div className="kicker">Fin</div>
      <div className="title">Recap terminé</div>
      <div className="subtitle">Tu peux le relancer quand tu veux.</div>

      <div className="cta">
        <button className="action" onClick={onReplay}>
          Rejouer
        </button>
        <button className="action ghost" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

export default OutroSlide;