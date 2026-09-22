"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any;
    let rafId: number;

    const initLenis = async () => {
      const { default: Lenis } = await import("lenis");
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        infinite: false,
      });
      (window as any).lenis = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Exposed so other components (e.g. the draggable scroll-progress pill)
      // can drive scroll position through Lenis instead of fighting its own
      // smoothing loop with a raw window.scrollTo().
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    };

    initLenis();
    return () => {
      if (lenis) lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
      delete (window as unknown as { __lenis?: unknown }).__lenis;
    };
  }, []);

  return null;
}
