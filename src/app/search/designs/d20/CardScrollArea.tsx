"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue } from "framer-motion";
import scrollbar from "../d3/FilterScrollArea.module.css";
import styles from "./DoctorCard.module.css";

/** Reuse the filter panel's overlay rail without consuming any card width. */
export default function CardScrollArea({ children, viewportRef }: {
  children: ReactNode; viewportRef: RefObject<HTMLDivElement | null>;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<number | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const height = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!viewport || !rail) return;
    let frame = 0;
    const measure = () => {
      const range = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const minimum = parseFloat(getComputedStyle(rail).getPropertyValue("--thumb-min"));
      const size = Math.min(rail.clientHeight, Math.max(minimum, rail.clientHeight * viewport.clientHeight / Math.max(1, viewport.scrollHeight)));
      setOverflow(range > 1);
      height.set(size);
      y.set(range > 0 ? (rail.clientHeight - size) * viewport.scrollTop / range : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); });
    };
    const resize = new ResizeObserver(schedule);
    const observe = () => {
      resize.disconnect();
      resize.observe(viewport); resize.observe(rail);
      for (const child of viewport.children) resize.observe(child);
      schedule();
    };
    const mutation = new MutationObserver(observe);
    mutation.observe(viewport, { childList: true, subtree: true });
    viewport.addEventListener("scroll", schedule, { passive: true });
    observe();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); viewport.removeEventListener("scroll", schedule); };
  }, [viewportRef, height, y]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!viewport || !rail || dragOffset.current === null) return;
    const travel = rail.clientHeight - height.get();
    if (travel <= 0) return;
    const position = Math.max(0, Math.min(travel, event.clientY - rail.getBoundingClientRect().top - dragOffset.current));
    viewport.scrollTop = position / travel * (viewport.scrollHeight - viewport.clientHeight);
  };
  const end = () => { dragOffset.current = null; setDragging(false); };

  return <div className={`${scrollbar.area} ${styles.scrollArea}`} data-overflow={overflow} data-dragging={dragging}>
    {children}
    <div ref={railRef} className={scrollbar.rail} data-card-scrollbar aria-hidden="true"
      onPointerDown={event => {
        if (!overflow || event.button !== 0) return;
        event.preventDefault();
        dragOffset.current = event.target === thumbRef.current && thumbRef.current
          ? event.clientY - thumbRef.current.getBoundingClientRect().top : height.get() / 2;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true); move(event);
      }} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      <motion.div ref={thumbRef} className={scrollbar.thumb} style={{ height, y }} />
    </div>
  </div>;
}
