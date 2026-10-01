"use client";

import React from "react";
import styles from "./BookingShell.module.css";

interface BookingShellProps {
  /** Left column content — doctor info + fee card */
  sidebar: React.ReactNode;
  /** Right/main column — the active booking panel */
  panel: React.ReactNode;
  /** Sticky bottom bar content (MWEB only) */
  stickyFooter?: React.ReactNode;
}

/**
 * Layout wrapper for the booking flow.
 * Desktop: 2-column grid (sidebar left, panel right).
 * Mobile: single column, sidebar collapses to a compact top card, panel fills width.
 * stickyFooter is pinned at the bottom on MWEB (the CTA bar).
 */
export default function BookingShell({ sidebar, panel, stickyFooter }: BookingShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.grid}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <main className={styles.panel}>{panel}</main>
      </div>

      {stickyFooter && (
        <div className={styles.stickyFooter} aria-label="Booking action">
          {stickyFooter}
        </div>
      )}
    </div>
  );
}
