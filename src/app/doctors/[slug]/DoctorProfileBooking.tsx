"use client";

import { getAppointmentFee } from "@/features/booking/executiveSlots";
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import AppointmentBookingPanel from "@/features/booking/components/AppointmentBookingPanel";
import LoginModal from "@/features/auth/LoginModal";
import useDesign20Booking from "@/features/booking/design20/useDesign20Booking";
import { design20RequestedSelection } from "@/features/booking/design20/model";
import { appointmentPricing } from "@/features/booking/design17/pricing";
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
  const editAction = useRef<HTMLButtonElement>(null);
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
  const open = useCallback(() => {
    setStarted(true);
    setHighlightOpening(true);
    setExpanded(true);
  }, []);
  const close = () => {
    setHighlightOpening(false);
    setExpanded(false);
    requestAnimationFrame(() => (editAction.current ?? action.current)?.focus({ preventScroll: true }));
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
      returnTo={returnTo} bookingRequest={bookingRequest} resume={resume} expanded={expanded} open={open} close={close} action={action} editAction={editAction} panelId={id} onAuthChange={setAuthOpen} />
      : <motion.div layout={reduced ? false : "position"} layoutId={`${id}-summary`} className={styles.summary} data-appointment-summary>
        <div className={styles.doctor}><strong>{doctor.name}</strong><span>Choose a time that works for you</span></div>
        <Price fee={doctor.fee} />
        <div className={styles.actionGroup}>{available && <CallAction />}{available ? <button ref={action} type="button" className={styles.primary} onClick={open} aria-expanded={false} aria-controls={id}>Book appointment</button>
          : <a href="tel:08067506836" className={styles.primary}>Contact hospital</a>}</div>
      </motion.div>}
    </div>
    </motion.div>
  </motion.aside></>;
}

function CallAction() {
  return <a className={styles.callAction} href="tel:08067506836" aria-label="Call 08067506836 to book an appointment" title="Call to book an appointment"><Phone aria-hidden /></a>;
}

function Price({ fee }: { fee: string }) {
  const priced = /\d/.test(fee);
  return <div className={styles.price}><strong>{priced ? appointmentPricing(fee).base : "Confirm fee"}</strong>{priced && <span>onwards</span>}</div>;
}

function BookingControls({ doctor, initialSelection, returnTo, bookingRequest, resume, expanded, open, close, action, editAction, panelId, onAuthChange }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; bookingRequest?: ProfileBookingRequest; resume: boolean;
  expanded: boolean; open: () => void; close: () => void; action: RefObject<HTMLButtonElement | null>; editAction: RefObject<HTMLButtonElement | null>; panelId: string;
  onAuthChange: (open: boolean) => void;
}) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, preserveEntry: true, resume });
  const heading = useRef<HTMLHeadingElement>(null);
  const continuationRequested = useRef(false);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  useEffect(() => { onAuthChange(signingIn); }, [signingIn, onAuthChange]);
  const { selection } = flow.draft;
  const continueBooking = () => {
    continuationRequested.current = true;
    flow.continueBooking();
  };
  useEffect(() => {
    // Validation can reject a saved slot, including after signing in. Reveal
    // the existing notice and choices rather than leaving feedback hidden.
    if (!continuationRequested.current || flow.phase !== "slots" || !flow.notice) return;
    continuationRequested.current = false;
    if (!expanded) open();
  }, [expanded, flow.phase, flow.notice, open]);
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
  const selectedFee = getAppointmentFee(selectedDoctor?.fee ?? doctor.fee, selection);
  useEffect(() => {
    if (expanded) heading.current?.focus({ preventScroll: true });
  }, [expanded]);
  return <>
    <AppointmentBookingPanel
      showDoctorImage id={panelId} doctor={doctor} selection={selection} now={flow.now}
      loaded={flow.loaded} notice={flow.notice}
      autoSelectFirst={flow.phase === "slots" && !flow.busy && !flow.expired}
      onChange={flow.selectTime}
      price={/\d/.test(selectedFee) ? appointmentPricing(selectedFee).base : "Confirm fee"}
      showOnwards={/\d/.test(selectedFee)}
      busy={flow.busy} disabled={!flow.loaded || !selection.time || flow.busy || flow.expired}
      onContinue={continueBooking} onClose={close} onOpen={open} expanded={expanded}
      headingRef={heading} actionRef={action} editActionRef={editAction}
      secondaryAction={<CallAction />}
    />
    <LoginModal previewOtp isOpen={signingIn} onClose={() => { continuationRequested.current = false; flow.setLoginOpen(false); }} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}
