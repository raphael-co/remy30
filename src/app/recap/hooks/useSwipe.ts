"use client";

import { useRef } from "react";

export function useSwipe(onLeft: () => void, onRight: () => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;

    startX.current = null;
    startY.current = null;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 40) return;

    if (dx < 0) onLeft();
    else onRight();
  };

  return { onTouchStart, onTouchEnd };
}
