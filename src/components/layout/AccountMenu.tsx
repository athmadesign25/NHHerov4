"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { CalendarCheck, Check, ChevronDown, FileText, LogOut, User } from "lucide-react";
import styles from "./AccountMenu.module.css";

// Same preview family as the booking flow; no patient data is persisted here.
export const DEMO_ACCOUNT_MEMBERS = [
  { id: "self", name: "Aditya", relation: "You" },
  { id: "child", name: "Aarav", relation: "Child" },
  { id: "spouse", name: "Hazel", relation: "Spouse" },
  { id: "parent", name: "Rahul", relation: "Parent" },
];

export interface AccountMember { id: string; name: string; relation: string }

interface AccountMenuProps {
  memberId: string;
  onMemberChange: (id: string) => void;
  onLogout: () => void;
  onNavigate?: () => void;
  tone: "light" | "dark";
  mobile?: boolean;
  onOpen?: () => void;
  members?: AccountMember[];
  memberLocked?: boolean;
}

export default function AccountMenu({ memberId, onMemberChange, onLogout, onNavigate, tone, mobile = false, onOpen, members = DEMO_ACCOUNT_MEMBERS, memberLocked = false }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const id = useId();
  const member = members.find(entry => entry.id === memberId) ?? members[0] ?? DEMO_ACCOUNT_MEMBERS[0];
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  };
  const show = (focus = false) => { focusRequested.current = focus; onOpen?.(); setOpen(true); };

  useLayoutEffect(() => {
    if (!open || !popup.current) return;
    const panel = popup.current;
    panel.showPopover();
    const position = () => {
      if (!trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(panel).getPropertyValue("--space-8"));
      const width = panel.getBoundingClientRect().width;
      const height = panel.getBoundingClientRect().height;
      const above = mobile || rect.bottom + gap + height > innerHeight;
      panel.style.left = `${Math.max(gap, Math.min(rect.right - width, innerWidth - width - gap))}px`;
      panel.style.top = `${above ? Math.max(gap, rect.top - height - gap) : rect.bottom + gap}px`;
    };
    position();
    if (focusRequested.current) panel.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const observer = new ResizeObserver(position);
    observer.observe(panel);
    window.addEventListener("resize", position);
    return () => { observer.disconnect(); window.removeEventListener("resize", position); panel.hidePopover(); };
  }, [open, mobile]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && popup.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", dismiss, true);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (!open) { show(true); return; }
    const items = [...(popup.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]') ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    items[next]?.focus();
  };

  return <div ref={root} className={`${styles.root} ${mobile ? styles.mobile : ""}`} data-tone={tone} onKeyDown={onKeyDown}
    onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <button type="button" ref={trigger} className={styles.trigger} data-account-trigger aria-label={`Your account, ${member.name}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => open ? close() : show(true)}>
      <span className={styles.avatar} aria-hidden="true">{member.name[0]}</span>
      <span className={styles.name}>{member.name}</span><ChevronDown className={styles.chevron} aria-hidden="true" />
    </button>
    {open && <div ref={popup} popover="manual" id={id} role="menu" aria-label="Family members and account" className={styles.popup} data-lenis-prevent>
      <div role="group" aria-labelledby={`${id}-members`} className={styles.members}>
        <p id={`${id}-members`} className={styles.heading}>Switch member</p>
        {members.map(entry => <button type="button" role="menuitemradio" aria-checked={entry.id === member.id} disabled={memberLocked} className={styles.row} key={entry.id}
          onClick={() => { onMemberChange(entry.id); close(true); }}>
          <span className={styles.avatar} aria-hidden="true">{entry.name[0]}</span>
          <span className={styles.memberCopy}><strong>{entry.name}</strong><small>{entry.relation}</small></span>
          {entry.id === member.id && <Check aria-hidden="true" />}
        </button>)}
      </div>
      <div role="group" aria-label="Your account" className={styles.actions}>
        <Link href="/profile" role="menuitem" className={styles.row} onClick={() => { close(); onNavigate?.(); }}><User aria-hidden="true" />My account</Link>
        <Link href="/bookings" role="menuitem" className={styles.row} onClick={() => { close(); onNavigate?.(); }}><CalendarCheck aria-hidden="true" />My bookings</Link>
        <Link href="/records" role="menuitem" className={styles.row} onClick={() => { close(); onNavigate?.(); }}><FileText aria-hidden="true" />Health records</Link>
        <button type="button" role="menuitem" className={`${styles.row} ${styles.logout}`} onClick={() => { close(); onLogout(); }}><LogOut aria-hidden="true" />Sign out</button>
      </div>
    </div>}
  </div>;
}
