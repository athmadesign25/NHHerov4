"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, X } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import styles from "./HealthSelectionFeedback.module.css";

export interface SelectionNotice {
  id: number;
  text: string;
  tone: "success" | "info";
}

export default function HealthSelectionFeedback({ notice, onDismiss }: { notice: SelectionNotice | null; onDismiss: () => void }) {
  const reduceMotion = useReducedMotion();
  const dismiss = useRef(onDismiss);
  const [paused, setPaused] = useState(false);
  const [dockHeight, setDockHeight] = useState<number>();
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
  useEffect(() => {
    if (!notice || paused) return;
    const timer = window.setTimeout(() => dismiss.current(), notice.tone === "success" ? 3500 : 6500);
    return () => window.clearTimeout(timer);
  }, [notice, paused]);
  useEffect(() => {
    if (!notice) return;
    const dock = document.querySelector<HTMLElement>("[data-health-selection-dock]");
    const measure = () => setDockHeight(dock ? Math.max(0, window.innerHeight - dock.getBoundingClientRect().top) : 0);
    measure();
    const observer = new ResizeObserver(measure);
    if (dock) observer.observe(dock);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [notice]);

  return <div className={styles.position} style={dockHeight === undefined ? undefined : { "--health-dock-clearance": `${dockHeight}px` } as CSSProperties}>
    <AnimatePresence>
      {notice && <motion.div key={notice.id} className={styles.notice} data-tone={notice.tone}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        transition={{ duration: reduceMotion ? 0 : duration.emphasis, ease: ease.out }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
        <span className={styles.mark}>{notice.tone === "success" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="M5 12.5 9.5 17 19 7" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0 : duration.emphasis, ease: ease.standard, delay: reduceMotion ? 0 : duration.fast }} />
        </svg> : <Info aria-hidden />}</span>
        <p role="status" aria-live="polite" aria-atomic="true">{notice.text}</p>
        <button type="button" aria-label="Dismiss message" onClick={() => { setPaused(false); onDismiss(); }}><X aria-hidden /></button>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
