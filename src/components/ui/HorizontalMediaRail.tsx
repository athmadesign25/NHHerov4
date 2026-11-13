"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useMouseDragScroll from "@/components/ui/useMouseDragScroll";
import styles from "./HorizontalMediaRail.module.css";

interface HorizontalMediaRailProps {
  id: string;
  labelledBy: string;
  itemLabel: string;
  heading: ReactNode;
  children: ReactNode;
}

/** Native swipe scrolling, with drag and keyboard alternatives. Never remaps vertical wheel input. */
export default function HorizontalMediaRail({ id, labelledBy, itemLabel, heading, children }: HorizontalMediaRailProps) {
  const items = Children.toArray(children);
  const rail = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [edges, setEdges] = useState({ overflow: false, previous: false, next: false });
  const itemKey = items.map((item, index) => typeof item === "object" && "key" in item ? item.key : index).join("|");
  useMouseDragScroll(rail, itemKey);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const measure = () => {
      const max = element.scrollWidth - element.clientWidth;
      const next = { overflow: max > 1, previous: max > 1 && element.scrollLeft > 1, next: max > 1 && element.scrollLeft < max - 1 };
      setEdges(current => current.overflow === next.overflow && current.previous === next.previous && current.next === next.next ? current : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const item of element.children) observer.observe(item);
    element.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, [itemKey]);

  function scroll(direction: number) {
    const element = rail.current;
    const first = element?.firstElementChild;
    if (!element || !first) return;
    const step = first.getBoundingClientRect().width + (parseFloat(getComputedStyle(element).columnGap) || 0);
    const visible = Math.max(1, Math.floor((element.clientWidth + 1) / step));
    element.scrollBy({ left: direction * step * visible, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return <div className={styles.root}>
    <header className={styles.header}>
      <div className={styles.heading}>{heading}</div>
      {edges.overflow && <div className={styles.controls}>
        <button type="button" aria-label={`Previous ${itemLabel}`} aria-controls={id} disabled={!edges.previous} onClick={() => scroll(-1)}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" aria-label={`Next ${itemLabel}`} aria-controls={id} disabled={!edges.next} onClick={() => scroll(1)}><ChevronRight aria-hidden="true" /></button>
      </div>}
    </header>
    <div ref={rail} id={id} className={styles.rail} role="list" aria-labelledby={labelledBy}
      tabIndex={edges.overflow ? 0 : undefined} data-overflow={edges.overflow || undefined}
      data-fade-start={edges.previous || undefined} data-fade-end={edges.next || undefined} data-lenis-prevent-horizontal
      onKeyDown={event => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); scroll(event.key === "ArrowLeft" ? -1 : 1);
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          event.currentTarget.scrollTo({ left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth, behavior: reducedMotion ? "auto" : "smooth" });
        }
      }}
      onFocusCapture={event => {
        const element = rail.current;
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-media-rail-item]");
        if (!element || !card) return;
        const bounds = element.getBoundingClientRect();
        const item = card.getBoundingClientRect();
        const computed = getComputedStyle(element);
        const padding = parseFloat(computed.paddingLeft) || 0;
        const fade = parseFloat(computed.getPropertyValue("--rail-fade-width")) || 0;
        const startInset = padding + (edges.previous ? fade : 0);
        const endInset = padding + (edges.next ? fade : 0);
        const delta = item.left < bounds.left + startInset ? item.left - bounds.left - startInset
          : item.right > bounds.right - endInset ? item.right - bounds.right + endInset : 0;
        if (delta) element.scrollBy({ left: delta, behavior: reducedMotion ? "auto" : "smooth" });
      }}>
      {Children.map(children, child => <div role="listitem" className={styles.item} data-media-rail-item>{child}</div>)}
    </div>
  </div>;
}
