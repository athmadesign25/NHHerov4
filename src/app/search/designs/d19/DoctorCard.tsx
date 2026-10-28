"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Check, Plus, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getDesign3BookingDoctor } from "@/features/booking/doctors";
import { appointmentDates, DESIGN16_BOOKING_DAYS, indiaDate } from "@/features/booking/appointmentTime";
import { getDesign3BookingSlots } from "@/features/booking/design3Availability";
import { formatBookingDate } from "@/features/booking/format";
import type { BookingDoctorSummary } from "@/features/booking/types";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { design17RequestedSelection } from "@/features/booking/design17/model";
import { appointmentPricing } from "@/features/booking/design17/pricing";
import { design17PatientAvatar } from "@/features/booking/design17/patients";
import MemberAvatar from "@/features/booking/design17/MemberAvatar";
import NewPatient from "@/features/booking/design15/NewPatient";
import LoginModal from "@/features/auth/LoginModal";
import useDesign19Booking from "@/features/booking/design19/useDesign19Booking";
import { getDesign17ProfileDoctor } from "@/features/search/design17Profile";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import Design17DoctorCard from "../d17/DoctorCard";
import HospitalPicker from "./HospitalPicker";
import useMouseDragScroll from "./useMouseDragScroll";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./DoctorCard.module.css";

type Props = Omit<ComponentProps<typeof Design17DoctorCard>, "cardDesign"> & {
  cardDesign?: "d17" | "d17-lite" | "d18" | "d19";
  active?: boolean;
  onClose?: () => void;
  initialSelection?: AppointmentSelection;
  resume?: boolean;
};
type BookingFlow = ReturnType<typeof useDesign19Booking>;

/** The browsing card defines the responsive footprint for every booking state. */
export default function DoctorCard({ active, onClose, initialSelection, resume, ...props }: Props) {
  const bookingDoctor = active ? getDesign3BookingDoctor(props.doctor.id) : null;
  const query = new URLSearchParams({ mode: props.mode, hospital: props.doctor.hospital });
  if (props.bookingDate) query.set("date", props.bookingDate);
  const booking = Boolean(active && bookingDoctor);
  return <div className={styles.frame}>
    {/* Retain natural sizing across resizing, deep links and browser Back.
        The concealed baseline is neither interactive nor exposed to AT. */}
    <div className={styles.baseline} data-concealed={booking || undefined} aria-hidden={booking || undefined} inert={booking}>
      <Design17DoctorCard {...props} cardDesign={booking ? "d17-lite" : "d19"} />
    </div>
    {bookingDoctor && <BookingCard doctor={{ ...bookingDoctor, name: presentationDoctorName(bookingDoctor.name) }}
    initialSelection={initialSelection ?? design17RequestedSelection(bookingDoctor, query)}
    returnTo={props.listingReturnTo ?? "/search/doctors?design=d19"} onClose={onClose ?? (() => undefined)} resume={resume} />}
  </div>;
}

