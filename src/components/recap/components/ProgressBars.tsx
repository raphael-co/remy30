"use client";

import React from "react";

export function ProgressBars({
  total,
  index,
  progress,
}: {
  total: number;
  index: number;
  progress: number;
}) {
  return (
    <div className="bars" aria-label="Progression">
      {Array.from({ length: total }).map((_, i) => {
        const p = i < index ? 1 : i > index ? 0 : progress;
        return (
          <div key={i} className="bar">
            <div className="fill" style={{ transform: `scaleX(${p})` }} />
          </div>
        );
      })}
      <style jsx>{`
        .bars {
          display: grid;
          grid-template-columns: repeat(${total}, minmax(0, 1fr));
          gap: 8px;
        }
        .bar {
          height: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }
        .fill {
          height: 100%;
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          transform-origin: left center;
          transition: transform 80ms linear;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
