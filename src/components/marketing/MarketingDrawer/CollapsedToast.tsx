"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import { useIsMobile } from "./useIsMobile";
import { type HeadlinePart, COLLAPSED_LABEL } from "./types";
import styles from "./CollapsedToast.module.css";

type Props = {
  parts: HeadlinePart[];
  ctaLabel: string;
  onExpand: () => void;
  onDismiss: () => void;
  onDock: () => void;
};

/** L3: a compact image banner; the full campaign opens only on request. */
export default function CollapsedToast({ parts, ctaLabel, onExpand, onDismiss, onDock }: Props) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const tiltFrame = useRef(0);
  const tiltBounds = useRef<DOMRect | null>(null);
  const controls = useAnimationControls();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"image" | "wash" | "title" | "cta">("image");
  const [closing, setClosing] = useState(false);

  const resetTilt = () => {
    cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = 0;
    tiltBounds.current = null;
    if (tiltRef.current) tiltRef.current.style.removeProperty("transform");
  };

  useEffect(() => {
    if (isMobile || reduced || closing) {
      cancelAnimationFrame(tiltFrame.current);
      tiltFrame.current = 0;
      tiltBounds.current = null;
      tiltRef.current?.style.removeProperty("transform");
    }
    return () => cancelAnimationFrame(tiltFrame.current);
  }, [isMobile, reduced, closing]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timers: number[] = [];
    const enter = async () => {
      await controls.start({ opacity: 1, scale: 1, x: 0, y: 0, transition: { duration: reduced ? 0 : duration.slowest, ease: ease.out } });
      if (cancelled) return;
      if (reduced) { setPhase("cta"); return; }
      const imageHold = duration.slow;
      const washTime = duration.slowest * 2;
      const titleTime = duration.slowest + duration.fast * 2;
      timers.push(window.setTimeout(() => setPhase("wash"), imageHold * 1000));
      timers.push(window.setTimeout(() => setPhase("title"), (imageHold + washTime) * 1000));
      timers.push(window.setTimeout(() => setPhase("cta"), (imageHold + washTime + titleTime) * 1000));
    };
    void enter();
    return () => { cancelled = true; timers.forEach(window.clearTimeout); };
  }, [controls, ready, reduced]);

  const dock = async () => {
    if (closing) return;
    resetTilt();
    setClosing(true);
    onDock();
    // Wait for the island to reserve its new slot before measuring it.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const source = ref.current?.getBoundingClientRect();
    const destination = document.querySelector<HTMLElement>("[data-banner-bubble]");
    const target = destination?.getBoundingClientRect();
    if (source && target && !reduced) {
      await controls.start({
        x: target.left + target.width / 2 - (source.left + source.width / 2),
        y: target.top + target.height / 2 - (source.top + source.height / 2),
        scale: target.width / source.width,
        opacity: [1, 1, 0],
        transition: { duration: duration.slowest, ease: ease.out },
      });
    }
    onDismiss();
    destination?.focus({ preventScroll: true });
  };

  // Follow the real navbar edge while its scroll animation is in progress.
  useEffect(() => {
    const element = ref.current;
    if (!isMobile) {
      element?.style.removeProperty("top");
      return;
    }
    const nav = document.querySelector("nav");
    if (!nav) return;
    const tokens = getComputedStyle(document.documentElement);
    const gap = parseFloat(tokens.getPropertyValue("--space-12"));
    const minTop = parseFloat(tokens.getPropertyValue("--space-8"));
    let raf = 0;
    let until = 0;
    const follow = () => {
      if (element) element.style.top = `${Math.max(minTop, nav.getBoundingClientRect().bottom + gap)}px`;
      raf = performance.now() < until ? requestAnimationFrame(follow) : 0;
    };
    const onScroll = () => {
      until = performance.now() + duration.slowest * 1000;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    follow();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      element?.style.removeProperty("top");
    };
  }, [isMobile]);

  // Three short campaign lines at most; extra content belongs in L1.
  const headline = parts.length ? parts.slice(0, 3) : [{ id: "fallback", text: COLLAPSED_LABEL, colorId: "black" }];

  return (
    <motion.div ref={ref} className={styles.toast} data-ready={ready} data-phase={phase} data-closing={closing} role="region" aria-label="Hospital announcement"
      initial={{ opacity: 0, scale: reduced ? 1 : 0.96, x: reduced ? 0 : 24 }}
      animate={controls}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: reduced ? 0 : duration.slow, ease: ease.out }}>
      <div ref={tiltRef} className={styles.card}
        onPointerEnter={event => {
          if (!isMobile && !reduced && phase === "cta" && !closing && event.pointerType === "mouse") tiltBounds.current = ref.current?.getBoundingClientRect() ?? null;
        }}
        onPointerMove={event => {
          const bounds = tiltBounds.current;
          if (!bounds || closing || tiltFrame.current) return;
          const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)));
          const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)));
          tiltFrame.current = requestAnimationFrame(() => {
            tiltFrame.current = 0;
            if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale(1.015)`;
          });
        }}
        onPointerLeave={resetTilt}>
      <div className={styles.photo}>
        <Image src="/navigation/hospitals/l3-hospital.webp" alt="Narayana Health hospital campus" fill sizes="(max-width: 768px) 160px, 304px" onLoad={() => setReady(true)} />
      </div>
      <span className={styles.overlay} aria-hidden="true" />
      <button type="button" disabled={closing} className={styles.openToast} onClick={onExpand} aria-label={`Read announcement: ${headline.map(part => part.text).join(" ")}`}>
        <span className={styles.media} aria-hidden="true" />
        <span className={styles.copy}>
          {headline.map(part => <span key={part.id} className={styles.line}><span className={`${styles.lineText} ${part.colorId === "red" ? styles.accent : ""}`}>{part.text}</span></span>)}
        </span>
      </button>
      <div className={styles.ctaRow}>
        <button type="button" className={styles.cta} disabled={closing} onClick={onExpand}>{ctaLabel || "Learn more"}</button>
      </div>
      <button type="button" className={styles.dismiss} onClick={() => void dock()} disabled={closing} aria-label="Dismiss announcement toast"><X aria-hidden="true" /></button>
      </div>
    </motion.div>
  );
}
