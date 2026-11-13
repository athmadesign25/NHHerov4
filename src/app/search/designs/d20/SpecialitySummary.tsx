"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./DefaultDoctorCard.module.css";
import { cardLayoutTransition } from "./cardMotion";

export default function SpecialitySummary({ text, layoutId }: { text: string; layoutId?: string }) {
  const reduced = useReducedMotion();
  const label = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [overflow, setOverflow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = label.current;
    if (!element) return;
    const measure = () => setOverflow(element.scrollWidth > element.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return <div className={styles.specialityGroup}
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
    onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
    onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <motion.span ref={label} className={styles.speciality} layout={reduced ? false : "position"} layoutId={layoutId} transition={{ layout: cardLayoutTransition }}
      tabIndex={overflow ? 0 : undefined} aria-describedby={overflow && open ? id : undefined}>
      {text}
    </motion.span>
    {overflow && open && <span id={id} role="tooltip" className={styles.specialityTooltip}>{text}</span>}
  </div>;
}
