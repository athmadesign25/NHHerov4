"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronUp } from "lucide-react";
import { HEALTH_DESIGNS, type HealthDesign } from "./healthDesigns";
import styles from "./HealthDesignPreview.module.css";

export type { HealthDesign } from "./healthDesigns";

export default function HealthDesignPreview({ design, hasSelection, onChange }: {
  design: HealthDesign;
  hasSelection: boolean;
  onChange: (design: HealthDesign) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const preview = root.current;
    if (!preview) return;
    const dock = document.querySelector<HTMLElement>("[data-health-selection-dock]");
    if (!hasSelection || !dock) {
      preview.style.removeProperty("--health-preview-dock-offset");
      return;
    }
    const measure = () => preview.style.setProperty("--health-preview-dock-offset", `${Math.max(0, innerHeight - dock.getBoundingClientRect().top)}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [hasSelection]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return <nav ref={root} className={styles.preview} data-docked={hasSelection || undefined} aria-label="Health checkup design preview"
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus({ preventScroll: true }); }
    }} onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
    {open && <div id={id} className={styles.options} role="group" aria-label="Choose health checkup design">
      {HEALTH_DESIGNS.map(option => <button key={option.id} type="button" aria-pressed={design === option.id} onClick={() => {
        onChange(option.id); setOpen(false); trigger.current?.focus({ preventScroll: true });
      }}><span>{option.label}</span>{design === option.id && <Check size={14} aria-hidden />}</button>)}
    </div>}
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`Compare health checkup designs. Design ${design} selected`} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>
      <span>Design {design}</span><ChevronUp size={12} aria-hidden className={open ? styles.expanded : undefined} />
    </button>
  </nav>;
}
