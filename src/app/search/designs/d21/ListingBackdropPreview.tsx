"use client";

import { Check, ChevronUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./ListingBackdropPreview.module.css";
import { LISTING_PREVIEWS, type ListingPreview } from "./listingPreview";

/** Presentation-only comparison: keep the current listing and booking mounted. */
export default function ListingBackdropPreview({ active }: { active: ListingPreview }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const label = LISTING_PREVIEWS.find(variant => variant.value === active)!.label;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return <nav ref={root} className={styles.preview} aria-label="Doctor listing preview" data-listing-preview
    onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}
    onKeyDown={event => {
      if (event.key !== "Escape" || !open) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`Listing preview: ${label}`}
      aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>
      {label}<ChevronUp aria-hidden className={open ? styles.open : undefined} />
    </button>
    {open && <div id={id} className={styles.options} role="group" aria-label="Compare listing interactions">
      {LISTING_PREVIEWS.map(variant => <button key={variant.value} type="button" aria-pressed={active === variant.value}
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set("listingPreview", variant.value);
          window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}>
        {variant.label}{active === variant.value && <Check aria-hidden />}
      </button>)}
    </div>}
  </nav>;
}
