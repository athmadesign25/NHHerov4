"use client";

import React, { useEffect, useRef, useState } from "react";
import PinnedStickyShell from "./PinnedStickyShell";
import StickyBreadcrumbBar, {
  BreadcrumbSiblingPage,
  HEALTH_LIBRARY_SIBLING_PAGES,
} from "./StickyBreadcrumbBar";

interface DetailStickyBreadcrumbProps {
  currentTitle: string;
  parentLabel?: string;
  siblingPages?: BreadcrumbSiblingPage[];
  motionKey?: string;
}

/**
 * Scroll-following sticky breadcrumb bar for detail pages.
 * Docks cleanly below <Navbar /> once the hero scrolls past, keeping navigation accessible
 * without adding duplicate sticky scroll boilerplate per detail route.
 */
export default function DetailStickyBreadcrumb({
  currentTitle,
  parentLabel = "Health Library",
  siblingPages = HEALTH_LIBRARY_SIBLING_PAGES,
  motionKey = "detail-sticky-breadcrumb",
}: DetailStickyBreadcrumbProps) {
  const [isPinned, setIsPinned] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPinnedState = () => {
      const sentinel = topSentinelRef.current;
      if (!sentinel) return;
      const topY = sentinel.getBoundingClientRect().top;
      const nearFooter =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 420;
      setIsPinned(topY <= 92 && !nearFooter);
    };

    syncPinnedState();
    window.addEventListener("scroll", syncPinnedState, { passive: true });
    window.addEventListener("resize", syncPinnedState, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncPinnedState);
      window.removeEventListener("resize", syncPinnedState);
    };
  }, []);

  return (
    <>
      <div
        ref={topSentinelRef}
        style={{ height: 1, width: "100%", pointerEvents: "none" }}
        aria-hidden="true"
      />
      <PinnedStickyShell isPinned={isPinned} motionKey={motionKey} gradientBlur={false}>
        <StickyBreadcrumbBar
          currentTitle={currentTitle}
          parentLabel={parentLabel}
          siblingPages={siblingPages}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </PinnedStickyShell>
    </>
  );
}
