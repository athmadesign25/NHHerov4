"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PinnedStickyShell.module.css";

interface PinnedStickyShellProps {
  isPinned: boolean;
  motionKey?: string;
  gradientBlur?: boolean;
  children: ReactNode;
}

/**
 * Reusable fixed top sticky shell synced 1:1 with Navbar visibility (68px desktop, 56px mobile, 0px hidden).
 * Uses a crisp solid-frosted bar when only breadcrumbs are shown (gradientBlur=false),
 * and a soft short feathered blur edge when full search/filters are pinned (gradientBlur=true).
 */
export default function PinnedStickyShell({
  isPinned,
  motionKey = "pinned-sticky-shell",
  gradientBlur = true,
  children,
}: PinnedStickyShellProps) {
  return (
    <div className={styles.fixedStickyShell}>
      <AnimatePresence>
        {isPinned && (
          <motion.div
            key={motionKey}
            className={`${styles.fixedStickyPanel} ${
              gradientBlur ? styles.fixedStickyPanelBlurred : styles.fixedStickyPanelCrisp
            }`}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
