"use client";

import React from "react";

export function GalleryStrip({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const show = images;
  return (
    <div className="strip">
      {show.map((u, i) => (
        <button
          key={`${u}-${i}`}
          className="thumb"
          onClick={() => onOpen(i)}
          aria-label={`Ouvrir photo ${i + 1}`}
        >
          <img src={u} alt="" loading="lazy" />
        </button>
      ))}
      <style jsx>{`
        .strip {
          display: flex;
          gap: 12px;
          overflow: auto;
          padding: 2px 2px 8px;
          -webkit-overflow-scrolling: touch;
        }
        .thumb {
          flex: 0 0 auto;
          width: 110px;
          height: 76px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          padding: 0;
          cursor: pointer;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.02);
          transition: transform 220ms ease;
        }
        .thumb:hover img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
}
