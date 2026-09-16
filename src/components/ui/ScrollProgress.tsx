"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import styles from "./ScrollProgress.module.css";

interface LenisLike {
  scrollTo: (target: number, opts?: Record<string, unknown>) => void;
}

const THUMB_HEIGHT = 56;

export default function ScrollProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isDragging) setProgress(latest);
  });

  const scrollToFraction = (fraction: number) => {
    const clamped = Math.min(1, Math.max(0, fraction));
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = clamped * maxScroll;

    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) {
      lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo(0, targetY);
    }
    setProgress(clamped);
  };

  const fractionFromPointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return (clientY - rect.top) / rect.height;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => {
      scrollToFraction(fractionFromPointer(e.clientY));
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    scrollToFraction(fractionFromPointer(e.clientY));
    setIsDragging(true);
  };

  const active = isDragging || isHovering;

  return (
    <div
      className={`${styles.trackWrap} ${active ? styles.active : ""}`}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      onPointerDown={handlePointerDown}
      role="scrollbar"
      aria-label="Page scroll progress"
      aria-orientation="vertical"
      aria-controls="main-content"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div ref={trackRef} className={styles.track}>
        <div
          className={styles.thumb}
          style={{ top: `calc((100% - ${THUMB_HEIGHT}px) * ${progress})` }}
        />
      </div>
    </div>
  );
}
