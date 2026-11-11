"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, Clock3, FlaskConical, MapPin, Navigation, ShieldCheck, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import BookingMemberPicker from "@/features/booking/shared/BookingMemberPicker";
import type { SavedPatient } from "@/features/booking/shared/types";
import { formatBookingDate } from "@/features/booking/shared/dates";
import useMouseDragScroll from "@/components/ui/useMouseDragScroll";
import { duration, ease } from "@/lib/motion";
import { cartRequiresSlot, cartTotal, getHealthSlots, healthDateKey, healthDates, healthEligibilityMessage, money, type HealthFacility, type HealthItem } from "./catalog";
import styles from "./HealthCheckout.module.css";

export interface HealthCheckoutProps {
  items: HealthItem[];
  facility: HealthFacility;
  members: SavedPatient[];
  memberId: string | null;
  onMemberChange: (id: string) => void;
  onAddMember: () => void;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onRemove: (id: string) => void;
  onPay: () => void;
  paymentError?: string;
}

export default function HealthCheckout({ items, facility, members, memberId, onMemberChange, onAddMember, date, time, onDateChange, onTimeChange, onBack, onRemove, onPay, paymentError }: HealthCheckoutProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const [now] = useState(() => Date.now());
  const dates = healthDates(14, new Date(now));
  const needsSlot = cartRequiresSlot(items);
  const slots = getHealthSlots(date);
  const dateStrip = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [edges, setEdges] = useState({ start: false, end: true });
  const [activeMonth, setActiveMonth] = useState(dates[0]?.slice(0, 7));
  useMouseDragScroll(dateStrip, needsSlot);
  const months = [...new Set(dates.map(value => value.slice(0, 7)))];
  const monthLabel = (value: string) => new Date(`${value}-01T12:00:00Z`).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
  const total = cartTotal(items);
  const selectedMember = members.find(member => member.id === memberId);
  const validMember = !!selectedMember;
  const eligibilityError = selectedMember ? healthEligibilityMessage(items, selectedMember.patient) : null;
  const canPay = items.length > 0 && validMember && !eligibilityError && (!needsSlot || slots.includes(time));
  const preparationNotes = [...new Set(items.map(item => item.preparation?.trim() ?? "").filter(Boolean))];
  const hasDistance = typeof facility.distanceKm === "number" && Number.isFinite(facility.distanceKm) && facility.distanceKm >= 0;
  const directionDestination = facility.address?.trim() || `${facility.name}, ${facility.city}`;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    const strip = dateStrip.current;
    if (!strip) return;
    const update = () => {
      setEdges({ start: strip.scrollLeft > 1, end: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 });
      const anchor = strip.getBoundingClientRect().left + parseFloat(getComputedStyle(strip).paddingInlineStart);
      let current = months[0];
      strip.querySelectorAll<HTMLElement>("[data-month]").forEach(group => {
        if (group.getBoundingClientRect().left < anchor) current = group.dataset.month ?? current;
      });
      setActiveMonth(current);
    };
    update();
    strip.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    return () => { strip.removeEventListener("scroll", update); observer.disconnect(); };
  // The calendar horizon stays fixed for this checkout visit.
  }, [needsSlot]);

  const scrollDates = (direction: number) => dateStrip.current?.scrollBy({ left: direction * dateStrip.current.clientWidth * .75, behavior: reduced ? "instant" : "smooth" });
  const revealFocusedDate = (button: HTMLButtonElement) => {
    const strip = dateStrip.current;
    if (!strip) return;
    const viewport = strip.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    const padding = getComputedStyle(strip);
    const left = viewport.left + parseFloat(padding.paddingInlineStart);
    const right = viewport.right - parseFloat(padding.paddingInlineEnd);
    const offset = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
    if (offset) strip.scrollBy({ left: offset, behavior: "instant" });
  };

  return <div className={styles.checkout}>
    <header className={styles.header}>
      <button type="button" className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden />Back to packages &amp; tests</button>
      <h1 ref={heading} tabIndex={-1}>Complete your booking</h1>
      <p>Choose a member and review your checkup.</p>
    </header>
    <div className={styles.layout}>
      <div className={styles.details}>
        <section className={styles.section} aria-labelledby={`${id}-member`}>
          <div className={styles.sectionHeading}><span className={styles.stepNumber}>1</span><h2 id={`${id}-member`}>Who is this booking for?</h2></div>
          <BookingMemberPicker patients={members} selectedId={memberId} busy={false} onSelect={onMemberChange} onAdd={onAddMember} />
          {eligibilityError && <div id={`${id}-eligibility`} className={styles.memberError} role="alert"><CircleAlert size={18} aria-hidden /><div><p>{eligibilityError}</p><button type="button" className={styles.textButton} onClick={onBack}>Change package</button></div></div>}
        </section>
        <section className={styles.section} aria-labelledby={`${id}-visit`}>
          <div className={styles.sectionHeading}><span className={styles.stepNumber}>2</span><h2 id={`${id}-visit`}>Your visit</h2></div>
          <div className={styles.location}>
            <span className={styles.iconCircle}><MapPin size={20} aria-hidden /></span>
            <div><span className={styles.label}>Hospital / clinic</span><p className={styles.facilityName}>{facility.name}{" "}<a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionDestination)}`} target="_blank" rel="noopener noreferrer" className={styles.distance} aria-label={`Get directions to ${facility.name}${hasDistance ? `, ${facility.distanceKm} kilometres away` : ""}`}>{hasDistance ? `${facility.distanceKm} km` : "Get directions"}<Navigation size={12} aria-hidden /></a></p><span className={styles.locationCity}>{facility.city}</span></div>
          </div>
          {needsSlot ? <div className={styles.slotFields}>
            <div className={styles.fieldHeading}><CalendarDays size={18} aria-hidden /><h3 id={`${id}-dates-heading`}>Select date</h3></div>
            <div className={styles.dateWrap} data-start={edges.start} data-end={edges.end}>
              <div ref={dateStrip} id={`${id}-dates`} className={styles.dates} data-lenis-prevent-horizontal role="group" aria-labelledby={`${id}-dates-heading`}>
                {months.map(month => <div className={styles.monthGroup} data-month={month} key={month}>
                  <span className={styles.monthMarker} aria-hidden>{monthLabel(month)}</span>
                  {dates.filter(value => value.startsWith(month)).map(value => {
                    const day = new Date(`${value}T12:00:00Z`);
                    const available = getHealthSlots(value).length > 0;
                    return <button type="button" key={value} aria-pressed={value === date} aria-current={value === healthDateKey(new Date(now)) ? "date" : undefined} disabled={!available} aria-label={`${formatBookingDate(value)}${available ? "" : ", no slots available"}`} onFocus={event => revealFocusedDate(event.currentTarget)} onClick={() => onDateChange(value)}><span>{day.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span><strong>{day.getUTCDate()}</strong></button>;
                  })}
                </div>)}
              </div>
              <span className={styles.stickyMonth} aria-hidden>{monthLabel(activeMonth ?? dates[0].slice(0, 7))}</span>
              <button type="button" className={`${styles.dateArrow} ${styles.datePrevious}`} disabled={!edges.start} aria-label="Earlier dates" aria-controls={`${id}-dates`} onClick={() => scrollDates(-1)}><ChevronLeft size={18} aria-hidden /></button>
              <button type="button" className={`${styles.dateArrow} ${styles.dateNext}`} disabled={!edges.end} aria-label="More dates" aria-controls={`${id}-dates`} onClick={() => scrollDates(1)}><ChevronRight size={18} aria-hidden /></button>
            </div>
            <div className={styles.fieldHeading}><Clock3 size={18} aria-hidden /><h3 id={`${id}-times-heading`}>Select time</h3></div>
            <div className={styles.times} role="group" aria-labelledby={`${id}-times-heading`}>
              {slots.map(slot => <button type="button" key={slot} aria-pressed={time === slot} onClick={() => onTimeChange(slot)}>{slot}</button>)}
            </div>
            {!slots.length && <p className={styles.helper}>No times available on this date. Please choose another day.</p>}
          </div> : <div className={styles.noSlot}><Clock3 size={18} aria-hidden /><div><strong>No online slot selection</strong><p>Contact the clinic before attending.</p><a href="tel:18003090309" className={styles.contactLink}>Check collection timings</a></div></div>}
          {preparationNotes.length > 0 && <div className={styles.preparation}><h3>Before your visit</h3>{preparationNotes.map(note => <p key={note}>{note}</p>)}</div>}
        </section>
      </div>
      <aside className={styles.summary} aria-labelledby={`${id}-order`}>
        <div className={styles.summaryHeading}><h2 id={`${id}-order`}>Your selection</h2><button type="button" onClick={onBack} className={styles.textButton}>Add more</button></div>
        <ul className={styles.items}>{items.map(item => <li key={item.id}>
          <span className={styles.itemIcon}><FlaskConical size={20} aria-hidden /></span>
          <div className={styles.itemCopy}><strong>{item.name}</strong><span>{item.kind === "package" ? (Number.isFinite(item.testCount) && item.testCount > 0 ? `${item.testCount} ${item.testCount === 1 ? "test" : "tests"} & checks` : "Health package") : "Lab test"}</span><button type="button" className={styles.remove} aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)}><Trash2 size={12} aria-hidden />Remove</button></div>
          <span className={styles.itemPrice}>{money(item.price)}</span>
        </li>)}</ul>
        {needsSlot && date && time && <div className={styles.selectedTime}><Check size={16} aria-hidden /><span>{formatBookingDate(date, "short")}<span aria-hidden> · </span>{time}</span></div>}
        <dl className={styles.paymentDetails}><div><dt>Subtotal</dt><dd>{money(total)}</dd></div><div className={styles.total}><dt>Total payable</dt><dd>{money(total)}</dd></div></dl>
        {paymentError && <p className={styles.paymentError} role="alert">{paymentError}</p>}
        <motion.button type="button" className={styles.pay} disabled={!canPay} aria-describedby={eligibilityError ? `${id}-eligibility` : undefined} onClick={onPay} whileTap={reduced ? undefined : { scale: .98 }} transition={{ duration: duration.fast, ease: ease.out }}>Pay online <span>{money(total)}</span></motion.button>
        {!validMember && <p className={styles.helper}>Choose a member to continue.</p>}
        <p className={styles.secure}><ShieldCheck size={14} aria-hidden />Secure payment</p>
      </aside>
    </div>
  </div>;
}
