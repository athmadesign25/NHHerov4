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

import { motion } from "framer-motion";
import { useIsMobile } from "./useIsMobile";
import { ease } from "@/lib/motion";
import AnnouncementIcon from "./AnnouncementIcon";
import styles from "./CollapsedToast.module.css";
import { type HeadlinePart, COLLAPSED_LABEL, resolve } from "./types";

type Props = {
  parts: HeadlinePart[];
  onExpand: () => void;
};

export default function CollapsedToast({ parts, onExpand }: Props) {
  // The phone gets a different object, not a smaller one: a 126px chip
  // top-right under the nav, with the mark on a lit plate. At 274px the
  // desktop toast took a third of a phone's width.
  const isMobile = useIsMobile();
  // A banner whose artwork carries its own type has no headline to lend
  // the toast, so the toast falls back to the generic label rather than
  // collapsing to an icon with nothing beside it.
  const lines = parts.length
    ? parts
    : [{ id: "fallback", text: COLLAPSED_LABEL, colorId: "black" }];

  return (
    <motion.button
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
        <AnnouncementIcon size={isMobile ? 14 : 28} gradient={isMobile} />
      </span>
      <span className={styles.copy}>
        {lines.map((p) => (
          <span key={p.id} className={styles.line} style={{ color: resolve(p.colorId) }}>
            {p.text}
          </span>
        ))}
      </span>
    </motion.button>
  );
}
