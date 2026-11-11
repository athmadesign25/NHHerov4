"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
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
import { duration, ease } from "@/lib/motion";
import styles from "./DoctorProfileBooking.module.css";
import { BookingBackdrop, BookingFocusGlow } from "@/features/booking/components/BookingFocus";
import useProfileBookingModal from "./useProfileBookingModal";

export interface ProfileBookingRequest { id: number; mode: ConsultationMode; hospital: string }

interface Props { bookingRequest?: ProfileBookingRequest; doctor: DoctorListingItem; initialMode: ConsultationMode; date: string; returnTo: string; tone?: "light" | "dark" }

export default function DoctorProfileBooking({ doctor, initialMode, date, returnTo, tone = "light", bookingRequest }: Props) {
  const params = useSearchParams();
  const resume = params.get("booking") === doctor.id && params.get("bookingResume") === "1";
  const [started, setStarted] = useState(resume);
  const [expanded, setExpanded] = useState(resume);
  const [highlightOpening, setHighlightOpening] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const action = useRef<HTMLButtonElement>(null);
  const dock = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const bookingDoctor = getDesign20BookingDoctor(doctor.id);
  const available = !!bookingDoctor && Object.values(doctor.modes).some(Boolean);
  const id = useId();
  useProfileBookingModal(expanded, dock);
  useEffect(() => {
    if (!bookingRequest || !available) return;
    setStarted(true);
    setHighlightOpening(true);
    setExpanded(true);
  }, [bookingRequest, available]);
  const toggle = () => {
    setStarted(true);
    setHighlightOpening(!expanded);
    setExpanded(value => !value);
  };
  const close = () => {
    setHighlightOpening(false);
    setExpanded(false);
    requestAnimationFrame(() => action.current?.focus({ preventScroll: true }));
  };
  return <>
    <BookingBackdrop open={expanded} suspended={authOpen} onDismiss={close} />
    <motion.aside ref={dock} className={styles.dock} layoutRoot data-booking-focus data-profile-booking data-expanded={expanded} data-started={started} data-bookable={available} data-tone={tone}
    role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} tabIndex={-1}
    onKeyDown={event => {
      if (event.key === "Escape" && !event.defaultPrevented && expanded && !document.querySelector(':popover-open, dialog[open], [role="dialog"][aria-modal="true"]:not([data-profile-booking])')) {
        event.preventDefault(); close();
      }
    }}
    aria-label={`Book an appointment with ${doctor.name}`}>
    <motion.div className={styles.animatedSurface} layout={!reduced} layoutAnchor={{ x: 0, y: 1 }} style={{ originY: 1 }}
      transition={{ layout: { duration: reduced ? 0 : duration.emphasis, ease: ease.out } }}>
    {expanded ? highlightOpening && <BookingFocusGlow /> : <span className={styles.bookingAccent} aria-hidden="true">
      <span className={styles.accentGlow}><span className={styles.accentTrack} /></span>
      <span className={styles.accentStroke}><span className={styles.accentTrack} /></span>
    </span>}
    <div className={styles.surface}>
    {started && bookingDoctor ? <BookingControls doctor={bookingDoctor}
      initialSelection={design20RequestedSelection(bookingDoctor, new URLSearchParams({ mode: bookingRequest?.mode ?? initialMode, hospital: bookingRequest?.hospital ?? doctor.hospital, ...(date ? { date } : {}) }))}
      returnTo={returnTo} bookingRequest={bookingRequest} resume={resume} expanded={expanded} toggle={toggle} close={close} action={action} panelId={id} onAuthChange={setAuthOpen} />
      : <motion.div layout={reduced ? false : "position"} layoutId={`${id}-summary`} className={styles.summary}>
        <div className={styles.doctor}><strong>{doctor.name}</strong><span>Choose a time that works for you</span></div>
        <Price fee={doctor.fee} />
        <div className={styles.actionGroup}>{available ? <button ref={action} type="button" className={styles.primary} onClick={toggle} aria-expanded={false} aria-controls={id}>Book appointment</button>
          : <a href="tel:08067506836" className={styles.primary}>Contact hospital</a>}</div>
      </motion.div>}
    </div>
    </motion.div>
  </motion.aside></>;
}

