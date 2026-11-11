"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CalendarDays, FlaskConical, MapPin, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import JourneyHeading from "@/components/ui/JourneyHeading";
import SuccessMark from "@/features/booking/shared/SuccessMark";
import type { SavedPatient } from "@/features/booking/shared/types";
import MemberAvatar from "@/features/booking/shared/MemberAvatar";
import { patientAvatar } from "@/features/booking/shared/patients";
import { formatBookingDate } from "@/features/booking/shared/dates";
import { duration, ease } from "@/lib/motion";
import { cartRequiresSlot, cartTotal, money, type HealthFacility, type HealthItem } from "./catalog";
import styles from "./HealthConfirmation.module.css";

export interface HealthConfirmationProps {
  items: HealthItem[];
  facility: HealthFacility;
  member: SavedPatient;
  date: string;
  time: string;
  onRestart: () => void;
}

export default function HealthConfirmation({ items, facility, member, date, time, onRestart }: HealthConfirmationProps) {
  const reduced = useReducedMotion();
  const needsSlot = cartRequiresSlot(items);
  const heading = useRef<HTMLHeadingElement>(null);
  const preparationNotes = [...new Set(items.map(item => item.preparation?.trim() ?? "").filter(Boolean))];
  const hasDistance = typeof facility.distanceKm === "number" && Number.isFinite(facility.distanceKm) && facility.distanceKm >= 0;
  const directionDestination = facility.address?.trim() || `${facility.name}, ${facility.city}`;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return <motion.div className={styles.confirmation} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }}>
    <header className={styles.header}>
      <SuccessMark />
      <div><JourneyHeading ref={heading} tabIndex={-1} tone="success">Your booking is confirmed</JourneyHeading><p>You’ll receive a confirmation email and SMS on your registered contact details.</p></div>
    </header>
    <div className={styles.sheet}>
      <section className={styles.member} aria-labelledby="health-booked-for">
        <h2 id="health-booked-for">Booked for</h2>
        <div className={styles.memberRow}><MemberAvatar className={styles.avatar} src={patientAvatar(member)} name={member.patient.name} size={40} /><p>{member.patient.name}<span>{member.patient.age ? `${member.patient.age} ${member.patient.age === "1" ? "year" : "years"}` : ""}</span></p></div>
      </section>
      <div className={styles.content}>
        <section className={styles.visit} aria-labelledby="health-visit-details">
          <h2 id="health-visit-details">Your visit</h2>
          <div className={styles.detail}><span className={styles.iconCircle}><MapPin size={20} aria-hidden /></span><div><span className={styles.label}>Hospital / clinic</span><p>{facility.name}{" "}<a className={styles.distance} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionDestination)}`} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${facility.name}`}>{hasDistance ? `${facility.distanceKm} km` : "Get directions"}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a></p><span className={styles.secondary}>{facility.city}</span></div></div>
          {needsSlot && date && time ? <div className={styles.detail}><span className={styles.iconCircle}><CalendarDays size={20} aria-hidden /></span><div><span className={styles.label}>Slot date &amp; time</span><p>{formatBookingDate(date)}<span aria-hidden> · </span><span className={styles.time}>{time}</span></p></div></div>
            : <div className={styles.noSlot}><p>No online slot was selected for these tests.</p><a href="tel:18003090309" className={styles.contactLink}>Check collection timings</a></div>}
          {preparationNotes.length > 0 && <div className={styles.preparation}><h3>Before your visit</h3>{preparationNotes.map(note => <p key={note}>{note}</p>)}</div>}
        </section>
        <section className={styles.order} aria-labelledby="health-booked-items">
          <h2 id="health-booked-items">Booked packages &amp; tests</h2>
          <ul>{items.map(item => <li key={item.id}><span className={styles.itemIcon}><FlaskConical size={18} aria-hidden /></span><div><strong>{item.name}</strong><span>{item.kind === "package" ? (Number.isFinite(item.testCount) && item.testCount > 0 ? `${item.testCount} ${item.testCount === 1 ? "test" : "tests"} & checks` : "Health package") : "Lab test"}</span></div><span className={styles.price}>{money(item.price)}</span></li>)}</ul>
          <div className={styles.paid}><span><ShieldCheck size={16} aria-hidden />{cartTotal(items) === 0 ? "No payment due" : "Paid online"}</span><strong>{money(cartTotal(items))}</strong></div>
        </section>
      </div>
      <footer className={styles.footer}><Link className={styles.primary} href="/">Back to home</Link><button className={styles.secondaryButton} type="button" onClick={onRestart}>Explore more checkups</button></footer>
    </div>
  </motion.div>;
}
