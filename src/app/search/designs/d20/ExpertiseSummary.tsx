"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./DefaultDoctorCard.module.css";

export default function ExpertiseSummary({ terms }: { terms: string[] }) {
  const text = terms.length ? terms.join(" · ") : "Not listed";
  const measure = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const keyboardOpen = useRef(false);
  const id = useId();
  const [overflow, setOverflow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = measure.current;
    if (!element) return;
    const update = () => {
      const needsDisclosure = element.scrollWidth > element.clientWidth + 1;
      setOverflow(needsDisclosure);
      if (!needsDisclosure) setOpen(false);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!open || !overflow) return;
    const popover = panel.current;
    const button = trigger.current;
    if (!popover || !button) return;
    const position = () => {
      const rect = button.getBoundingClientRect();
      const tokens = getComputedStyle(button);
      const gap = parseFloat(tokens.getPropertyValue("--sp-1"));
      const inset = gap * 2;
      const width = Math.min(rect.width, window.innerWidth - inset * 2);
      const below = Math.max(0, window.innerHeight - rect.bottom - inset - gap);
      const above = Math.max(0, rect.top - inset - gap);
      popover.style.width = `${width}px`;
      const maxPanelHeight = parseFloat(tokens.getPropertyValue("--sp-16")) * 2;
      const preferredHeight = Math.min(popover.scrollHeight, maxPanelHeight);
      const opensAbove = below < preferredHeight && above > below;
      popover.style.left = `${Math.max(inset, Math.min(rect.left, window.innerWidth - width - inset))}px`;
      popover.style.top = opensAbove ? "auto" : `${rect.bottom + gap}px`;
      popover.style.bottom = opensAbove ? `${window.innerHeight - rect.top + gap}px` : "auto";
      popover.style.maxHeight = `${Math.min(maxPanelHeight, opensAbove ? above : below)}px`;
    };
    popover.showPopover();
    position();
    if (keyboardOpen.current) popover.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      button.focus({ preventScroll: true });
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && popover.contains(event.target)) return;
      position();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", scroll, true);
    return () => {
      popover.hidePopover();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open, overflow, text]);

  return <div ref={root} className={styles.expertise}
    onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <span ref={measure} className={styles.expertiseMeasure} aria-hidden>Expertise: {text}</span>
    {overflow ? <button ref={trigger} className={styles.expertiseToggle} type="button" aria-expanded={open} aria-controls={open ? id : undefined}
      aria-haspopup="dialog" aria-label={`${open ? "Hide" : "Show all"} expertise`}
      onClick={event => { keyboardOpen.current = event.detail === 0; setOpen(value => !value); }}>
      <span className={styles.expertiseText}>Expertise: {text}</span><ChevronDown size={14} aria-hidden />
    </button> : <p className={styles.expertiseText}>Expertise: {text}</p>}
    {open && overflow && <div ref={panel} id={id} popover="manual" role="dialog" aria-labelledby={`${id}-heading`}
      tabIndex={-1} className={`${styles.locationsPopover} ${styles.expertisePopover}`} data-lenis-prevent>
      <h3 id={`${id}-heading`}>Expertise</h3>
      <ul>{terms.map(term => <li key={term}>{term}</li>)}</ul>
    </div>}
  </div>;
}
