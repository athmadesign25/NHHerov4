"use client";

import { useEffect, useRef } from "react";
import styles from "./BannerProgress.module.css";

type Props = { seconds: number; onComplete: () => void };

/** A visual countdown without rerendering the banner on every frame. */
export default function BannerProgress({ seconds, onComplete }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let elapsed = 0;
    let previous = performance.now();
    let lastPercent = -1;
    const total = Math.max(1, seconds) * 1000;
    const resetClock = () => { previous = performance.now(); };
    const tick = (now: number) => {
      const active = document.activeElement;
      const interacting = active instanceof HTMLElement && Boolean(active.closest("[data-banner-controls], [data-banner-form]"));
      if (!document.hidden && !interacting) elapsed += now - previous;
      previous = now;
      const progress = Math.min(1, elapsed / total);
      if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
      const percent = Math.floor(progress * 100);
      if (percent !== lastPercent) track.current?.setAttribute("aria-valuenow", String(percent));
      lastPercent = percent;
      if (progress >= 1) { onComplete(); return; }
      frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", resetClock);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [seconds, onComplete]);

  return <div ref={track} className={styles.track} role="progressbar" aria-label="Time until banner closes" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
    <span ref={fill} className={styles.fill} />
  </div>;
}
