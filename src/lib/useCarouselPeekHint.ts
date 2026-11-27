"use client";

import { useEffect, type RefObject } from "react";

/**
 * Triggers a one-time subtle horizontal nudge on mobile viewports (`<= 768px`)
 * when a horizontal carousel enters view, signalling swipeability before settling
 * cleanly back at its default left-aligned resting position (`scrollLeft = 0`).
 */
export function useCarouselPeekHint(
  trackRef: RefObject<HTMLElement | null>,
  resetKey?: string | number
) {
  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof window === "undefined") return;

    // Ensure card 1 always starts cleanly aligned on the left on mount / key change
    el.scrollLeft = 0;

    if (window.innerWidth > 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let hasPlayed = false;
    let activeAnimations: Animation[] = [];
    let cancelled = false;

    const cancelHint = () => {
      cancelled = true;
      activeAnimations.forEach((anim) => {
        try {
          anim.cancel();
        } catch {
          // ignore if already finished
        }
      });
      activeAnimations = [];
    };

    el.addEventListener("touchstart", cancelHint, { passive: true, once: true });
    el.addEventListener("pointerdown", cancelHint, { passive: true, once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayed || cancelled) return;
        hasPlayed = true;
        observer.disconnect();

        // Only animate if the carousel actually overflows horizontally
        if (el.scrollWidth <= el.clientWidth + 8 || el.scrollLeft > 4) return;

        const targets = Array.from(el.children).slice(0, 3) as HTMLElement[];
        if (targets.length === 0) return;

        targets.forEach((child) => {
          if (typeof child.animate !== "function") return;
          const anim = child.animate(
            [
              { transform: "translate3d(0, 0, 0)" },
              { transform: "translate3d(-24px, 0, 0)", offset: 0.42 },
              { transform: "translate3d(0, 0, 0)" },
            ],
            {
              duration: 920,
              delay: 180,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "none",
            }
          );
          activeAnimations.push(anim);
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("touchstart", cancelHint);
      el.removeEventListener("pointerdown", cancelHint);
      cancelHint();
    };
  }, [trackRef, resetKey]);
}
