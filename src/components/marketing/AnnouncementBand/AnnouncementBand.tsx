"use client";

/**
 * L2 marketing banner — a persistent band across the top of the page.
 *
 * Where the L1 drawer interrupts, this one annexes. It is always present,
 * has no trigger, and the only thing it asks of the reader is whether to
 * dismiss it. The navbar sits below it rather than behind it: the band
 * publishes its own height as `--band-height` on <html>, which is the one
 * value the navbar reads to move down.
 *
 * The blue background grows and slides into its resting gradient on entry.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/marketing/CloseIcon";
import { useIsMobile } from "@/components/marketing/MarketingDrawer/useIsMobile";
import { ease } from "@/lib/motion";
import styles from "./AnnouncementBand.module.css";

export type BandConfig = {
  message: string;
  link: { label: string; href: string };
};

export const DEFAULT_BAND: BandConfig = {
  message: "Walk-in blood donation drive at HSR Clinic, 2 Nov, 10am\u20134pm.",
  link: { label: "Talk to our team", href: "/appointment" },
};

/**
 * How far down the page the band survives. Past this it is gone, and
 * scrolling back up anywhere below the hero brings back the navbar alone.
 */
const SCROLL_OUT = 24;

export default function AnnouncementBand({ config = DEFAULT_BAND }: { config?: BandConfig }) {
  const [open, setOpen] = useState(true);
  const [gradientReady, setGradientReady] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const bandRef = useRef<HTMLElement>(null);
  // The phone gets a marquee instead of a static line: 330px cannot hold
  // a sentence at a readable size, and truncating an announcement is
  // worse than scrolling it.
  const isMobile = useIsMobile();

  // The band belongs to the hero, not to the page. Once you are reading a
  // section it has had its turn, and the navbar is the only thing that
  // should come back on the way up.
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= SCROLL_OUT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shown = open && atTop;

  // The navbar is fixed at `top: var(--band-height, 0px)`. Publishing the
  // height from here rather than hard-coding it there keeps every route
  // without a band at 0 with no second rule.
  //
  // Measured, not assumed: the band is 62px on desktop but grows when the
  // message wraps on a narrow screen, and a fixed 62px would have left the
  // navbar overlapping the second line.
  useEffect(() => {
    const root = document.documentElement;
    const el = bandRef.current;
    if (!shown || !el) {
      // Not removed — set to 0, so the navbar glides up with the band
      // instead of jumping the moment it unmounts.
      root.style.setProperty("--band-height", "0px");
      return;
    }
    const publish = () => root.style.setProperty("--band-height", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shown]);

  // Leave nothing behind for the next route.
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--band-height");
    };
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.aside
          ref={bandRef}
          className={styles.band}
          data-entered={gradientReady}
          onAnimationComplete={(target) => {
            if (typeof target === "object" && "y" in target && target.y === 0) {
              setGradientReady(true);
            }
          }}
          role="region"
          aria-label="Announcement"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.35, ease: ease.out } }}
          transition={{ duration: 0.6, ease: ease.out }}
        >
          {/* Pattern and inner shading sit under the copy and
              take no pointer events, so the band stays one flat row to
              click through. */}
          <span className={styles.pattern} aria-hidden />
          <span className={styles.innerEdge} aria-hidden />


          {isMobile ? (
            /* Two copies, scrolling as one strip. A single copy leaves a
               gap the width of the band every time it wraps; the second
               is what makes it continuous, which is why the track
               travels exactly -50% and no further. */
            <div className={styles.marquee}>
              <div className={styles.marqueeTrack}>
                <span className={styles.marqueeItem}>{config.message}</span>
                <span className={styles.marqueeItem} aria-hidden>
                  {config.message}
                </span>
              </div>
            </div>
          ) : (
            /* data-text duplicates the copy into a ::after that carries
               the hover wipe. The sweep is a gradient clipped to glyphs,
               and a gradient needs its own box to travel across — it
               cannot be applied to the live text without replacing its
               colour. */
            <p className={styles.message} data-text={config.message}>
              {config.message}
            </p>
          )}

          <div className={styles.actions}>
            {/* Accent red, not --red-emergency: that one is reserved for
                genuine emergency affordances, and spending it on a
                marketing link is how it stops meaning anything. */}
            <a className={styles.link} href={config.link.href}>
              {config.link.label}
            </a>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Dismiss announcement"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
