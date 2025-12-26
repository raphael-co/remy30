"use client";

import React from "react";

export function TapZones({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="zones" aria-hidden="true">
      <button className="z left" onClick={onPrev} tabIndex={-1} />
      <button className="z right" onClick={onNext} tabIndex={-1} />

      <style jsx>{`
        /* ✅ Desktop: invisible + ne capte aucun clic */
        .zones {
          display: none;
          pointer-events: none;
        }

        /*
          ✅ Mobile/Tablette uniquement
          - pointer: coarse = tactile
          - hover: none = pas de souris (évite la plupart des laptops tactiles)
          - max-width: 1024px = évite les grands écrans
        */
        @media (pointer: coarse) and (hover: none) and (max-width: 10px) {
          .zones {
            position: absolute;
            inset: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            z-index: 5;
            pointer-events: auto;
          }

          .z {
            background: transparent;
            border: 0;
            cursor: pointer;
            touch-action: manipulation;
          }
        }
      `}</style>
    </div>
  );
}
 