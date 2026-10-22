"use client";

/**
 * The banner's collapsed form: a small persistent alert at the bottom
 * left. No scrim, no lock — it just sits there until dismissed.
 *
 * It does not simply appear. It grows out of the corner the panel shrank
 * toward, so the two read as one movement rather than a disappearance
 * followed by an arrival.
 *
 * The copy is the banner's own headline, one part per line and in each
 * part's own colour. The parts are where the writer already decided the
 * line breaks, so the toast inherits them rather than guessing at a
 * wrap — which is what keeps it inside its 274px without a hyphen in a
 * bad place.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { ease } from "@/lib/motion";
import AnnouncementIcon from "./AnnouncementIcon";
import styles from "./CollapsedToast.module.css";
import { type HeadlinePart, COLLAPSED_LABEL } from "./types";

type Props = {
  parts: HeadlinePart[];
  onExpand: () => void;
};

export default function CollapsedToast({ parts, onExpand }: Props) {
  // The phone gets a different object, not a smaller one: a 126px chip
  // top-right under the nav, with the mark on a lit plate. At 274px the
  // desktop toast took a third of a phone's width.
  const isMobile = useIsMobile();
  const ref = useRef<HTMLButtonElement>(null);

  /**
   * The chip rides under the navbar, including while the navbar is
   * leaving.
   *
   * It follows the navbar's measured bottom edge rather than repeating
   * its show/hide rule. That rule is specifically tuned — always visible
   * under 120px, a 12px dead zone for Lenis momentum — and a second copy
   * of it here would drift the first time anyone touched the original.
   *
   * The nav takes 600ms to slide, so a scroll handler alone would jump
   * the chip to the final position and let the nav catch up. The frame
   * loop runs for the length of that transition after the last scroll,
   * then stops; it is not a permanent rAF.
   */
  useEffect(() => {
    if (!isMobile) return;
    const nav = document.querySelector("nav");
    if (!nav) return;

    let raf = 0;
    let until = 0;
    const follow = () => {
      const el = ref.current;
      if (el) el.style.top = `${Math.max(8, nav.getBoundingClientRect().bottom + 12)}px`;
      raf = performance.now() < until ? requestAnimationFrame(follow) : 0;
    };
    const onScroll = () => {
      until = performance.now() + 800;
      if (!raf) raf = requestAnimationFrame(follow);
    };

    follow();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);
  // A banner whose artwork carries its own type has no headline to lend
  // the toast, so the toast falls back to the generic label rather than
  // collapsing to an icon with nothing beside it.
  const headline = parts.length ? parts.map((part) => part.text) : [COLLAPSED_LABEL];
  const firstLine = /^Coming\b/i.test(headline[1] ?? "")
    ? `${headline[0]} Coming`
    : headline[0];
  const secondLine = /^Coming\b/i.test(headline[1] ?? "")
    ? [headline[1].replace(/^Coming\s*/i, ""), ...headline.slice(2)].join(" ")
    : headline.slice(1).join(" ");
  const lines = [firstLine, secondLine].filter(Boolean);

  return (
    <motion.button
      ref={ref}
      type="button"
      className={styles.toast}
      onClick={onExpand}
      // Arrives from its own corner: up from the bottom-left on desktop,
      // down from under the nav on a phone.
      initial={{ opacity: 0, scale: 0.6, y: isMobile ? -18 : 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: isMobile ? -18 : 24 }}
      transition={{ duration: 0.5, ease: ease.spring }}
    >
      <span className={styles.iconWrap}>
        <AnnouncementIcon size={isMobile ? 20 : 28} gradient />
      </span>
      <span className={styles.copy}>
        {isMobile ? (
          /* Fixed copy on the phone. A campaign headline written for a
             548px panel does not survive a 200px chip, and clamping it
             mid-phrase reads worse than a line written for the space. */
          <span className={styles.line}>New NH Hospital in Banashankari!</span>
        ) : (
          lines.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
            </span>
          ))
        )}
      </span>
    </motion.button>
  );
}
