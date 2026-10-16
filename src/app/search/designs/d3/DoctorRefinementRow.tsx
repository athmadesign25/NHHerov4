"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DoctorRefinementRow.module.css";

interface ScrollEdges {
  overflow: boolean;
  previous: boolean;
  next: boolean;
}

export default function DoctorRefinementRow({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const manualScrollUntilRef = useRef(0);
  const [edges, setEdges] = useState<ScrollEdges>({ overflow: false, previous: false, next: false });
  const reducedMotion = useReducedMotion();
  const viewportId = useId();

  const revealControl = useCallback((control: HTMLElement) => {
    const viewport = viewportRef.current;
    if (!viewport || !viewport.contains(control) || !control.getClientRects().length) return;

    // Layout coordinates stay stable while Framer animates a removed chip's neighbours.
    let left = 0;
    let ancestor: HTMLElement | null = control;
    while (ancestor && ancestor !== viewport) {
      left += ancestor.offsetLeft;
      ancestor = ancestor.offsetParent instanceof HTMLElement ? ancestor.offsetParent : null;
    }
    if (ancestor !== viewport) return;

    const padding = parseFloat(getComputedStyle(viewport).paddingInlineStart) || 0;
    // Leave room for the focus outline and fractional layout rounding at the fades.
    const focusInset = padding * 2;
    const arrowWidth = nextRef.current?.offsetWidth || 0;
    const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const visibleLeft = viewport.scrollLeft + focusInset + (viewport.scrollLeft > 1 ? arrowWidth : 0);
    const visibleRight = viewport.scrollLeft + viewport.clientWidth - focusInset - (viewport.scrollLeft < maximum - 1 ? arrowWidth : 0);
    const right = left + control.offsetWidth;
    const shift = left < visibleLeft ? left - visibleLeft : right > visibleRight ? right - visibleRight : 0;
    // Never call scrollIntoView: that also moves the document under the pinned header.
    if (shift) viewport.scrollTo({ left: Math.max(0, Math.min(maximum, viewport.scrollLeft + shift)), behavior: "instant" });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const spacer = spacerRef.current;
    if (!viewport || !content || !spacer) return;

    let frame = 0;
    let repairTimer = 0;
    let geometryChanged = false;
    const measure = () => {
      frame = 0;
      if (geometryChanged) {
        window.clearTimeout(repairTimer);
        const remaining = manualScrollUntilRef.current - performance.now();
        if (remaining > 0) {
          // Defer a real layout repair until deliberate scrolling finishes; never drop it.
          repairTimer = window.setTimeout(schedule, remaining + 1);
        } else {
          geometryChanged = false;
          if (document.activeElement instanceof HTMLElement) revealControl(document.activeElement);
        }
      }
      const padding = parseFloat(getComputedStyle(viewport).paddingInlineStart) || 0;
      const spacerWidth = spacer.offsetWidth;
      const spacerGap = spacerWidth ? parseFloat(getComputedStyle(content).columnGap) || 0 : 0;
      // Ignore the end affordance's breathing room when deciding whether the controls fit.
      const naturalWidth = content.scrollWidth - spacerWidth - spacerGap;
      const overflow = naturalWidth > viewport.clientWidth - padding * 2 + 1;
      const maximum = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const previous = overflow && viewport.scrollLeft > 1;
      const next = overflow && viewport.scrollLeft < maximum - 1;

      // Keep keyboard focus in the controls when an end arrow becomes unavailable.
      const activeArrow = document.activeElement;
      if ((!previous && activeArrow === previousRef.current) || (!next && activeArrow === nextRef.current)) {
        const controls = Array.from(content.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex='0']"))
          .filter(control => control.getClientRects().length && !control.closest("[hidden], [aria-hidden='true'], [inert]"));
        const target = activeArrow === previousRef.current ? controls[0] : controls.at(-1);
        target?.focus({ preventScroll: true });
      }

      setEdges(current => current.overflow === overflow && current.previous === previous && current.next === next
        ? current
        : { overflow, previous, next });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const geometryChange = () => {
      geometryChanged = true;
      schedule();
    };
    const onScroll = () => {
      // Extend the intent window through native touch momentum or an arrow's smooth scroll.
      if (performance.now() < manualScrollUntilRef.current) {
        manualScrollUntilRef.current = Math.max(manualScrollUntilRef.current, performance.now() + 160);
      }
      schedule();
    };
    const resizeObserver = new ResizeObserver(geometryChange);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    const mutationObserver = new MutationObserver(geometryChange);
    mutationObserver.observe(content, { childList: true, characterData: true, subtree: true });
    viewport.addEventListener("scroll", onScroll, { passive: true });
    geometryChange();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(repairTimer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [revealControl]);

  const revealFocusedControl = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    manualScrollUntilRef.current = 0;
    revealControl(event.target);
  };

  const scrollControls = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    manualScrollUntilRef.current = performance.now() + 300;
    viewport.scrollBy({ left: direction * viewport.clientWidth * 0.75, behavior: reducedMotion ? "instant" : "smooth" });
  };

  return (
    <div className={styles.root} role="group" aria-label="Consultation and filters" data-d3-refinement-row data-overflow={edges.overflow}>
      <motion.div
        ref={viewportRef}
        id={viewportId}
        className={styles.viewport}
        layoutScroll
        data-d3-refinement-viewport
        data-lenis-prevent
        onFocusCapture={revealFocusedControl}
        onTouchMove={() => { manualScrollUntilRef.current = performance.now() + 160; }}
        onWheel={event => {
          if (event.deltaX || event.shiftKey) manualScrollUntilRef.current = performance.now() + 160;
        }}
      >
        <div ref={contentRef} className={styles.content}>
          {children}
          <span ref={spacerRef} className={styles.endSpace} aria-hidden="true" />
        </div>
      </motion.div>
      <div className={`${styles.affordance} ${styles.previous}`} data-visible={edges.previous}>
        <button ref={previousRef} type="button" aria-label="Show earlier consultation and filter controls" aria-controls={viewportId} aria-hidden={!edges.previous} tabIndex={edges.previous ? 0 : -1} disabled={!edges.previous} onPointerDown={event => event.preventDefault()} onClick={() => scrollControls(-1)}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      </div>
      <div className={`${styles.affordance} ${styles.next}`} data-visible={edges.next}>
        <button ref={nextRef} type="button" aria-label="Show more consultation and filter controls" aria-controls={viewportId} aria-hidden={!edges.next} tabIndex={edges.next ? 0 : -1} disabled={!edges.next} onPointerDown={event => event.preventDefault()} onClick={() => scrollControls(1)}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
