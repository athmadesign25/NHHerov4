"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: Lenis | undefined;
    let rafId = 0;
    let disposed = false;
    const scrollWindow = window as unknown as { lenis?: Lenis; __lenis?: Lenis };

    const initLenis = async () => {
      const { default: Lenis } = await import("lenis");
      // Strict Mode can clean up this effect before the import resolves. Never
      // leave a second scroll controller and RAF loop running after remount.
      if (disposed) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        infinite: false,
      });
      scrollWindow.lenis = lenis;

      function raf(time: number) {
        if (disposed) return;
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Exposed so other components (e.g. the draggable scroll-progress pill)
      // can drive scroll position through Lenis instead of fighting its own
      // smoothing loop with a raw window.scrollTo().
      scrollWindow.__lenis = lenis;
    };

    initLenis();
    return () => {
      disposed = true;
      lenis?.destroy();
      cancelAnimationFrame(rafId);
      if (scrollWindow.lenis === lenis) delete scrollWindow.lenis;
      if (scrollWindow.__lenis === lenis) delete scrollWindow.__lenis;
    };
  }, []);

  return null;
}
