"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { SavedPatient } from "../design14/patients";
import MemberAvatar from "../design17/MemberAvatar";
import { design17PatientAvatar } from "../design17/patients";
import styles from "./BookingMemberPicker.module.css";

interface BookingMemberPickerProps {
  patients: SavedPatient[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const memberMeta = (entry: SavedPatient) => `${entry.patient.relation === "self" ? "You" : entry.patient.relation.charAt(0).toUpperCase() + entry.patient.relation.slice(1)}${entry.patient.age ? ` · ${entry.patient.age} yrs` : ""}`;

/** Move only the menu's scrollport; scrollIntoView can also jump the booking page. */
function revealOption(menu: HTMLDivElement | null, option: HTMLButtonElement | null | undefined) {
  if (!menu || !option) return;
  const bounds = menu.getBoundingClientRect();
  const target = option.getBoundingClientRect();
  if (target.top < bounds.top) menu.scrollTop -= bounds.top - target.top;
  else if (target.bottom > bounds.bottom) menu.scrollTop += target.bottom - bounds.bottom;
}

export default function BookingMemberPicker({ patients, selectedId, busy, onSelect, onAdd }: BookingMemberPickerProps) {
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const options = useRef<Array<HTMLButtonElement | null>>([]);
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef(0);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = patients.find(entry => entry.id === selectedId);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };
  const show = (index = Math.max(0, patients.findIndex(entry => entry.id === selectedId))) => {
    if (busy) return;
    pendingFocus.current = index;
    setActiveIndex(index);
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const paymentBar = document.querySelector<HTMLElement>('[aria-label="Complete booking"]');
    const position = () => {
      const anchor = trigger.current;
      const menu = popup.current;
      if (!anchor || !menu || !root.current) return;
      const tokens = getComputedStyle(root.current);
      const gutter = parseFloat(tokens.getPropertyValue("--sp-2")) || 16;
      const navigation = parseFloat(tokens.getPropertyValue("--nav-height")) || 72;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const rect = anchor.getBoundingClientRect();
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const width = Math.min(rect.width, viewportWidth - gutter * 2);
      const left = Math.max(viewportLeft + gutter, Math.min(rect.left, viewportLeft + viewportWidth - gutter - width));
      menu.style.setProperty("--member-popup-width", `${width}px`);
      menu.style.setProperty("--member-popup-left", `${left}px`);
      const dock = paymentBar?.getBoundingClientRect();
      const usableBottom = dock && dock.width > 0 && dock.height > 0 && dock.top < bottom && dock.bottom > top
        ? Math.max(top, dock.top) : bottom;
      const below = Math.max(0, usableBottom - rect.bottom - gutter);
      const above = Math.max(0, rect.top - Math.max(top, navigation) - gutter);
      const desired = menu.scrollHeight;
      const placeAbove = below < desired && above > below;
      menu.style.setProperty("--member-popup-space", `${Math.max(gutter * 3, placeAbove ? above : below)}px`);
      const popupTop = placeAbove ? rect.top - gutter / 2 - menu.getBoundingClientRect().height : rect.bottom + gutter / 2;
      menu.style.setProperty("--member-popup-top", `${popupTop}px`);
    };
    position();
    const initialOption = options.current[pendingFocus.current] ?? addButton.current;
    initialOption?.focus({ preventScroll: true });
    revealOption(popup.current, initialOption);
    const resizeObserver = new ResizeObserver(position);
    if (paymentBar) resizeObserver.observe(paymentBar);
    if (trigger.current) resizeObserver.observe(trigger.current);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    window.visualViewport?.addEventListener("resize", position);
    window.visualViewport?.addEventListener("scroll", position);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      window.visualViewport?.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("scroll", position);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target) && !popup.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Tab" && open) {
      const fromPopup = event.target instanceof Node && popup.current?.contains(event.target);
      if (fromPopup) {
        event.preventDefault();
        if (event.shiftKey) {
          if (event.target === addButton.current && patients.length) {
            options.current[activeIndex]?.focus({ preventScroll: true });
            revealOption(popup.current, options.current[activeIndex]);
          } else close(true);
        } else if (event.target !== addButton.current && addButton.current) {
          addButton.current.focus({ preventScroll: true });
          revealOption(popup.current, addButton.current);
        } else {
          // The portal is at the end of body, but Tab should continue after its trigger.
          const controls = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'));
          const anchorIndex = controls.indexOf(trigger.current!);
          const next = controls.slice(anchorIndex + 1).find(element => element.tabIndex >= 0 && !popup.current?.contains(element) && element.getClientRects().length > 0);
          close();
          (next ?? trigger.current)?.focus();
        }
      } else if (!event.shiftKey) {
        event.preventDefault();
        (options.current[activeIndex] ?? addButton.current)?.focus({ preventScroll: true });
      }
      return;
    }
    if (busy || !patients.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (!open) {
      show(event.key === "End" || event.key === "ArrowUp" ? patients.length - 1 : event.key === "Home" ? 0 : Math.max(0, patients.findIndex(entry => entry.id === selectedId)));
      return;
    }
    const current = options.current.findIndex(option => option === document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? patients.length - 1
      : (Math.max(0, current) + (event.key === "ArrowUp" ? -1 : 1) + patients.length) % patients.length;
    setActiveIndex(next);
    options.current[next]?.focus({ preventScroll: true });
    revealOption(popup.current, options.current[next]);
  };

  return <div ref={root} className={styles.container} data-open={open || undefined} onKeyDown={onKeyDown} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget) && !popup.current?.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" className={styles.trigger} disabled={busy} aria-label={`Select member${selected ? `: ${selected.patient.name}` : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => open ? close() : show()}>
      <MemberAvatar src={design17PatientAvatar(selected)} className={styles.avatar} />
      <span className={styles.copy}><strong>{selected?.patient.name ?? "Choose a member"}</strong><small>{selected ? memberMeta(selected) : "Who is this appointment for?"}</small></span>
      <ChevronDown className={styles.chevron} size={16} aria-hidden />
    </button>
    {open && createPortal(<div ref={popup} className={styles.popup} data-lenis-prevent>
      <div id={menuId} role="listbox" aria-label="Select member">
        {patients.map((entry, index) => <button key={entry.id} ref={element => { options.current[index] = element; }} type="button" role="option" aria-selected={entry.id === selectedId} tabIndex={index === activeIndex ? 0 : -1} disabled={busy} className={styles.option} onFocus={() => setActiveIndex(index)} onClick={() => { onSelect(entry.id); close(true); }}>
          <MemberAvatar src={design17PatientAvatar(entry)} className={styles.avatar} />
          <span className={styles.copy}><strong>{entry.patient.name}</strong><small>{memberMeta(entry)}</small></span>
          <span className={styles.check} aria-hidden>{entry.id === selectedId && <Check size={12} strokeWidth={3} />}</span>
        </button>)}
      </div>
      {patients.length < 10 && <button ref={addButton} type="button" className={styles.add} disabled={busy} onClick={() => { setOpen(false); onAdd(); }}><span className={styles.addIcon} aria-hidden><Plus size={16} /></span><span>Add new member</span></button>}
    </div>, document.body)}
  </div>;
}
