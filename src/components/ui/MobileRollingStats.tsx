"use client";

import React from "react";
import styles from "./MobileRollingStats.module.css";

export interface RollingStatItem {
  value?: number;
  suffix?: string;
  staticValue?: string;
  label: string;
}

interface MobileRollingStatsProps {
  items: RollingStatItem[];
  className?: string;
  intervalMs?: number;
}

/**
 * Responsive MWeb continuous auto-scrolling parameter ticker (matching SpecialityDesign2).
 * Renders duplicate seamless tracks on mobile (`<= 768px`) with vertical gradient dividers,
 * edge fade masks, and pause-on-touch/hover support.
 */
export default function MobileRollingStats({
  items,
  className = "",
}: MobileRollingStatsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={`${styles.container} ${className}`}
      role="region"
      aria-label="Clinical credential parameters"
    >
      <div className={styles.tickerTrack}>
        {[1, 2].map((setNum) => (
          <div
            key={setNum}
            className={styles.tickerGroup}
            aria-hidden={setNum === 2 ? true : undefined}
          >
            {items.map((item, idx) => {
              const displayValue =
                item.staticValue || `${item.value ?? ""}${item.suffix || ""}`;
              return (
                <div key={`stat-${setNum}-${idx}`} className={styles.statItem}>
                  <div className={styles.statValue}>{displayValue}</div>
                  <div className={styles.statLabel}>{item.label}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
