"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";

// Extra buffer (beyond the footer's own height) before the reveal can
// engage. AppDownloadBanner's phone artwork has its own long scroll-driven
// entrance animation that keeps easing into place for a while after the
// section's CSS sticky pin itself has released, and only truly stops
// moving a couple hundred px before the page's true scroll end — leaving
// very little room for the footer's own rise (which needs its full real
// height, ~550px, to slide up from off-screen) to fit after that without
// starting to overlap it. Keeping this small pushes the overlay's start as
// close to that settle point as this trick allows; it can't be reduced to
// full non-overlap without shortening AppDownloadBanner's own animation.
const REVEAL_WINDOW = 100;

/**
 * Makes the footer rise up from below and overlay on top of whatever's
 * statically pinned above it (AppDownloadBanner), instead of appearing
 * only after a plain, straight scroll-past.
 *
 * The naive version of this trick — position:sticky directly on a
 * body-level sibling of `main`, with a negative margin on `main` — is
 * broken: sticky's "stuck" range is bounded by its OWN containing block,
 * and since that sibling's containing block would be the whole `<body>`
 * (spanning the entire document), the browser is free to pin it at the
 * viewport's bottom from scroll position 0 — it just happens to be
 * invisible for most of the page because main's own (higher-stacked, at
 * the time) content painted over it. Flipping which layer sits on top
 * then makes that always-stuck footer paint over literally everything on
 * the page, immediately, which is exactly the bug this produced.
 *
 * The fix is to give the footer its OWN small, LOCAL containing block —
 * the wrapper below — sized to footerHeight + REVEAL_WINDOW, but pulled
 * up by its OWN FULL HEIGHT (not just REVEAL_WINDOW) via a negative
 * margin-top scoped to this wrapper alone. That makes it contribute ZERO
 * net extra document height — it fully retracts into space AppDownloadBanner
 * was already going to occupy — which matters because AppDownloadBanner's
 * own sticky pin only releases once its internal track's true bottom is
 * reached; if this wrapper added any net height AFTER that point (as
 * pulling up by only REVEAL_WINDOW did), AppDownloadBanner would release
 * and visibly start scrolling away WHILE the footer was still only partway
 * risen. Retracting fully means AppDownloadBanner's release point and the
 * page's true scroll end are the exact same pixel — it never gets the
 * chance to visibly move, and the reveal is guaranteed to finish exactly
 * as scrolling runs out, not stall partway or overshoot. Sticky positioning
 * is bounded by its own containing block, so it can only ever engage within
 * this small window near the true end of the page — on this page or any
 * other — never earlier.
 *
 * Also note the footer itself sticks via `top: calc(100vh - height)`, not
 * `bottom: 0` — bottom-anchored sticky only holds an element against
 * scrolling that would push it off the BOTTOM (i.e. scrolling up), which
 * is backwards for a footer approached by scrolling down; `top` is what
 * every other sticky pin in this codebase (HealthPackages,
 * AppDownloadBanner) already uses for exactly that reason.
 *
 * A scroll listener also writes how far the footer has risen within that
 * window (0 = just peeking, 1 = fully risen) to a CSS variable on the
 * root element, which AppDownloadBanner reads to dim its own content
 * slightly as the footer overlays it (see .stickyViewport's
 * `opacity: var(--footer-overlay-fade, 1)`).
 */
export default function FooterRevealWrapper({ children }: { children: React.ReactNode }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const measure = () => setFooterHeight(el.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const MIN_FADE = 0.55;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = footerEl.getBoundingClientRect();
      // rect.top travels from window.innerHeight (just peeking under the
      // fold) down to its stuck value (innerHeight - footerHeight) as it
      // rises into view — that span IS the footer's own height.
      const raw = (window.innerHeight - rect.top) / (rect.height || 1);
      const progress = Math.min(1, Math.max(0, raw));
      const fade = 1 - progress * (1 - MIN_FADE);
      document.documentElement.style.setProperty("--footer-overlay-fade", fade.toFixed(3));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.style.removeProperty("--footer-overlay-fade");
    };
  }, []);

  return (
    <>
      <main id="main-content" style={{ position: "relative" }}>
        {children}
      </main>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: footerHeight ? `${footerHeight + REVEAL_WINDOW}px` : undefined,
          marginTop: footerHeight ? `-${footerHeight + REVEAL_WINDOW}px` : 0,
        }}
      >
        <div
          ref={footerRef}
          style={{ position: "sticky", top: footerHeight ? `calc(100vh - ${footerHeight}px)` : 0 }}
        >
          <Footer />
        </div>
      </div>
    </>
  );
}
