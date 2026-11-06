"use client";

/**
 * The gradient scene behind the mobile banner.
 *
 * Three blurred fields that rise and grow from below the fold, then
 * settle — the stage being lit before the panel walks onto it. Mobile
 * only; the desktop banner has the page's own glow for this.
 *
 * Framer rather than a dedicated animation library. The project already
 * carries Framer and uses it everywhere else, and three divs moving on
 * two properties is not the kind of problem GSAP exists to solve — it
 * would be a second animation system and about 30KB for this.
 *
 * What actually matters for performance is that `filter: blur(80px)` is
 * expensive and is NEVER animated. It is declared once in CSS and left
 * alone; only transform and opacity move, so each field stays on its own
 * compositor layer and the blur is rasterised a single time.
 */

import { motion } from "framer-motion";
import styles from "./BannerScene.module.css";

/** The panel waits for this; the scene is the thing that arrives first. */
export const SCENE_LEAD = 0.42;

const rise = (delay: number) => ({
  initial: { opacity: 0, scale: 0.72, y: 90 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.86, y: 40, transition: { duration: 0.42 } },
  transition: {
    duration: 1.15,
    delay,
    // Settles rather than stops: it overshoots slightly and comes back,
    // which is what makes it read as arriving under its own weight.
    ease: [0.16, 1, 0.3, 1] as const,
  },
});

export default function BannerScene() {
  return (
    <motion.div
      className={styles.scene}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.3 }}
    >
      {/* Staggered so they do not arrive as one block. The blue leads
          because it is the largest and sets the key. */}
      <motion.span className={styles.fieldTop} {...rise(0)} />
      <motion.span className={styles.fieldLeft} {...rise(0.1)} />
      <motion.span className={styles.fieldRight} {...rise(0.18)} />
    </motion.div>
  );
}
