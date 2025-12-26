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
  const activeFillRef = React.useRef<HTMLDivElement | null>(null);

  // cache la liste pour éviter Array.from() à chaque render
  const items = React.useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);

  // Update DOM direct pour la barre active (évite rerender massif en boucle)
  React.useLayoutEffect(() => {
    const el = activeFillRef.current;
    if (!el) return;

    const p = Math.max(0, Math.min(1, progress));
    el.style.transform = `scaleX(${p})`;
  }, [progress, index]);

  return (
    <div className="bars" aria-label="Progression">
      {items.map((i) => {
        const state = i < index ? "done" : i > index ? "todo" : "active";
        return (
          <div key={i} className="bar" data-state={state}>
            <div
              className="fill"
              ref={state === "active" ? activeFillRef : null}
              // valeur initiale (au mount / changement d’index)
              style={state === "active" ? { transform: `scaleX(${Math.max(0, Math.min(1, progress))})` } : undefined}
            />
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
          transform: scaleX(0);
          will-change: transform;
          /* pas besoin de transition si tu updates à haute fréquence */
          transition: none;
        }

        .bar[data-state="done"] .fill {
          transform: scaleX(1);
        }

        .bar[data-state="todo"] .fill {
          transform: scaleX(0);
        }
      `}</style>
    </div>
  );
}
