"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  images: string[];
  initialIndex?: number;
  triggerClassName?: string;
  imgClassName?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function normalizeImages(images: string[]) {
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const src of images) {
    const s = String(src ?? "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    uniq.push(s);
  }
  return uniq;
}

export default function GalleryModal({
  images,
  initialIndex = 0,
  triggerClassName = "",
  imgClassName = "",
}: Props) {
  const safeImages = useMemo(() => normalizeImages(Array.isArray(images) ? images : []), [images]);

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(() => clamp(initialIndex, 0, Math.max(0, safeImages.length - 1)));

  const lastActiveElRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Keep idx valid when images change
  useEffect(() => {
    setIdx((v) => clamp(v, 0, Math.max(0, safeImages.length - 1)));
  }, [safeImages.length]);

  // If initialIndex changes while closed, apply it
  useEffect(() => {
    if (open) return;
    setIdx(clamp(initialIndex, 0, Math.max(0, safeImages.length - 1)));
  }, [initialIndex, open, safeImages.length]);

  const close = useCallback(() => setOpen(false), []);
  const openAt = useCallback((i: number) => {
    lastActiveElRef.current = document.activeElement as HTMLElement | null;
    setIdx(clamp(i, 0, Math.max(0, safeImages.length - 1)));
    setOpen(true);
  }, [safeImages.length]);

  const hasMany = safeImages.length > 1;

  const prev = useCallback(() => {
    if (!hasMany) return;
    setIdx((v) => (v - 1 + safeImages.length) % safeImages.length);
  }, [hasMany, safeImages.length]);

  const next = useCallback(() => {
    if (!hasMany) return;
    setIdx((v) => (v + 1) % safeImages.length);
  }, [hasMany, safeImages.length]);

  // Scroll lock (robust)
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // Avoid layout shift due to scrollbar disappearance
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Keyboard + focus trap
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        return;
      }
      if (e.key === "Tab") {
        // Focus trap
        const root = dialogRef.current;
        if (!root) return;

        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);

    // Initial focus
    const t = window.setTimeout(() => {
      const root = dialogRef.current;
      const closeBtn = root?.querySelector<HTMLElement>('[data-close="1"]');
      (closeBtn ?? root)?.focus?.();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  // Restore focus on close
  useEffect(() => {
    if (open) return;
    const el = lastActiveElRef.current;
    if (el && typeof el.focus === "function") el.focus();
  }, [open]);

  // Touch swipe
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasMany) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMany) return;
    const start = touchRef.current;
    touchRef.current = null;

    const touch = e.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.t;

    // horizontal swipe: enough distance + mostly horizontal + quick-ish
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 700) {
      if (dx > 0) prev();
      else next();
    }
  };

  if (safeImages.length === 0) return null;

  const current = safeImages[idx];

  return (
    <>
      {/* Trigger grid (thumbnails) */}
      <div className={triggerClassName}>
        {safeImages.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="gmThumb"
            onClick={() => openAt(i)}
            aria-label={`Ouvrir l'image ${i + 1}`}
          >
            <span className="gmThumbMedia">
              <Image
                src={src}
                alt={`Image ${i + 1}`}
                fill
                className={imgClassName || "object-cover"}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="gmOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="gmCard"
            ref={dialogRef}
            tabIndex={-1}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="gmTop">
              <div className="gmCounter">
                {idx + 1} / {safeImages.length}
              </div>

              <div className="gmActions">
                <button
                  type="button"
                  className="gmIconBtn"
                  onClick={prev}
                  disabled={!hasMany}
                  aria-label="Précédent"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="gmIconBtn"
                  onClick={next}
                  disabled={!hasMany}
                  aria-label="Suivant"
                >
                  →
                </button>
                <button
                  type="button"
                  className="gmIconBtn"
                  onClick={close}
                  aria-label="Fermer"
                  data-close="1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="gmMedia">
              <Image
                src={current}
                alt={`Image ${idx + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>

            <div className="gmBottom">
              <div className="gmHint">ESC pour fermer • ← → pour naviguer • swipe sur mobile</div>

              <div className="gmStrip" aria-label="Miniatures">
                {safeImages.map((src, i) => (
                  <button
                    key={`${src}-mini-${i}`}
                    type="button"
                    className={`gmMini ${i === idx ? "active" : ""}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Aller à l'image ${i + 1}`}
                  >
                    <span className="gmMiniMedia">
                      <Image src={src} alt={`Mini ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
