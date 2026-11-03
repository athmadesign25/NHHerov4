"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { appointmentDates, DESIGN16_BOOKING_DAYS, indiaDate } from "@/features/booking/appointmentTime";
import { getDesign3BookingSlots } from "@/features/booking/design3Availability";
import { formatBookingDate } from "@/features/booking/format";
import type { BookingDoctorSummary } from "@/features/booking/types";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { DoctorConsultationToggle } from "../../doctors/DoctorListingControls";
import HospitalPicker from "./HospitalPicker";
import useMouseDragScroll from "./useMouseDragScroll";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./DoctorCard.module.css";
import { cardLayoutTransition } from "./cardMotion";

export default function AppointmentSelector({ doctor, selection, now, onChange, autoSelectFirst = false }: {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  now: number;
  autoSelectFirst?: boolean;
  onChange: (selection: AppointmentSelection) => void;
}) {
  const dates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
  const locations = doctor.locations?.length ? doctor.locations : [{ name: doctor.hospital, city: doctor.city }];
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  const availableModes = (["hospital", "video"] as const).filter(mode => profile?.modes[mode] === true);
  const availableSlots = (date: string, mode = selection.mode, hospital = selection.hospital) => getDesign3BookingSlots(doctor.id, date, mode, hospital, new Date(now), DESIGN16_BOOKING_DAYS, "d20").filter(slot => slot.available);
  const slots = availableSlots(selection.date);
  const firstAvailableTime = slots[0]?.time;
  useEffect(() => {
    // Default only an empty selection; never overwrite a visitor's chosen time.
    if (autoSelectFirst && !selection.time && firstAvailableTime) {
      onChange({ ...selection, time: firstAvailableTime });
    }
  }, [autoSelectFirst, firstAvailableTime, selection, onChange]);
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
    onChange({ ...selection, mode, hospital, time: "" });
  };
  return <div className={styles.picker}>
    {availableModes.length > 1 && <div className={styles.consultationControl}><DoctorConsultationToggle mode={selection.mode} availableModes={availableModes} iconVariant="availability" onModeChange={mode => setContext(mode, selection.hospital)} /></div>}
    <AnimatePresence initial={false} mode="popLayout">{selection.mode === "hospital" && <motion.section key="hospital" className={styles.fieldset} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .16 }} aria-labelledby={`${id}-hospital-title`}><h3 className={styles.fieldTitle} id={`${id}-hospital-title`}>Hospital</h3>
      <HospitalPicker doctorName={doctor.name} locations={locations} value={selection.hospital} onChange={hospital => setContext(selection.mode, hospital)} />
    </motion.section>}</AnimatePresence>
    <motion.section layout={reduced ? false : "position"} transition={{ layout: cardLayoutTransition }} className={styles.fieldset} aria-labelledby={`${id}-date-title`}><div className={styles.timeHeading}><h3 id={`${id}-date-title`}>Select date</h3></div><div className={styles.scrollRow} data-date-row data-fade-start={dateEdges.start} data-lenis-prevent-horizontal><div className={styles.dates} id={`${id}-dates`} ref={dateStrip} onScroll={updateDateEdges} data-fade-start={dateEdges.start} data-fade-end={dateEdges.end} data-lenis-prevent-horizontal>{months.map(month => <div key={month.key} className={styles.monthGroup}>
      <span className={styles.monthPill} data-month-pill data-month-label={month.label} aria-hidden><span>{month.label}</span></span>{month.dates.map(date => {
      const available = availableSlots(date).length > 0;
      const value = new Date(`${date}T12:00:00Z`);
      return <button key={date} type="button" disabled={!available} aria-pressed={selection.date === date} aria-current={date === indiaDate(now) ? "date" : undefined}
        aria-label={`${formatBookingDate(date)}${available ? "" : ", no available times"}`} onClick={() => { if (date !== selection.date) onChange({ ...selection, date, time: "" }); }}>
        <span>{value.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span><strong>{value.getUTCDate()}</strong>
      </button>;
    })}</div>)}</div><span className={styles.stickyMonth} aria-hidden><span>{activeMonth}</span></span>{scrollControls("dates", dateEdges)}</div></motion.section>
    <motion.section layout={reduced ? false : "position"} transition={{ layout: cardLayoutTransition }} className={styles.fieldset} aria-labelledby={`${id}-time-title`}>
      <div className={styles.timeHeading}><h3 id={`${id}-time-title`}>Select time</h3></div>
      {slots.length ? <div className={styles.scrollRow} data-lenis-prevent-horizontal><div className={styles.times} ref={times} id={`${id}-times`} data-d20-times data-rows={slots.length > 4 ? 2 : 1} data-fade-start={timeEdges.start} data-fade-end={timeEdges.end} onScroll={updateTimeEdges} data-lenis-prevent-horizontal role="group" aria-labelledby={`${id}-time-title`}>{slots.map(slot => <button key={slot.time} className={chip.chip} type="button" aria-pressed={selection.time === slot.time} aria-label={`Choose ${slot.time} on ${formatBookingDate(selection.date)}`} onClick={() => onChange({ ...selection, time: slot.time })}>{slot.time}</button>)}</div>{scrollControls("times", timeEdges)}</div>
        : <p className={styles.hint}>No times available. Choose another date.</p>}
    </motion.section>
  </div>;
}
