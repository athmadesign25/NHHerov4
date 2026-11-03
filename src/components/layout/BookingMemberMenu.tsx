"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { bookingMemberAvatar, chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, subscribeBookingMembers } from "@/features/booking/design20/memberSelection";
import MemberAvatar from "@/features/booking/design17/MemberAvatar";
import MemberSwitchCoachmark from "./MemberSwitchCoachmark";
import styles from "./BookingMemberMenu.module.css";

export default function BookingMemberMenu({ onLogout, confirmed: confirmationRoute = false }: { onLogout: () => void; confirmed?: boolean }) {
  const selection = useSyncExternalStore(subscribeBookingMembers, getBookingMemberSelection, getServerBookingMemberSelection);
  const confirmed = confirmationRoute || Boolean(selection.confirmed);
  const member = selection.members.find(entry => entry.id === selection.selectedId) ?? selection.members[0];
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = (restore = false) => { setOpen(false); if (restore) trigger.current?.focus({ preventScroll: true }); };

  useLayoutEffect(() => {
    if (!open || !popup.current || !trigger.current) return;
    const panel = popup.current;
    panel.showPopover();
    const position = () => {
      const rect = trigger.current!.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(panel).getPropertyValue("--sp-1"));
      const width = Math.min(parseFloat(getComputedStyle(panel).getPropertyValue("--sp-16")) * 2.5, innerWidth - gap * 4);
      Object.assign(panel.style, { width: `${width}px`, left: `${Math.max(gap * 2, Math.min(rect.right - width, innerWidth - width - gap * 2))}px`, top: `${rect.bottom + gap}px`, maxHeight: `${Math.max(0, innerHeight - rect.bottom - gap * 3)}px` });
    };
    position();
    panel.querySelector<HTMLElement>(confirmed ? '[role="menuitem"]' : '[aria-checked="true"]')?.focus({ preventScroll: true });
    window.addEventListener("resize", position);
    return () => { panel.hidePopover(); window.removeEventListener("resize", position); };
  }, [open, confirmed]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const scroll = (event: Event) => { if (event.target instanceof Node && popup.current?.contains(event.target)) return; setOpen(false); };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", scroll, true);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("scroll", scroll, true); };
  }, [open]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); return; }
    if (!open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const options = Array.from(popup.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]:not(:disabled), [role="menuitem"]') ?? []);
    const index = options.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length;
    options[next]?.focus({ preventScroll: true });
    options[next]?.scrollIntoView({ block: "nearest" });
  };

  return <div ref={root} className={styles.root} data-booking-member-menu onKeyDown={onKeyDown} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close();
  }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`${confirmed ? "Booked" : "Booking"} for ${member.name}. ${confirmed ? "Your account" : "Change patient"}`}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => open ? close() : setOpen(true)}>
      <MemberAvatar src={bookingMemberAvatar(member)} className={styles.triggerAvatar} />
      <span className={styles.triggerCopy}><strong>{member.name}</strong></span>
      <ChevronDown size={14} className={styles.chevron} aria-hidden />
    </button>
    {open && <div ref={popup} id={id} popover="manual" role="menu" aria-label="Booking member and account" className={styles.popup} data-lenis-prevent>
      <div role="group" aria-labelledby={`${id}-heading`}>
        <p id={`${id}-heading`} className={styles.heading}>{confirmed ? "Booked for" : "Booking for"}</p>
        {selection.members.filter(entry => !confirmed || entry.id === member.id).map(entry => <button key={entry.id} type="button" role="menuitemradio" tabIndex={-1} disabled={confirmed} aria-checked={entry.id === member.id} className={styles.member}
          onClick={() => { chooseBookingMember(entry.id); setAnnouncement(`Booking for ${entry.name}`); close(true); }}>
          <MemberAvatar src={bookingMemberAvatar(entry)} className={styles.avatar} />
          <span className={styles.memberCopy}><strong>{entry.name}</strong><small>{entry.relation === "self" ? "You" : entry.relation.charAt(0).toUpperCase() + entry.relation.slice(1)}{entry.age ? ` · ${entry.age} yrs` : ""}</small></span>
          {entry.id === member.id && <Check size={16} className={styles.check} aria-hidden />}
        </button>)}
      </div>
      <div className={styles.account} role="group" aria-label="Your account">
        <Link role="menuitem" tabIndex={-1} href="/bookings" onClick={() => close()}>My Consultations</Link>
        <Link role="menuitem" tabIndex={-1} href="/records" onClick={() => close()}>My Tests</Link>
        <button role="menuitem" tabIndex={-1} type="button" className={styles.logout} onClick={() => { close(); onLogout(); }}>Logout</button>
      </div>
    </div>}
    <MemberSwitchCoachmark anchor={trigger} enabled={!open && !confirmed} />
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}
