"use client";

import { useSyncExternalStore } from "react";

/**
 * Below this width the banner has one layout, not two.
 *
 * Matches the 768px breakpoint the rest of the project uses. It has to be
 * known in JS as well as CSS because orientation decides which IMAGE is
 * requested, and a stylesheet cannot swap a src — the horizontal asset is
 * a letterbox and would be mostly cropped away on a phone.
 */
const QUERY = "(max-width: 768px)";

const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};

/**
 * False on the server and on the first client render, then corrected.
 * Reading matchMedia during render would make the markup depend on a
 * viewport the server cannot know, which is a hydration mismatch.
 */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
