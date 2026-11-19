"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

/** Keep keyboard reading clear of the profile's floating booking controls. */
export default function useProfileFocusClearance() {
  const profile = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = profile.current;
    const dock = page?.querySelector<HTMLElement>("[data-profile-booking]");
    if (!page || !dock) return;
    const root = document.documentElement;
    const originalPadding = root.style.scrollPaddingBottom;
    let frame = 0;
    const gap = () => parseFloat(getComputedStyle(page).getPropertyValue("--space-16")) || 16;

    const reserveSpace = () => {
      const clearance = Math.max(0, window.innerHeight - dock.getBoundingClientRect().top) + gap();
      root.style.scrollPaddingBottom = `${clearance}px`;
      page.style.setProperty("--profile-focus-clearance", `${clearance}px`);
    };

    const reveal = (target: HTMLElement) => {
      if (!target.isConnected || !page.contains(target) || dock.contains(target)
        || target.closest("dialog, [role='dialog'], [popover], [data-profile-preview]")) return;
      const bounds = target.getBoundingClientRect();
      const dockBounds = dock.getBoundingClientRect();
      const navbar = document.querySelector<HTMLElement>("[data-site-nav]");
      const picker = page.querySelector<HTMLElement>("[data-profile-section-picker]");
      const navHeight = navbar?.offsetHeight ?? 0;
      const pickerBounds = picker?.getBoundingClientRect();
      const pickerIsSticky = !!pickerBounds && pickerBounds.top <= navHeight + 1;
      // Scrolling upwards reveals the global navbar again. Allow its full height.
      const top = navHeight + (pickerIsSticky ? picker?.offsetHeight ?? 0 : 0) + gap();
      const bottom = dockBounds.top - gap();
      const overlapsDock = bounds.right > dockBounds.left && bounds.left < dockBounds.right;
      const delta = bounds.top < top ? bounds.top - top
        : overlapsDock && bounds.bottom > bottom ? bounds.bottom - bottom : 0;
      if (Math.abs(delta) < 1) return;
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(window.scrollY + delta, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
      }
    };

    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
      cancelAnimationFrame(frame);
      // Let the browser finish its native focus scrolling before correcting it.
      frame = requestAnimationFrame(() => reveal(target));
    };
    const observer = new ResizeObserver(reserveSpace);
    observer.observe(dock);
    window.addEventListener("resize", reserveSpace);
    page.addEventListener("focusin", onFocus);
    reserveSpace();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", reserveSpace);
      page.removeEventListener("focusin", onFocus);
      root.style.scrollPaddingBottom = originalPadding;
      page.style.removeProperty("--profile-focus-clearance");
    };
  }, []);

  return profile;
}
