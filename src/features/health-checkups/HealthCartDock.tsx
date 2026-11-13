"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { BookingBackdrop } from "@/features/booking/components/BookingFocus";
import useBookingFocus from "@/features/booking/components/useBookingFocus";
import { duration, ease } from "@/lib/motion";
import { cartTotal, money, type HealthItem } from "./catalog";
import styles from "./HealthCartDock.module.css";

interface HealthCartDockProps {
  items: HealthItem[];
  centre: string;
  expanded: boolean;
  legacy?: boolean;
  addition: number;
  onExpandedChange: (expanded: boolean) => void;
  onRemove: (id: string) => void;
  onContinue: () => void;
  onBrowse: () => void;
  onEmptyClose: () => void;
}

/** The cart grows from the same bottom anchor as the doctor-profile booking bar. */
export default function HealthCartDock({ items, centre, expanded, legacy, addition, onExpandedChange, onRemove, onContinue, onBrowse, onEmptyClose }: HealthCartDockProps) {
  const reduced = useReducedMotion();
  const dock = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const panelId = useId();
  const headingId = useId();
  const centreId = useId();
  const layout = { duration: reduced ? 0 : duration.emphasis, ease: ease.out };
  useBookingFocus(expanded, dock);

  useEffect(() => {
    if (!expanded) return;
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [expanded]);

  function collapse() {
    onExpandedChange(false);
    requestAnimationFrame(() => {
      if (trigger.current) trigger.current.focus({ preventScroll: true });
      else onEmptyClose();
    });
  }

  function removeItem(id: string, index: number) {
    onRemove(id);
    requestAnimationFrame(() => {
      const remaining = dock.current?.querySelectorAll<HTMLButtonElement>("[data-cart-remove]");
      const next = remaining?.[Math.min(index, remaining.length - 1)];
      (next ?? heading.current)?.focus({ preventScroll: true });
    });
  }

  return <>
    <BookingBackdrop open={expanded} onDismiss={collapse} />
    <AnimatePresence>
    {(items.length > 0 || expanded) && <motion.aside key="cart-dock" ref={dock} layoutRoot className={styles.dock}
      initial={false} exit={{ opacity: 0, y: reduced ? 0 : 12 }} transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}
      data-health-selection-dock data-booking-focus data-expanded={expanded}
      role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined}
      aria-labelledby={expanded ? headingId : undefined} aria-label={expanded ? undefined : "Your cart"}
      aria-describedby={expanded ? centreId : undefined} tabIndex={-1}
      onKeyDown={event => { if (expanded && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); collapse(); } }}>
      <motion.div className={styles.animatedSurface} layout={!reduced} layoutAnchor={{ x: 0, y: 1 }}
        style={{ originY: 1 }} transition={{ layout }}>
        <div className={styles.surface}>
          <AnimatePresence initial={false} mode="popLayout">
            {expanded && <motion.div key="cart" id={panelId} className={styles.panel} layout={reduced ? false : "position"}
              initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : duration.base, ease: ease.out, layout }}>
              <header className={styles.header}>
                <div><h2 id={headingId} ref={heading} tabIndex={-1}>Your cart</h2><p id={centreId}>{centre}</p></div>
                <button type="button" className={styles.collapse} onClick={collapse} aria-label="Collapse cart"><ChevronDown size={20} aria-hidden /></button>
              </header>
              <div className={styles.items} data-lenis-prevent>
                {items.length ? <ul className={styles.list}>
                  {items.map((item, index) => <li key={item.id} className={styles.item}>
                    <div className={styles.itemInfo}><h3>{item.name}</h3><p>{item.kind === "package" ? "Health package" : "Lab test"}</p></div>
                    <span className={styles.itemPrice}>{money(item.price)}</span>
                    <button type="button" data-cart-remove className={styles.remove} aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id, index)}><Trash2 size={18} aria-hidden /></button>
                  </li>)}
                </ul> : <p className={styles.empty} role="status">Your cart is empty.</p>}
                <button type="button" className={styles.browse} onClick={onBrowse}>{items.length ? "Add more packages & tests" : "Explore packages & tests"}</button>
              </div>
            </motion.div>}
          </AnimatePresence>
          <motion.div className={styles.summary} layout={reduced ? false : "position"} transition={{ layout }}>
            <button ref={trigger} type="button" className={styles.selection} aria-expanded={expanded}
              aria-controls={expanded ? panelId : undefined} aria-haspopup="dialog"
              onClick={() => expanded ? collapse() : onExpandedChange(true)}>
              <span className={styles.bag}>
                <span key={addition} className={addition > 0 ? styles.cartReceive : styles.cartGlyph}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2.75 3a.75.75 0 0 0 0 1.5h1.63l2.14 10.7A2.25 2.25 0 0 0 8.73 17h10.52a.75.75 0 0 0 0-1.5H8.73a.75.75 0 0 1-.74-.6L7.81 14h10.42a2 2 0 0 0 1.94-1.52l1.3-5.18A1.05 1.05 0 0 0 20.45 6H6.21l-.48-2.4A.75.75 0 0 0 5 3H2.75Z" />
                  <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
                </svg>
                </span>
                {addition > 0 && <span key={`plus-${addition}`} className={styles.healthPlus} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4V2Z" /></svg>
                </span>}
              </span>
              <span className={styles.selectionText}>
                <strong>{items.length} {items.length === 1 ? "item" : "items"}</strong>
                <span className={styles.cartAction}>{expanded ? "Hide cart" : "View cart"}<span className={styles.chevron}>{expanded ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}</span></span>
              </span>
            </button>
            <div className={styles.total} aria-live="polite" aria-atomic="true"><span>Total payable</span><strong>{money(cartTotal(items))}</strong></div>
            <button type="button" className={styles.primary} disabled={!items.length}
              onClick={legacy && !expanded ? () => onExpandedChange(true) : onContinue}>
              {legacy && !expanded ? "Review selection" : "Continue"}<ArrowRight size={16} aria-hidden />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.aside>}
    </AnimatePresence>
  </>;
}
