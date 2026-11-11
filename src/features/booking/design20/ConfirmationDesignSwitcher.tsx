"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronUp, Layers2 } from "lucide-react";
import styles from "./BookingDesignSwitcher.module.css";
import layout from "./ConfirmationDesignSwitcher.module.css";

export type ConfirmationDesign = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const designLabels: Record<ConfirmationDesign, string> = { 1: "Original", 2: "Celebration", 3: "Refined", 4: "Combined", 5: "Patient first", 6: "Consistent journey", 7: "Green celebration" };

/** Comparison changes presentation only; the confirmed receipt stays untouched. */
export default function ConfirmationDesignSwitcher({ active, onChange }: {
  active: ConfirmationDesign;
  onChange: (design: ConfirmationDesign) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let dock: HTMLElement | null = null;
    const measure = () => {
      const next = document.querySelector<HTMLElement>("[data-confirmation-actions]");
      if (next !== dock) {
        if (dock) observer.unobserve(dock);
        dock = next;
        if (dock) observer.observe(dock);
      }
      element.style.setProperty("--preview-dock-offset", `${dock ? Math.max(0, window.innerHeight - dock.getBoundingClientRect().top) : 0}px`);
    };
    const observer = new ResizeObserver(measure);
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
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {open && <div id={id} className={`${styles.options} ${layout.options}`} role="group" aria-label="Appointment confirmation design">
      {([1, 2, 3, 4, 5, 6, 7] as const).map(design => <button key={design} type="button" aria-pressed={active === design} onClick={() => {
        onChange(design); setOpen(false); trigger.current?.focus({ preventScroll: true });
      }}><span><strong>Design {design}</strong><small>{designLabels[design]}</small></span>{active === design && <Check size={16} aria-hidden />}</button>)}
    </div>}
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`Compare confirmation designs. Design ${active} selected`} aria-expanded={open} aria-controls={open ? id : undefined} title="Compare confirmation designs" onClick={() => setOpen(value => !value)}>
      <Layers2 size={16} aria-hidden /><span>Design {active}</span><ChevronUp size={14} aria-hidden className={open ? styles.expanded : undefined} />
    </button>
  </div>;
}