function BookingCard({ doctor, initialSelection, returnTo, onClose, resume }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; onClose: () => void; resume?: boolean;
}) {
  const flow = useDesign19Booking(doctor, { initialSelection, returnTo, inline: true, resume });
  const reduced = useReducedMotion();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const previousPhase = useRef(flow.phase);
  const [failedImage, setFailedImage] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const { draft } = flow;
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  const choosingMember = flow.phase === "member" && flow.isUserLoggedIn;
  const selectedPatient = draft.patients.find(entry => entry.id === draft.selectedPatientId);
  const selectedDoctor = getDesign17ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(selectedDoctor?.fee ?? doctor.fee, draft.discountCode);
  const state = choosingMember ? "member" : "slots";
  useEffect(() => {
    const panel = footer.current;
    const card = panel?.closest<HTMLElement>("article");
    if (!panel || !card) return;
    const measure = () => card.style.setProperty("--summary-height", `${panel.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (choosingMember) document.getElementById(`${id}-members`)?.focus({ preventScroll: true });
  }, [choosingMember, id]);
  useEffect(() => {
    const changed = previousPhase.current !== flow.phase;
    previousPhase.current = flow.phase;
    if (!changed || flow.phase !== "slots") return;
    const frame = requestAnimationFrame(() => {
      const target = content.current?.querySelector<HTMLButtonElement>('[data-d19-times] button[aria-pressed="true"]')
        ?? content.current?.querySelector<HTMLElement>('[data-d19-times] button, select, button:not(:disabled)');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [flow.phase]);

  return <><motion.article className={styles.card} data-doctor-card data-d19-booking-card={doctor.id} aria-labelledby={`${id}-doctor`}
    layoutId={reduced ? undefined : `d19-card-${doctor.id}`} transition={{ duration: .32, ease: [.22, 1, .36, 1] }}>
    <header className={styles.header}>
      <motion.div className={styles.portrait} layoutId={reduced ? undefined : `d19-portrait-${doctor.id}`}>
        {doctor.img && !failedImage ? <Image src={doctor.img} alt="" fill sizes="(max-width: 639px) 100vw, 492px" className={styles.photo} onError={() => setFailedImage(true)} /> : <UserRound size={48} aria-hidden />}
      </motion.div>
      <span className={styles.headerScrim} aria-hidden />
      <button type="button" className={styles.back} onClick={onClose} aria-label="Back to details" title="Back to details"><ArrowLeft size={18} aria-hidden /></button>
      <div className={styles.identity}>
        <motion.h2 id={`${id}-doctor`} ref={heading} tabIndex={-1} layoutId={reduced ? undefined : `d19-name-${doctor.id}`}>{doctor.name}</motion.h2>
        <motion.p layoutId={reduced ? undefined : `d19-speciality-${doctor.id}`}>{doctor.speciality}</motion.p>
      </div>
    </header>
    <motion.div key={`${state}-${addingMember}`} ref={content} className={styles.content} data-lenis-prevent initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .16 }}>
      {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
      {!flow.loaded ? <p className={styles.hint} role="status">Finding available times…</p>
        : choosingMember && draft.identity ? <div className={styles.members}>
          {addingMember ? <div className={styles.newMember}><NewPatient identity={draft.identity} onSave={patient => { flow.addPatient(patient); setAddingMember(false); }} onCancel={() => setAddingMember(false)} /></div>
            : <>
              <div className={styles.sectionHeading}><h3 id={`${id}-members`} tabIndex={-1}>Select member</h3><button type="button" onClick={flow.cancelSignIn}>Edit slot</button></div>
              <div className={styles.memberList} role="group" aria-labelledby={`${id}-members`}>
                {draft.patients.map(entry => <button key={entry.id} type="button" className={styles.member} aria-pressed={draft.selectedPatientId === entry.id} onClick={() => flow.selectPatient(entry.id)}>
                  <MemberAvatar src={design17PatientAvatar(entry)} className={styles.memberAvatar} />
                  <span><strong>{entry.patient.name}</strong><small>{entry.patient.relation === "self" ? "You" : entry.patient.relation} · {entry.patient.age} yrs</small></span>
                  <span className={styles.memberCheck} aria-hidden>{draft.selectedPatientId === entry.id && <Check size={12} strokeWidth={3} />}</span>
                </button>)}
              </div>
              {draft.patients.length < 10 && <button type="button" className={styles.addMember} onClick={() => setAddingMember(true)}><span className={styles.addMemberAvatar} aria-hidden><Plus size={18} /></span>Add new member</button>}
            </>}
        </div> : <SlotPicker doctor={doctor} flow={flow} />}
    </motion.div>
    <footer ref={footer} className={styles.footer}>
      <div className={styles.reassurance}>
        <div className={styles.slotSummary} aria-live="polite" aria-atomic="true"><div><span>Your appointment</span><strong>{draft.selection.time ? <><span>{formatBookingDate(draft.selection.date, "short")}</span>{" "}<span>{draft.selection.time}</span></> : "Choose a time to continue"}</strong></div></div>
        <div className={styles.price}><span>Consultation fee</span><strong>{pricing.total}</strong></div>
      </div>
      {!addingMember && <button type="button" className={styles.continue}
        disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired || (choosingMember && !selectedPatient)}
        onClick={() => { if (choosingMember) void flow.reviewAppointment(); else flow.continueBooking(); }}>
        {flow.busy ? "Continuing…" : choosingMember ? "Continue to pay" : "Select member"}<ArrowRight size={17} aria-hidden />
      </button>}
    </footer>
  </motion.article>
    <LoginModal isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}

function SlotPicker({ doctor, flow }: { doctor: BookingDoctorSummary; flow: BookingFlow }) {
  const { selection } = flow.draft;
  const dates = appointmentDates(flow.now, DESIGN16_BOOKING_DAYS);
  const locations = doctor.locations?.length ? doctor.locations : [{ name: doctor.hospital, city: doctor.city }];
  const availableSlots = (date: string, mode = selection.mode, hospital = selection.hospital) => getDesign3BookingSlots(doctor.id, date, mode, hospital, new Date(flow.now), DESIGN16_BOOKING_DAYS).filter(slot => slot.available);
  const slots = availableSlots(selection.date);
  const months = [...new Set(dates.map(date => date.slice(0, 7)))].map(month => ({
    key: month,
    label: new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
    dates: dates.filter(date => date.startsWith(month)),
  }));
  const [timeEdges, setTimeEdges] = useState({ start: false, end: false });
  const [dateEdges, setDateEdges] = useState({ start: false, end: false });
  const [activeMonth, setActiveMonth] = useState(months[0]?.label ?? "");
  const dateStrip = useRef<HTMLDivElement>(null);
  const times = useRef<HTMLDivElement>(null);
  useMouseDragScroll(dateStrip);
  useMouseDragScroll(times, slots.length);
  const reduced = useReducedMotion();
  const id = useId();
  const updateDateEdges = () => {
    const strip = dateStrip.current;
    if (!strip) return;
    setDateEdges({ start: strip.scrollLeft > 1, end: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 });
    const anchor = strip.getBoundingClientRect().left + parseFloat(getComputedStyle(strip).paddingLeft);
    let label = months[0]?.label ?? "";
    strip.querySelectorAll<HTMLElement>("[data-month-pill]").forEach(pill => {
      if (pill.getBoundingClientRect().left <= anchor + 1) label = pill.dataset.monthLabel ?? label;
    });
    setActiveMonth(label);
  };
  const updateTimeEdges = () => {
    const strip = times.current;
    if (strip) setTimeEdges({ start: strip.scrollLeft > 1, end: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 });
  };
  useEffect(() => {
    const strip = times.current;
    if (!strip) return;
    strip.scrollLeft = 0;
    const selected = strip.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (selected) strip.scrollLeft = Math.max(0, selected.offsetLeft - strip.clientWidth / 2 + selected.offsetWidth / 2);
    updateTimeEdges();
    const observer = new ResizeObserver(updateTimeEdges);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [selection.date, selection.mode, selection.hospital, slots.length]);
  useEffect(() => {
    const strip = dateStrip.current;
    const selected = strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (strip && selected) {
      const bounds = strip.getBoundingClientRect();
      const item = selected.getBoundingClientRect();
      const monthWidth = (selected.parentElement?.firstElementChild?.getBoundingClientRect().width ?? 0) + parseFloat(getComputedStyle(strip).paddingLeft);
      if (item.left < bounds.left + monthWidth || item.right > bounds.right) strip.scrollLeft += item.left - bounds.left - strip.clientWidth / 2 + item.width / 2;
    }
    updateDateEdges();
    if (!strip) return;
    const observer = new ResizeObserver(updateDateEdges);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [selection.date]);
  const scrollStrip = (kind: "dates" | "times", direction: number) => {
    const strip = kind === "dates" ? dateStrip.current : times.current;
    strip?.scrollBy({ left: direction * strip.clientWidth * .75, behavior: reduced ? "instant" : "smooth" });
  };
  const scrollControls = (kind: "dates" | "times", edges: { start: boolean; end: boolean }) => <div className={styles.scrollControls}>
    <button type="button" disabled={!edges.start} aria-label={`Earlier ${kind}`} aria-controls={`${id}-${kind}`} onClick={() => scrollStrip(kind, -1)}><ChevronLeft size={18} strokeWidth={2} aria-hidden /></button>
    <button type="button" disabled={!edges.end} aria-label={`More ${kind}`} aria-controls={`${id}-${kind}`} onClick={() => scrollStrip(kind, 1)}><ChevronRight size={18} strokeWidth={2} aria-hidden /></button>
  </div>;
  const setContext = (mode: AppointmentSelection["mode"], hospital: string) => {
    if (mode === selection.mode && hospital === selection.hospital) return;
    const date = dates.find(day => availableSlots(day, mode, hospital).length) ?? dates[0];
    flow.selectTime({ ...selection, mode, hospital, date, time: "" });
  };
  return <div className={styles.picker}>
    {selection.mode === "hospital" && <section className={styles.fieldset} aria-labelledby={`${id}-hospital-title`}><h3 className={styles.fieldTitle} id={`${id}-hospital-title`}>Hospital</h3>
      <HospitalPicker doctorName={doctor.name} locations={locations} value={selection.hospital} onChange={hospital => setContext(selection.mode, hospital)} />
    </section>}
    <section className={styles.fieldset} aria-labelledby={`${id}-date-title`}><div className={styles.timeHeading}><h3 id={`${id}-date-title`}>Select date</h3></div><div className={styles.scrollRow} data-date-row data-fade-start={dateEdges.start} data-lenis-prevent-horizontal><div className={styles.dates} id={`${id}-dates`} ref={dateStrip} onScroll={updateDateEdges} data-fade-start={dateEdges.start} data-fade-end={dateEdges.end} data-lenis-prevent-horizontal>{months.map(month => <div key={month.key} className={styles.monthGroup}>
      <span className={styles.monthPill} data-month-pill data-month-label={month.label} aria-hidden><span>{month.label}</span></span>{month.dates.map(date => {
      const available = availableSlots(date).length > 0;
      const value = new Date(`${date}T12:00:00Z`);
      return <button key={date} type="button" disabled={!available} aria-pressed={selection.date === date} aria-current={date === indiaDate(flow.now) ? "date" : undefined}
        aria-label={`${formatBookingDate(date)}${available ? "" : ", no available times"}`} onClick={() => { if (date !== selection.date) flow.selectTime({ ...selection, date, time: "" }); }}>
        <span>{value.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span><strong>{value.getUTCDate()}</strong>
      </button>;
    })}</div>)}</div><span className={styles.stickyMonth} aria-hidden><span>{activeMonth}</span></span>{scrollControls("dates", dateEdges)}</div></section>
    <section className={styles.fieldset} aria-labelledby={`${id}-time-title`}>
      <div className={styles.timeHeading}><h3 id={`${id}-time-title`}>Select time</h3></div>
      {slots.length ? <div className={styles.scrollRow} data-lenis-prevent-horizontal><div className={styles.times} ref={times} id={`${id}-times`} data-d19-times data-rows={slots.length > 4 ? 2 : 1} data-fade-start={timeEdges.start} data-fade-end={timeEdges.end} onScroll={updateTimeEdges} data-lenis-prevent-horizontal role="group" aria-labelledby={`${id}-time-title`}>{slots.map(slot => <button key={slot.time} className={chip.chip} type="button" aria-pressed={selection.time === slot.time} aria-label={`Choose ${slot.time} on ${formatBookingDate(selection.date)}`} onClick={() => flow.selectTime({ ...selection, time: slot.time })}>{slot.time}</button>)}</div>{scrollControls("times", timeEdges)}</div>
        : <p className={styles.hint}>No times available. Choose another date.</p>}
    </section>
  </div>;
}
