"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import ConsultationToggle from "@/components/booking/ConsultationToggle/ConsultationToggle";
import { appointmentDates, DESIGN16_BOOKING_DAYS, indiaDate } from "../appointmentTime";
import { getDesign3BookingSlots } from "../design3Availability";
import { formatBookingDate } from "../format";
import type { BookingDoctorSummary, ConsultationType } from "../types";
import type { AppointmentSelection } from "../design7/model";
import styles from "./Booking.module.css";

export default function AppointmentPicker({ doctor, selection, now, onSelect, children }: {
  doctor: BookingDoctorSummary; selection: AppointmentSelection; now: number; children?: ReactNode; onSelect: (selection: AppointmentSelection) => void;
}) {
  const draft = selection;
  const dates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
  const locations = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const slotsFor = (date: string, mode = draft.mode, hospital = draft.hospital) => getDesign3BookingSlots(doctor.id, date, mode, hospital, new Date(now), DESIGN16_BOOKING_DAYS);
  const availableModes = (["hospital", "video"] as const).filter(mode => dates.some(date => slotsFor(date, mode).some(slot => slot.available)));
  const setContext = (mode: ConsultationType, hospital: string) => {
    if (mode === draft.mode && hospital === draft.hospital) return;
    const date = dates.find(day => slotsFor(day, mode, hospital).some(slot => slot.available)) ?? dates[0];
    onSelect({ ...draft, mode, hospital, date, time: "" });
  };
  const slots = slotsFor(draft.date).filter(slot => slot.available);
  return <section className={styles.selectionFields} aria-label="Appointment selection">
    <div className={styles.consultationControl}><ConsultationToggle value={draft.mode} onChange={mode => setContext(mode, draft.hospital)} availableModes={availableModes} /></div>
    {children}
    {draft.mode === "hospital" && <label className={styles.field}>Hospital<span className={styles.selectControl}><select value={draft.hospital} onChange={event => setContext(draft.mode, event.target.value)}>{locations.map(location => <option key={location.name} value={location.name}>{location.name}</option>)}</select><ChevronDown size={16} aria-hidden /></span></label>}
    <fieldset className={styles.fieldset}><legend>Choose a date</legend><div className={styles.dates} data-lenis-prevent-horizontal>{dates.map(date => {
      const available = slotsFor(date).some(slot => slot.available);
      const value = new Date(`${date}T12:00:00Z`);
      return <button key={date} type="button" disabled={!available} aria-pressed={draft.date === date} aria-current={date === indiaDate(now) ? "date" : undefined}
        aria-label={`${formatBookingDate(date)}${available ? "" : ", no available times"}`} onClick={() => { if (date !== draft.date) onSelect({ ...draft, date, time: "" }); }}>
        <span>{value.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span><strong>{value.getUTCDate()}</strong><span>{value.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" })}</span>
      </button>;
    })}</div></fieldset>
    <fieldset className={styles.fieldset}><legend>Available times <span>IST</span></legend>{slots.length ? <div className={styles.periods}>{(["morning", "afternoon", "evening"] as const).map(period => {
      const available = slots.filter(slot => slot.period === period);
      return available.length ? <div key={period}><p>{period}</p><div className={styles.times}>{available.map(slot => <button type="button" key={slot.time} aria-pressed={draft.time === slot.time}
        aria-label={`Choose ${slot.time} on ${formatBookingDate(draft.date)}`} onClick={() => onSelect({ ...draft, time: slot.time })}>{slot.time}</button>)}</div></div> : null;
    })}</div> : <p className={styles.muted}>No times are available. Try another day or consultation type.</p>}</fieldset>
  </section>;
}
