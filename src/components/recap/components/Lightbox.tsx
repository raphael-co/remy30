"use client";

import React from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { Icon } from "./Icon";

export function Lightbox({
  open,
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useLockBodyScroll(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  const src = images[index] || "";

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="Galerie">
      <div className="lbBd" onClick={onClose} />
      <div className="lbPanel">
        <button className="lbClose" onClick={onClose} aria-label="Fermer">
          <Icon name="close" />
        </button>
        {images.length > 1 ? (
          <>
            <button className="lbNav prev" onClick={onPrev} aria-label="Précédent">
              <Icon name="arrowLeft" />
            </button>
            <button className="lbNav next" onClick={onNext} aria-label="Suivant">
              <Icon name="arrowRight" />
            </button>
          </>
        ) : null}
        <img className="lbImg" src={src} alt={`Image ${index + 1}`} />
        <div className="lbMeta">
          <span className="lbCount">
            {index + 1}/{images.length}
          </span>
        </div>
      </div>

      <style jsx>{`
        .lb {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
        }
        .lbBd {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(14px);
        }
        .lbPanel {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.35);
          display: grid;
          place-items: center;
        }
        .lbImg {
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
        }
        .lbClose {
          position: absolute;
          top: calc(env(safe-area-inset-top, 0px) + 12px);
          right: calc(env(safe-area-inset-right, 0px) + 12px);
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.28);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .lbClose:hover {
          background: rgba(0, 0, 0, 0.42);
        }
        .lbNav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.28);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .lbNav:hover {
          background: rgba(0, 0, 0, 0.42);
        }
        .prev {
          left: calc(env(safe-area-inset-left, 0px) + 12px);
        }
        .next {
          right: calc(env(safe-area-inset-right, 0px) + 12px);
        }
        .lbMeta {
          position: absolute;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 900;
          letter-spacing: -0.02em;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
