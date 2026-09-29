"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import SeoLinksBand from "./SeoLinksBand";

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
 *
 * SeoLinksBand lives INSIDE this same measured/pinned div, alongside
 * Footer, as one rigid fixed unit — it was briefly split out as a
 * sibling after it, which seemed like the safer change but is actually
 * wrong: `main`'s margin-bottom is the *only* thing that gives the
 * reveal its distance, so it has to equal the full height of whatever
 * is fixed at the viewport's bottom edge, or the two fall out of sync.
 * With the band outside, margin-bottom matched Footer alone while the
 * fixed edge the reveal was aiming for was still Footer's own edge —
 * fine on its own — but the band, as a normal-flow sibling right after,
 * started its own box exactly where Footer's *flow* position would
 * have ended, not where its *fixed, on-screen* edge actually was. Those
 * two points are only the same when nothing else shares the fixed
 * unit, so the split introduced a standing gap between the previous
 * section and the footer, and a matching overlap where the band's
 * fixed-flow start undercut the still-fixed footer's own bottom edge —
 * both off by exactly the band's own height, every time.
 *
 * Kept together, `measure()` naturally covers both states this
 * component needs, with no extra wiring: collapsed, the combined
 * height is small and it pins as one block, curtain-style; once
 * SeoLinksBand is expanded, the very same ResizeObserver sees the
 * height cross the pin threshold and flips `pinned` off on its own —
 * the whole unit drops into normal document flow and scrolls like
 * anything else, which is also the fix for the other failure mode: a
 * fixed unit taller than the viewport would otherwise trap its own top
 * permanently out of reach.
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
      // The real constraint is only whether the unit fits on screen: pinned
      // to `bottom: 0`, anything taller than the viewport puts its own top
      // permanently out of reach. The previous `- 80` was breathing room on
      // top of that, and it quietly cost the effect entirely — Footer alone
      // is ~847px, so the buffer already demanded a ~927px viewport, and the
      // collapsed band's ~50px pushed the bar to ~977px. Ordinary laptop
      // windows sit between those two numbers, which is why the curtain kept
      // vanishing on real screens while measuring fine in a tall one.
      setPinned(height > 0 && height <= window.innerHeight);
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
        <SeoLinksBand />
      </div>
    </>
  );
}
