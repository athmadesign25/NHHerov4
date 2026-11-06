"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronUp, Layers2 } from "lucide-react";
import styles from "./BookingDesignSwitcher.module.css";

export type BookingSummaryDesign = 1 | 2 | 3 | 4;

export default function BookingDesignSwitcher({ active, disabled, onChange }: {
  active: BookingSummaryDesign;
  disabled: boolean;
  onChange: (design: BookingSummaryDesign) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  // Keep this preview control clear of each version's fixed payment actions.
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let dock: HTMLElement | null = null;
    const observer = new ResizeObserver(() => measure());
    const measure = () => {
      const nextDock = document.querySelector<HTMLElement>('[aria-label="Complete booking"]');
      if (nextDock !== dock) {
        if (dock) observer.unobserve(dock);
        dock = nextDock;
        if (dock) observer.observe(dock);
      }
      const rect = dock?.getBoundingClientRect();
      const fixed = dock && getComputedStyle(dock).position === "fixed";
      element.style.setProperty("--preview-dock-offset", `${fixed && rect ? Math.max(0, window.innerHeight - rect.top) : 0}px`);
    };
    measure();
    const portals = new MutationObserver(measure);
    portals.observe(document.body, { childList: true });
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); portals.disconnect(); window.removeEventListener("resize", measure); };
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return <div ref={root} className={styles.switcher} onKeyDown={event => {
    if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
  }} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {open && <div id={id} className={styles.options} role="group" aria-label="Booking summary design">
      {([1, 2, 3, 4] as const).map(design => <button key={design} type="button" aria-pressed={active === design} disabled={disabled} onClick={() => {
        onChange(design); setOpen(false); trigger.current?.focus();
      }}><span><strong>Design {design}</strong><small>{design === 1 ? "Original" : design === 2 ? "Member-first" : design === 3 ? "Refined original" : "Consistent journey"}</small></span>{active === design && <Check size={16} aria-hidden />}</button>)}
    </div>}
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`Switch booking design. Design ${active} selected`} aria-expanded={open} aria-controls={open ? id : undefined} disabled={disabled} title={disabled ? "Finish editing to switch designs" : "Compare booking designs"} onClick={() => setOpen(value => !value)}>
      <Layers2 size={16} aria-hidden /><span>Design {active}</span><ChevronUp size={14} aria-hidden className={open ? styles.expanded : undefined} />
    </button>
  </div>;
}