function Price({ fee }: { fee: string }) {
  const priced = /\d/.test(fee);
  return <div className={styles.price}><strong>{priced ? appointmentPricing(fee).base : "Confirm fee"}</strong>{priced && <span>onwards</span>}</div>;
}

function BookingControls({ doctor, initialSelection, returnTo, bookingRequest, resume, expanded, toggle, close, action, panelId, onAuthChange }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; bookingRequest?: ProfileBookingRequest; resume: boolean;
  expanded: boolean; toggle: () => void; close: () => void; action: RefObject<HTMLButtonElement | null>; panelId: string;
  onAuthChange: (open: boolean) => void;
}) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, preserveEntry: true, resume });
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  useEffect(() => { onAuthChange(signingIn); }, [signingIn, onAuthChange]);
  const { selection } = flow.draft;
  const appliedRequest = useRef<number | null>(null);
  useEffect(() => {
    if (!bookingRequest || !flow.loaded || flow.busy || appliedRequest.current === bookingRequest.id) return;
    const locations = doctor.locations?.length ? doctor.locations : [{ name: doctor.hospital }];
    if (!locations.some(location => location.name === bookingRequest.hospital)) return;
    appliedRequest.current = bookingRequest.id;
    const sameContext = selection.hospital === bookingRequest.hospital && selection.mode === bookingRequest.mode;
    flow.selectTime({ ...selection, hospital: bookingRequest.hospital, mode: bookingRequest.mode, time: sameContext ? selection.time : "" });
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }, [bookingRequest, doctor, flow, selection]);
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  useEffect(() => {
    if (expanded) heading.current?.focus({ preventScroll: true });
  }, [expanded]);
  return <>
    <AnimatePresence initial={false} mode="popLayout">{expanded && <motion.div key="options" id={panelId} className={styles.panel} layout={reduced ? false : "position"}
      initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : duration.base, ease: ease.out, layout: { duration: reduced ? 0 : duration.emphasis, ease: ease.out } }}>
      <header className={styles.header}><div><h2 ref={heading} tabIndex={-1}>Choose your appointment</h2><p>{doctor.name}</p></div>
        <button type="button" className={styles.collapse} onClick={close} aria-label="Minimise appointment options"><ChevronDown size={20} aria-hidden /></button></header>
      <div className={styles.options} data-lenis-prevent>
        {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
        {!flow.loaded ? <p className={styles.notice} role="status">Finding available times…</p>
          : <AppointmentSelector showHospitalDirections doctor={doctor} selection={selection} now={flow.now} onChange={flow.selectTime} autoSelectFirst={flow.phase === "slots" && !flow.busy && !flow.expired} />}
      </div>
    </motion.div>}</AnimatePresence>
    <motion.div layout={reduced ? false : "position"} layoutId={`${panelId}-summary`} className={styles.summary}
      transition={{ layout: { duration: reduced ? 0 : duration.emphasis, ease: ease.out } }}>
      {expanded || selection.time ? <div className={styles.selected} aria-live="polite" aria-atomic="true"><span>Your appointment</span><strong>{selection.time ? <>{formatBookingDate(selection.date, "short")} <span aria-hidden>·</span> {selection.time}</> : "Choose an available time"}</strong>{!expanded && <span>{selection.mode === "hospital" ? selection.hospital : "Video consultation"}</span>}</div>
        : <div className={styles.doctor}><strong>{doctor.name}</strong><span>{selection.mode === "hospital" ? "Hospital visit" : "Video consultation"}</span></div>}
      <Price fee={selectedDoctor?.fee ?? doctor.fee} />
      <div className={styles.actionGroup}><button ref={action} type="button" className={styles.primary} aria-expanded={expanded} aria-controls={panelId}
        disabled={expanded && (!flow.loaded || !selection.time || flow.busy || flow.expired)}
        onClick={expanded ? flow.continueBooking : toggle}><span>{expanded ? flow.busy ? "Continuing…" : "Continue" : "Book appointment"}</span>{expanded && <ArrowRight className={styles.continueArrow} aria-hidden />}</button></div>
    </motion.div>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}
