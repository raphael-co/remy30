"use client";

import { useEffect } from "react";

export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [locked]);
}
