"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";

/**
 * Curtain-reveal footer, as on sites like icomat.co.uk: the footer is
 * `position: fixed` at the bottom of the viewport and never moves at all,
 * while `main` sits above it (z-index) and slides up and off it. Nothing
 * about the footer animates — it's simply uncovered, which is what makes
 * it read as a layer that was always sitting there underneath the page.
 *
 * Two things make that work, and both are load-bearing:
 *
 * 1. `main` must be OPAQUE. A fixed footer is in the viewport at every
 *    scroll position, so anywhere `main` is see-through the footer shows
 *    through with it — which is exactly what the previous
 *    `position: sticky; bottom: 0` version did, visibly, behind every
 *    section on the page (sticky anchored to `bottom` pins an element to
 *    the viewport's bottom edge for the whole of its containing block,
 *    and here that containing block is <body> — i.e. the entire
 *    document, from scroll position zero). Most sections here are
 *    transparent and just let the page's base color show through, so
 *    painting that same color on `main` is visually a no-op and is what
 *    actually makes the curtain opaque.
 *
 * 2. `main` needs a POSITIVE bottom margin of exactly the footer's
 *    height. That margin is the reveal itself: it's the only scroll
 *    distance left once `main`'s own content has ended, and over it
 *    `main`'s trailing edge travels from the viewport's bottom edge up
 *    to the footer's top edge, uncovering the footer 1:1 and landing
 *    flush with it exactly at the document's end. A negative margin (the
 *    previous approach) does the opposite — it removes scroll length,
 *    which is why that version had to sway/settle the footer at the end
 *    to cover for the fact that it never had room to fully arrive.
 *
 * Skipped entirely when the footer is taller than the viewport (mobile,
 * mainly): pinning something taller than the screen to `bottom: 0` puts
 * its own top permanently out of reach, so there it just stays in normal
 * document flow and scrolls in the ordinary way.
 */
export default function FooterRevealWrapper({ children }: { children: React.ReactNode }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const measure = () => {
      const height = Math.ceil(footerEl.getBoundingClientRect().height);
      setFooterHeight(height);
      setPinned(height > 0 && height <= window.innerHeight - 80);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(footerEl);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <main
        id="main-content"
        style={{
          position: "relative",
          zIndex: 1,
          background: pinned ? "var(--color-bg)" : undefined,
          marginBottom: pinned ? `${footerHeight}px` : undefined,
        }}
      >
        {children}
      </main>
      <div
        ref={footerRef}
        style={
          pinned
            ? { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 0 }
            : undefined
        }
      >
        <Footer />
      </div>
    </>
  );
}
