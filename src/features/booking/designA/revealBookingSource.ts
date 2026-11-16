import { animate, cubicBezier } from "framer-motion";
import type Lenis from "lenis";
import { duration, ease } from "@/lib/motion";
import { bookingSourceRevealScroll, readBookingSourceSafeTop } from "./sourceReveal";

// A second booking intent supersedes an unfinished reveal on any other card.
let cancelPendingReveal: (() => void) | null = null;

/** Finish a small source reveal before mounting the expanding booking surface. */
export function revealBookingSource(source: HTMLElement, reducedMotion: boolean, signal: AbortSignal): Promise<boolean> {
  cancelPendingReveal?.();
  if (signal.aborted || !source.isConnected) return Promise.resolve(false);
  // The mobile sheet is bottom-anchored; moving its source would be unexpected.
  if (window.matchMedia("(max-width: 639px)").matches) return Promise.resolve(true);

  const root = document.documentElement;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const gutter = parseFloat(getComputedStyle(source).getPropertyValue("--booking-dock-gutter")) || 0;
  const bounds = source.getBoundingClientRect();
  const target = bookingSourceRevealScroll(bounds, viewportHeight, window.scrollY,
    root.scrollHeight - root.clientHeight, readBookingSourceSafeTop(bounds.height, viewportHeight, gutter), gutter);
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis?.isStopped || lenis?.isLocked) return Promise.resolve(false);
  const initialUrl = window.location.href;

  return new Promise(resolve => {
    let finished = false;
    let scrolling = false;
    let frame = 0;
    let timeout = 0;
    let nativeMotion: ReturnType<typeof animate<number>> | undefined;

    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      signal.removeEventListener("abort", cancel);
      window.removeEventListener("pointerdown", cancel, true);
      window.removeEventListener("wheel", cancel, true);
      window.removeEventListener("touchstart", cancel, true);
      window.removeEventListener("keydown", cancel, true);
      window.removeEventListener("resize", cancel);
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("pagehide", cancel);
      document.removeEventListener("visibilitychange", cancel);
      if (cancelPendingReveal === cancel) cancelPendingReveal = null;
      resolve(ready && !signal.aborted && source.isConnected && initialUrl === window.location.href);
    };
    const cancel = () => {
      if (finished) return;
      finish(false);
      nativeMotion?.stop();
      // Stop only our in-flight reveal, leaving the user's new interaction free.
      if (scrolling && lenis && !lenis.isStopped) {
        // scrollTo(current) can return early before resetting an animation.
        // This project's Lenis uses explicit stop/start (autoToggle is off).
        lenis.stop();
        lenis.start();
      }
    };
    const ready = () => {
      scrolling = false;
      // Flush native scroll/Lenis listeners before the modal captures its source.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => finish(true));
      });
    };

    cancelPendingReveal = cancel;
    signal.addEventListener("abort", cancel, { once: true });
    window.addEventListener("pointerdown", cancel, true);
    window.addEventListener("wheel", cancel, { capture: true, passive: true });
    window.addEventListener("touchstart", cancel, { capture: true, passive: true });
    // Capture avoids consuming the same Enter key event that triggered the CTA.
    window.addEventListener("keydown", cancel, true);
    window.addEventListener("resize", cancel);
    window.addEventListener("popstate", cancel);
    window.addEventListener("pagehide", cancel);
    document.addEventListener("visibilitychange", cancel);
    timeout = window.setTimeout(cancel, (duration.slow + duration.slowest) * 1000);

    const immediate = reducedMotion || Math.abs(target - window.scrollY) <= 1;
    scrolling = true;
    if (lenis) {
      // Reset any existing wheel momentum even when the source already fits.
      lenis.stop();
      lenis.start();
      lenis.scrollTo(target, {
        immediate, duration: duration.slow, easing: cubicBezier(...ease.standard), onComplete: ready,
      });
    } else if (immediate) {
      window.scrollTo({ top: target, behavior: "instant" });
      ready();
    } else {
      nativeMotion = animate(window.scrollY, target, {
        duration: duration.slow, ease: ease.standard,
        onUpdate: top => window.scrollTo({ top, behavior: "instant" }), onComplete: ready,
      });
    }
  });
}
