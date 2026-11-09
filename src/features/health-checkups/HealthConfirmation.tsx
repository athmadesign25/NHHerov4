"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CalendarDays, Check, FlaskConical, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { SavedPatient } from "@/features/booking/design14/patients";
import MemberAvatar from "@/features/booking/design17/MemberAvatar";
import { design17PatientAvatar } from "@/features/booking/design17/patients";
import { formatBookingDate } from "@/features/booking/format";
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
      <motion.span className={styles.successIcon} initial={reduced ? false : { scale: .8 }} animate={{ scale: 1 }} transition={{ duration: duration.slow, ease: ease.spring }}><Check size={28} strokeWidth={2.5} aria-hidden /></motion.span>
      <div><h1 ref={heading} tabIndex={-1}>Your booking is confirmed</h1><p>You’ll receive a confirmation email and SMS on your registered contact details.</p></div>
    </header>
    <div className={styles.sheet}>
      <section className={styles.member} aria-labelledby="health-booked-for">
        <MemberAvatar className={styles.avatar} src={design17PatientAvatar(member)} name={member.patient.name} size={48} />
        <div><h2 id="health-booked-for">Booked for</h2><p>{member.patient.name}<span>{member.patient.age ? `${member.patient.age} years` : ""}</span></p></div>
      </section>
      <div className={styles.content}>
        <section className={styles.visit} aria-labelledby="health-visit-details">
          <h2 id="health-visit-details">Your visit</h2>
          <div className={styles.detail}><span className={styles.iconCircle}><MapPin size={20} aria-hidden /></span><div><span className={styles.label}>Hospital / clinic</span><p>{facility.name}{" "}<a className={styles.distance} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionDestination)}`} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${facility.name}`}>{hasDistance ? `${facility.distanceKm} km` : "Get directions"}<Navigation size={12} aria-hidden /></a></p><span className={styles.secondary}>{facility.city}</span></div></div>
          {needsSlot && date && time ? <div className={styles.detail}><span className={styles.iconCircle}><CalendarDays size={20} aria-hidden /></span><div><span className={styles.label}>Slot date &amp; time</span><p>{formatBookingDate(date)}<span aria-hidden> · </span><span className={styles.time}>{time}</span></p></div></div>
            : <div className={styles.noSlot}><p>No online slot was selected for these tests.</p><a href="tel:18003090309" className={styles.contactLink}>Check collection timings</a></div>}
          {preparationNotes.length > 0 && <div className={styles.preparation}><h3>Before your visit</h3>{preparationNotes.map(note => <p key={note}>{note}</p>)}</div>}
        </section>
        <section className={styles.order} aria-labelledby="health-booked-items">
          <h2 id="health-booked-items">Booked packages &amp; tests</h2>
          <ul>{items.map(item => <li key={item.id}><span className={styles.itemIcon}><FlaskConical size={18} aria-hidden /></span><div><strong>{item.name}</strong><span>{item.kind === "package" ? (Number.isFinite(item.testCount) && item.testCount > 0 ? `${item.testCount} ${item.testCount === 1 ? "test" : "tests"} & checks` : "Health package") : "Lab test"}</span></div><span className={styles.price}>{money(item.price)}</span></li>)}</ul>
          <div className={styles.paid}><span><ShieldCheck size={16} aria-hidden />Paid online</span><strong>{money(cartTotal(items))}</strong></div>
        </section>
      </div>
      <footer className={styles.footer}><Link className={styles.primary} href="/">Back to home</Link><button className={styles.secondaryButton} type="button" onClick={onRestart}>Explore more checkups</button></footer>
    </div>
  </motion.div>;
}
