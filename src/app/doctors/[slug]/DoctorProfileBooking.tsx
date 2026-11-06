"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AppointmentSelector from "@/app/search/designs/d20/AppointmentSelector";
import LoginModal from "@/features/auth/LoginModal";
import useDesign20Booking from "@/features/booking/design20/useDesign20Booking";
import { design20RequestedSelection } from "@/features/booking/design20/model";
import { appointmentPricing } from "@/features/booking/design17/pricing";
import { formatBookingDate } from "@/features/booking/format";
import type { BookingDoctorSummary } from "@/features/booking/types";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { getDesign20BookingDoctor, getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import styles from "./DoctorProfileBooking.module.css";

interface Props { doctor: DoctorListingItem; initialMode: ConsultationMode; date: string; returnTo: string; tone?: "light" | "dark" }

export default function DoctorProfileBooking({ doctor, initialMode, date, returnTo, tone = "light" }: Props) {
  const params = useSearchParams();
  const resume = params.get("booking") === doctor.id && params.get("bookingResume") === "1";
  const [started, setStarted] = useState(resume);
  const [expanded, setExpanded] = useState(resume);
  const action = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const bookingDoctor = getDesign20BookingDoctor(doctor.id);
  const available = !!bookingDoctor && Object.values(doctor.modes).some(Boolean);
  const id = useId();
  const toggle = () => {
    setStarted(true);
    setExpanded(value => !value);
  };
  const close = () => {
    setExpanded(false);
    requestAnimationFrame(() => action.current?.focus({ preventScroll: true }));
  };
  return <motion.aside className={styles.dock} layout={reduced ? false : "size"} data-profile-booking data-expanded={expanded} data-tone={tone}
    onKeyDown={event => {
      if (event.key === "Escape" && expanded && !document.querySelector(':popover-open, dialog[open], [role="dialog"]')) {
        event.preventDefault(); close();
      }
    }}
    aria-label={`Book an appointment with ${doctor.name}`} transition={{ layout: { duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] } }}>
    {started && bookingDoctor ? <BookingControls doctor={bookingDoctor}
      initialSelection={design20RequestedSelection(bookingDoctor, new URLSearchParams({ mode: initialMode, hospital: doctor.hospital, ...(date ? { date } : {}) }))}
      returnTo={returnTo} resume={resume} expanded={expanded} toggle={toggle} close={close} action={action} panelId={id} />
      : <div className={styles.summary}>
        <div className={styles.doctor}><strong>{doctor.name}</strong><span>Choose a time that works for you</span></div>
        <Price fee={doctor.fee} />
        {available ? <button ref={action} type="button" className={styles.primary} onClick={toggle} aria-expanded={false} aria-controls={id}>Book appointment</button>
          : <a href="tel:08067506836" className={styles.primary}>Contact hospital</a>}
      </div>}
  </motion.aside>;
}

function Price({ fee }: { fee: string }) {
  const priced = /\d/.test(fee);
  return <div className={styles.price}><strong>{priced ? appointmentPricing(fee).base : "Confirm fee"}</strong>{priced && <span>onwards</span>}</div>;
}

function BookingControls({ doctor, initialSelection, returnTo, resume, expanded, toggle, close, action, panelId }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; resume: boolean;
  expanded: boolean; toggle: () => void; close: () => void; action: RefObject<HTMLButtonElement | null>; panelId: string;
}) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, preserveEntry: true, resume });
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  const { selection } = flow.draft;
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  useEffect(() => {
    if (expanded) heading.current?.focus({ preventScroll: true });
  }, [expanded]);
  return <>
    <AnimatePresence initial={false} mode="popLayout">{expanded && <motion.div key="options" id={panelId} className={styles.panel}
      initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
      <header className={styles.header}><div><h2 ref={heading} tabIndex={-1}>Choose your appointment</h2><p>{doctor.name}</p></div>
        <button type="button" className={styles.collapse} onClick={close} aria-label="Minimise appointment options"><ChevronDown size={20} aria-hidden /></button></header>
      <div className={styles.options} data-lenis-prevent>
        {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
        {!flow.loaded ? <p className={styles.notice} role="status">Finding available times…</p>
          : <AppointmentSelector doctor={doctor} selection={selection} now={flow.now} onChange={flow.selectTime} autoSelectFirst={flow.phase === "slots" && !flow.busy && !flow.expired} />}
      </div>
    </motion.div>}</AnimatePresence>
    <motion.div layout={reduced ? false : "position"} className={styles.summary}>
      {expanded ? <div className={styles.selected} aria-live="polite" aria-atomic="true"><span>Your appointment</span><strong>{selection.time ? <>{formatBookingDate(selection.date, "short")} <span aria-hidden>·</span> {selection.time}</> : "Choose an available time"}</strong></div>
        : <div className={styles.doctor}><strong>{doctor.name}</strong><span>{selection.mode === "hospital" ? "Hospital visit" : "Video consultation"}</span></div>}
      <Price fee={selectedDoctor?.fee ?? doctor.fee} />
      <button ref={action} type="button" className={styles.primary} aria-expanded={expanded} aria-controls={panelId}
        disabled={expanded && (!flow.loaded || !selection.time || flow.busy || flow.expired)}
        onClick={expanded ? flow.continueBooking : toggle}>{expanded ? flow.busy ? "Continuing…" : "Continue" : "Book appointment"}</button>
    </motion.div>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}
