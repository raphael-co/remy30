// src/app/galerie/GalleryLightbox.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./galerie.module.css";

function getVariantClass(i: number) {
  // On garde tes variantes pour desktop (réactivées en CSS via media query)
  const variants = [
    styles.base,
    styles.slower,
    styles.faster,
    styles.vertical,
    styles.slowerDown,
    styles.faster1,
    styles.slower2,
    styles.slower1,
    styles.fastest,
    styles.last,
  ];
  return variants[i % variants.length];
}

export default function GalleryLightbox({
  images,
  initialSelected,
}: {
  images: string[];
  initialSelected?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialSelected) {
      setActive(initialSelected);
      setOpen(true);
    }
  }, [initialSelected]);

  const close = React.useCallback(() => {
    setOpen(false);
    window.setTimeout(() => setActive(null), 160);

    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const openWith = React.useCallback((src: string) => {
    setActive(src);
    setOpen(true);

    const url = new URL(window.location.href);
    url.searchParams.set("photo", encodeURIComponent(src));
    window.history.replaceState({}, "", url.toString());
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <div className={styles.horizontalScrollWrapper} aria-label="Galerie">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className={`${styles.imgWrapper} ${getVariantClass(i)}`}>
            <button
              type="button"
              className={styles.thumbBtn}
              onClick={() => openWith(src)}
              aria-label={`Agrandir image ${i + 1}`}
            >
              <motion.img
                layoutId={`img-${src}`}
                src={src}
                alt=""
                loading="lazy"
                className={styles.thumbImg}
              />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open && active ? (
          <motion.div
            className={styles.zOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // ✅ FIX MOBILE: pointerdown (tactile + souris)
            onPointerDown={(e) => {
              const t = e.target as HTMLElement;
              if (t.closest(`.${styles.zImage}`)) return;
              if (t.closest(`.${styles.zClose}`)) return;
              close();
            }}
          >
            <motion.button
              type="button"
              className={styles.zClose}
              onClick={close}
              aria-label="Fermer"
              title="Fermer (Esc)"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
            >
              ✕
            </motion.button>

            <motion.img
              layoutId={`img-${active}`}
              src={active}
              alt=""
              className={styles.zImage}
              draggable={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
