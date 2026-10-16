"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue } from "framer-motion";
import styles from "./FilterScrollArea.module.css";

/** Native scrolling with a non-layout-consuming pointer scrollbar. */
export default function FilterScrollArea({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<number | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [dragging, setDragging] = useState(false);
  const thumbHeight = useMotionValue(0);
  const thumbY = useMotionValue(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const rail = railRef.current;
    if (!viewport || !content || !rail) return;
    const sidebar = viewport.closest("aside");
    const page = sidebar?.closest<HTMLElement>("[data-design]");
    const toolbar = page?.querySelector<HTMLElement>("[data-d3-search-bar]");
    const wheelSurface = sidebar ?? rail;
    const visualViewport = window.visualViewport;
    let frame = 0;
    let toolbarMoving = false;
    let pinnedHeader: HTMLElement | null = null;
    const measure = () => {
      // Measure the shared toolbar, including active chips and the navbar's
      // reveal motion. The panel and keyboard scroll offset use the same edge.
      if (toolbar && page) {
        const bottom = `${Math.max(0, toolbar.getBoundingClientRect().bottom)}px`;
        if (page.style.getPropertyValue("--d3-toolbar-bottom") !== bottom) {
          page.style.setProperty("--d3-toolbar-bottom", bottom);
        }
      }
      if (sidebar && sidebar.getClientRects().length) {
        const styles = getComputedStyle(sidebar);
        // Before the panel sticks, its actual top is lower than the sticky inset.
        const top = Math.max(sidebar.getBoundingClientRect().top, parseFloat(styles.top) || 0);
        const bottom = visualViewport ? visualViewport.offsetTop + visualViewport.height : window.innerHeight;
        const gap = parseFloat(styles.getPropertyValue("--filter-bottom-gap") || styles.getPropertyValue("--sp-4"));
        const height = `${Math.max(0, Math.floor(bottom - top - gap))}px`;
        if (sidebar.style.getPropertyValue("--filter-panel-max-height") !== height) {
          sidebar.style.setProperty("--filter-panel-max-height", height);
        }
      }
      // Exiting panels and layout transforms inflate native scrollHeight briefly.
      // Only normal-flow content determines whether the options need scrolling.
      const contentHeight = content.offsetHeight;
      const range = Math.max(0, contentHeight - viewport.clientHeight);
      if (viewport.scrollTop > range) viewport.scrollTop = range;
      const headerOverlap = parseFloat(getComputedStyle(content).paddingBlockStart) || 0;
      const pinTop = viewport.getBoundingClientRect().top + headerOverlap;
      const pinnedCategory = Array.from(content.querySelectorAll<HTMLElement>('[data-filter-group][data-expanded="true"] > [data-filter-category-header]'))
        .find((header) => {
          const box = header.getBoundingClientRect();
          return box.top <= pinTop + 1 && box.bottom > pinTop;
        }) ?? null;
      // Join only the pinned heading to the glass; headings in the list stay plain.
      if (pinnedHeader !== pinnedCategory) {
        pinnedHeader?.removeAttribute("data-pinned");
        pinnedHeader?.style.removeProperty("--filter-pinned-clip");
        pinnedCategory?.setAttribute("data-pinned", "");
        pinnedHeader = pinnedCategory;
      }
      // The shared backdrop follows the visible part of the outgoing heading.
      // This keeps one continuous surface during category hand-offs and collapse.
      const pinnedBox = pinnedCategory?.getBoundingClientRect();
      const visibleHeight = pinnedBox ? Math.max(0, Math.min(pinnedBox.height, pinnedBox.bottom - pinTop)) : 0;
      const glassExtent = `${visibleHeight}px`;
      if (sidebar?.style.getPropertyValue("--filter-pinned-height") !== glassExtent) {
        sidebar?.style.setProperty("--filter-pinned-height", glassExtent);
      }
      if (pinnedHeader && pinnedBox) {
        const clip = `${Math.max(0, pinTop - pinnedBox.top)}px`;
        if (pinnedHeader.style.getPropertyValue("--filter-pinned-clip") !== clip) {
          pinnedHeader.style.setProperty("--filter-pinned-clip", clip);
        }
      }
      sidebar?.toggleAttribute("data-pinned-filter-category", pinnedCategory !== null);
      const minimum = parseFloat(getComputedStyle(rail).getPropertyValue("--thumb-min"));
      const height = Math.min(rail.clientHeight, Math.max(minimum, rail.clientHeight * Math.max(0, viewport.clientHeight - headerOverlap) / Math.max(1, contentHeight - headerOverlap)));
      setOverflow(range > 1);
      thumbHeight.set(height);
      thumbY.set(range > 0 ? (rail.clientHeight - height) * viewport.scrollTop / range : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0; measure();
        if (toolbarMoving) schedule();
      });
    };
    const trackToolbar = (event: TransitionEvent) => {
      if (event.target !== toolbar || event.propertyName !== "transform") return;
      toolbarMoving = event.type === "transitionrun";
      schedule();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport); observer.observe(content); observer.observe(rail);
    // A chip row can grow without a scroll event. Update the panel before paint
    // so the taller toolbar cannot cover it for a frame.
    const toolbarObserver = new ResizeObserver(measure);
    if (toolbar) toolbarObserver.observe(toolbar);
    toolbar?.addEventListener("transitionrun", trackToolbar);
    toolbar?.addEventListener("transitionend", trackToolbar);
    toolbar?.addEventListener("transitioncancel", trackToolbar);
    viewport.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    visualViewport?.addEventListener("resize", schedule);
    visualViewport?.addEventListener("scroll", schedule);
    const wheel = (event: WheelEvent) => {
      // Keep native wheel/trackpad momentum over options. Bridge only the header,
      // padding and overlay rail into the same scrollport, without moving the page.
      if (event.defaultPrevented || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target instanceof Node && viewport.contains(event.target)) return;
      if (content.offsetHeight <= viewport.clientHeight + 1) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? parseFloat(getComputedStyle(viewport).lineHeight) : event.deltaMode === 2 ? viewport.clientHeight : 1;
      viewport.scrollTop += event.deltaY * unit;
    };
    wheelSurface.addEventListener("wheel", wheel, { passive: false });
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); toolbarObserver.disconnect();
      toolbar?.removeEventListener("transitionrun", trackToolbar);
      toolbar?.removeEventListener("transitionend", trackToolbar);
      toolbar?.removeEventListener("transitioncancel", trackToolbar);
      page?.style.removeProperty("--d3-toolbar-bottom");
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("scroll", schedule);
      wheelSurface.removeEventListener("wheel", wheel);
      pinnedHeader?.removeAttribute("data-pinned");
      pinnedHeader?.style.removeProperty("--filter-pinned-clip");
      sidebar?.style.removeProperty("--filter-panel-max-height");
      sidebar?.style.removeProperty("--filter-pinned-height");
      sidebar?.removeAttribute("data-pinned-filter-category");
    };
  }, [thumbHeight, thumbY]);

  const moveThumb = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const rail = railRef.current;
    if (!viewport || !content || !rail || dragOffset.current === null) return;
    const travel = rail.clientHeight - thumbHeight.get();
    if (travel <= 0) return;
    const position = Math.max(0, Math.min(travel, event.clientY - rail.getBoundingClientRect().top - dragOffset.current));
    viewport.scrollTop = position / travel * Math.max(0, content.offsetHeight - viewport.clientHeight);
  };
  const endDrag = () => { dragOffset.current = null; setDragging(false); };

  return <div className={styles.area} data-overflow={overflow} data-dragging={dragging}>
    <motion.div ref={viewportRef} layoutScroll className={styles.viewport} role="region" aria-label="Filter options" tabIndex={0} data-filter-scroll-viewport data-lenis-prevent>
      <div ref={contentRef} className={styles.content}>{children}</div>
    </motion.div>
    <div ref={railRef} className={styles.rail} data-filter-scrollbar aria-hidden="true"
      onPointerDown={(event) => {
        if (!overflow || event.button !== 0) return;
        event.preventDefault();
        dragOffset.current = event.target === thumbRef.current && thumbRef.current
          ? event.clientY - thumbRef.current.getBoundingClientRect().top : thumbHeight.get() / 2;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true); moveThumb(event);
      }} onPointerMove={moveThumb} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
      <motion.div ref={thumbRef} className={styles.thumb} style={{ height: thumbHeight, y: thumbY }} />
    </div>
  </div>;
}
