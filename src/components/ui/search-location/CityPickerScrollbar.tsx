"use client";

import { useEffect, useRef, useState, type RefObject, type PointerEvent } from "react";
import { motion, useMotionValue } from "framer-motion";
import scrollbarStyles from "../OverlayScrollbar.module.css";
import styles from "./SearchCityPicker.module.css";

/** Uses the filter panel's actual rail and thumb styles, without consuming layout space. */
export default function CityPickerScrollbar({ viewport }: { viewport: RefObject<HTMLDivElement | null> }) {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const offset = useRef<number | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const height = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const view = viewport.current;
    const track = rail.current;
    if (!view || !track) return;
    const measure = () => {
      const range = Math.max(0, view.scrollHeight - view.clientHeight);
      const minimum = parseFloat(getComputedStyle(track).getPropertyValue("--thumb-min"));
      const size = Math.min(track.clientHeight, Math.max(minimum, track.clientHeight * view.clientHeight / Math.max(1, view.scrollHeight)));
      height.set(size);
      y.set(range ? (track.clientHeight - size) * view.scrollTop / range : 0);
      setOverflow(range > 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    observer.observe(track);
    Array.from(view.children).forEach(child => observer.observe(child));
    view.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { observer.disconnect(); view.removeEventListener("scroll", measure); };
  }, [viewport, height, y]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!viewport.current || !rail.current || offset.current === null) return;
    const travel = rail.current.clientHeight - height.get();
    if (travel <= 0) return;
    const position = Math.max(0, Math.min(travel, event.clientY - rail.current.getBoundingClientRect().top - offset.current));
    viewport.current.scrollTo({ top: position / travel * (viewport.current.scrollHeight - viewport.current.clientHeight), behavior: "instant" });
  };
  const stop = () => { offset.current = null; setDragging(false); };
  return <div className={styles.scrollbar} data-overflow={overflow} data-dragging={dragging}>
    <div ref={rail} className={scrollbarStyles.rail} aria-hidden="true"
      onPointerDown={event => {
        if (!overflow || event.button !== 0) return;
        event.preventDefault();
        offset.current = event.target === thumb.current && thumb.current
          ? event.clientY - thumb.current.getBoundingClientRect().top : height.get() / 2;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        move(event);
      }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
      <motion.div ref={thumb} className={scrollbarStyles.thumb} style={{ height, y }} />
    </div>
  </div>;
}
