"use client";

import { useCallback, useEffect, useState } from "react";

/** Page scrolling returns inline booking to browsing without closing the card. */
export default function useInlineBookingSpotlight(active: boolean, suspended: boolean) {
  // Restoring an open card (Back, return links, refresh or deep links) is browsing,
  // not a new booking intent. Only the card's Book appointment action can arm dimming.
  const [requested, setRequested] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [previousActive, setPreviousActive] = useState(active);
  if (previousActive !== active) {
    setPreviousActive(active);
    if (!active) setRequested(false);
  }
  const start = useCallback(() => { setRequested(true); setScrolled(false); }, []);
  const dismiss = useCallback(() => setRequested(false), []);

  useEffect(() => {
    // History traversal and bfcache restoration never replay the spotlight.
    window.addEventListener("popstate", dismiss);
    window.addEventListener("pagehide", dismiss);
    window.addEventListener("pageshow", dismiss);
    return () => {
      window.removeEventListener("popstate", dismiss);
      window.removeEventListener("pagehide", dismiss);
      window.removeEventListener("pageshow", dismiss);
    };
  }, [dismiss]);

  useEffect(() => {
    if (!active || !requested || suspended) return;
    let frame = 0;
    let armed = false;
    let startY = window.scrollY;
    // Allow the opening interaction to settle before observing document scroll.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        startY = window.scrollY;
        armed = true;
      });
    });
    const onPageScroll = () => {
      if (armed && Math.abs(window.scrollY - startY) >= 8) setScrolled(true);
    };
    // No capture: nested hospital menus and horizontal date/time rails do not
    // dismiss the spotlight. Only an actual vertical document scroll does.
    window.addEventListener("scroll", onPageScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onPageScroll);
    };
  }, [active, requested, suspended, dismiss]);

  return { active: active && requested && !scrolled, highlight: active && requested, start, dismiss };
}
