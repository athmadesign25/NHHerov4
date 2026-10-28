"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, PhoneCall, Video } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection } from "../design7/model";
import { formatBookingDate } from "../format";
import { getDesign17ProfileDoctor } from "@/features/search/design17Profile";
import AppointmentPicker from "../design17/AppointmentPicker";
import PatientSelection from "../design17/PatientSelection";
import { appointmentPricing } from "../design17/pricing";
import InlineSignIn from "./InlineSignIn";
import useDesign18Booking from "./useDesign18Booking";
import booking from "../design17/Booking.module.css";
import styles from "./BookingWorkspace.module.css";

export type Booking18Flow = ReturnType<typeof useDesign18Booking>;

export default function BookingWorkspace({ doctor, initialSelection, returnTo, onClose }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; onClose: () => void;
}) {
  const flow = useDesign18Booking(doctor, { initialSelection, returnTo, inline: true });
  return <AppointmentWorkspace doctor={doctor} flow={flow} onClose={onClose} />;
}

export function AppointmentWorkspace({ doctor, flow, onClose }: { doctor: BookingDoctorSummary; flow: Booking18Flow; onClose: () => void }) {
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const { draft } = flow;
  const activeDoctor = getDesign17ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(activeDoctor?.fee ?? doctor.fee, draft.discountCode);
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (flow.phase === "member") content.current?.querySelector<HTMLElement>("#d17-patient-title")?.focus({ preventScroll: true });
  }, [flow.phase]);
  useEffect(() => {
    if (!signingIn) return;
    const frame = requestAnimationFrame(() => {
      const workspace = content.current?.closest<HTMLElement>("[data-booking-workspace]");
      const target = window.matchMedia("(min-width: 768px)").matches ? workspace : content.current;
      if (!target || !workspace) return;
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - parseFloat(getComputedStyle(workspace).scrollMarginTop));
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) lenis.scrollTo(top, { immediate: true });
      else window.scrollTo({ top, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [signingIn]);

  return <div className={`${booking.page} ${styles.workspace}`} data-design17-booking="d18" data-booking-workspace>
    <header className={styles.workspaceHeader}>
      <button type="button" className={styles.back} onClick={onClose}><ArrowLeft size={17} aria-hidden />Back to doctors</button>
      <h1 ref={heading} tabIndex={-1}>Choose your appointment</h1>
    </header>
    <motion.section className={styles.surface} aria-label={`Book an appointment with ${doctor.name}`}
      initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24 }}>
      <div className={styles.portrait}>
        <Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt={doctor.name} fill priority sizes="(min-width: 1024px) 380px, (min-width: 768px) 35vw, 100vw" className={styles.photo} />
        <div className={styles.scrim} aria-hidden />
        <div className={styles.doctorContext}>
          <h2>{doctor.name}</h2><p>{doctor.speciality}</p>
          <p className={styles.experience}>{doctor.experienceYears}</p>
          <div className={styles.visit}>
            <p>{draft.selection.mode === "hospital" ? <MapPin size={18} aria-hidden /> : <Video size={18} aria-hidden />}<span>{draft.selection.mode === "hospital" ? draft.selection.hospital : "Video consultation"}</span></p>
            <div className={styles.selectedSlot} aria-live="polite" aria-atomic="true"><CalendarDays size={18} aria-hidden /><div><span>{draft.selection.time ? "Selected slot" : "Choose your time"}</span><strong>{formatBookingDate(draft.selection.date, "short")}</strong>{draft.selection.time && <strong>{draft.selection.time} <small>IST</small></strong>}</div></div>
          </div>
          <a href="tel:18602080208" className={styles.help}><PhoneCall size={16} aria-hidden />Call NH for help</a>
        </div>
      </div>
      <div className={styles.controls} ref={content}>
        {flow.notice && <p className={booking.notice} role="status">{flow.notice}</p>}
        {!flow.loaded ? <p role="status" className={booking.muted}>Preparing available appointments…</p>
          : signingIn ? <InlineSignIn onSuccess={flow.onSignedIn} onBack={flow.cancelSignIn} />
          : <AppointmentPicker doctor={doctor} selection={draft.selection} now={flow.now} onSelect={flow.selectTime}>
            {flow.isUserLoggedIn && draft.identity && <PatientSelection identity={draft.identity} patients={draft.patients} selectedId={draft.selectedPatientId} onSelect={flow.selectPatient} onAdd={flow.addPatient} />}
          </AppointmentPicker>}
      </div>
      <footer className={styles.actionBar}>
        <div className={styles.price}><span>Consultation fee</span><strong>{pricing.total}</strong></div>
        {draft.selection.time && <div className={styles.mobileSlot} aria-live="polite"><span>Selected slot</span><strong>{formatBookingDate(draft.selection.date, "short")} · {draft.selection.time}</strong></div>}
        {!signingIn && <div className={styles.continue}>
          <p>{!draft.selection.time ? "Choose an available time to continue." : flow.isUserLoggedIn && !patient ? "Select who this appointment is for." : !flow.isUserLoggedIn ? "Sign in to choose a member and complete your booking." : `Booking for ${patient?.name}`}</p>
          <button type="button" className={booking.primary} disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired || (flow.isUserLoggedIn && !patient)} onClick={() => { if (flow.isUserLoggedIn) void flow.reviewAppointment(); else flow.continueBooking(); }}>
            {flow.isUserLoggedIn ? "Continue to pay" : "Sign in to continue"}<ArrowRight size={18} aria-hidden />
          </button>
        </div>}
        {signingIn && <p className={styles.authReassurance}>Your appointment selection stays here while you sign in.</p>}
      </footer>
    </motion.section>
  </div>;
}
