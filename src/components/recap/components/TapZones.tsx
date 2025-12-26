"use client";

import React from "react";

export function TapZones({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="zones" aria-hidden="true">
      <button className="z left" onClick={onPrev} tabIndex={-1} />
      <button className="z right" onClick={onNext} tabIndex={-1} />
      <style jsx>{`
        .zones {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .z {
          background: transparent;
          border: 0;
          cursor: pointer;
        }
        .left,
        .right {
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
