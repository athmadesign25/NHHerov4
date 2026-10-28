"use client";

import { CalendarDays, Building2, Video, ArrowRight, Sun, Sunset, Moon } from "lucide-react";
import { getDesign3BookingSlots } from "../design3Availability";
import type { BookingDoctorSummary, ConsultationType } from "../types";
import { formatBookingDate } from "../format";
import type { AppointmentSelection } from "./model";
import { appointmentDates } from "../appointmentTime";
import styles from "./Booking.module.css";

export { appointmentDates } from "../appointmentTime";

interface Props {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  now: number;
  onChange: (selection: AppointmentSelection) => void;
  onContinue: () => void;
}

export default function AppointmentStep({ doctor, selection, now, onChange, onContinue }: Props) {
  const dates = appointmentDates(now);
  const hospitals = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const slots = getDesign3BookingSlots(doctor.id, selection.date, selection.mode, selection.hospital, new Date(now));
  const availableModes = (["hospital", "video"] as const).filter(mode =>
    dates.some(date => getDesign3BookingSlots(doctor.id, date, mode, selection.hospital, new Date(now)).some(slot => slot.available)));
  const changeMode = (mode: ConsultationType) => {
    const date = dates.find(day => getDesign3BookingSlots(doctor.id, day, mode, selection.hospital, new Date(now)).some(slot => slot.available)) ?? dates[0];
    onChange({ ...selection, mode, date, time: "" });
  };
  const canContinue = slots.some(slot => slot.available && slot.time === selection.time);

  return <section className={styles.panel} aria-labelledby="d7-appointment-heading">
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>YOUR VISIT</span><h2 id="d7-appointment-heading">A time that works for you.</h2><p>Choose how you&apos;d like to connect with {doctor.name.replace(/^Dr\.\s*/, "Dr. ")}.</p></div>
    <fieldset className={styles.fieldset}><legend>Consultation type</legend><div className={styles.modeGrid}>
      {(["hospital", "video"] as const).map(mode => {
        const Icon = mode === "hospital" ? Building2 : Video;
        const enabled = availableModes.includes(mode);
        return <button key={mode} type="button" className={styles.modeOption} aria-pressed={selection.mode === mode} disabled={!enabled}
          onClick={() => changeMode(mode)}><Icon size={21} aria-hidden /><span><strong>{mode === "hospital" ? "Hospital visit" : "Video consultation"}</strong><small>{enabled ? mode === "hospital" ? "Meet your doctor in person" : "Connect from wherever you are" : "Not offered in this preview"}</small></span></button>;
      })}
    </div></fieldset>
    {selection.mode === "hospital" && <div className={styles.field}><label htmlFor="d7-hospital">Hospital</label>
      <select id="d7-hospital" value={selection.hospital} onChange={event => onChange({ ...selection, hospital: event.target.value, time: "" })}>
        {hospitals.map(hospital => <option key={hospital.name} value={hospital.name}>{hospital.name}</option>)}
      </select><span className={styles.fieldHint}>Only this doctor&apos;s listed practice locations are shown.</span></div>}
    <fieldset className={styles.fieldset}><legend><CalendarDays size={17} aria-hidden />Choose a day</legend>
      <div className={styles.dateRail} aria-label="Appointment dates">
        {dates.map(date => {
          const value = new Date(`${date}T12:00:00`);
          const available = getDesign3BookingSlots(doctor.id, date, selection.mode, selection.hospital, new Date(now)).some(slot => slot.available);
          return <button type="button" key={date} className={styles.dateOption} aria-pressed={selection.date === date} disabled={!available}
            aria-label={`${formatBookingDate(date)}${available ? "" : ", no available times"}`} onClick={() => onChange({ ...selection, date, time: "" })}>
            <span>{new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(value)}</span><strong>{value.getDate()}</strong><span>{new Intl.DateTimeFormat("en-IN", { month: "short" }).format(value)}</span>
          </button>;
        })}
      </div>
    </fieldset>
    <fieldset className={styles.fieldset}><legend>Available times <span className={styles.legendNote}>India time (IST) · preview availability</span></legend>
      {slots.some(slot => slot.available) ? <div className={styles.periods}>{(["morning", "afternoon", "evening"] as const).map(period => {
        const periodSlots = slots.filter(slot => slot.period === period);
        if (!periodSlots.some(slot => slot.available)) return null;
        const Icon = period === "morning" ? Sun : period === "afternoon" ? Sunset : Moon;
        return <div key={period}><div className={styles.periodLabel}><Icon size={15} aria-hidden />{period}</div><div className={styles.slotGrid}>
          {periodSlots.map(slot => <button key={slot.time} type="button" disabled={!slot.available} aria-pressed={selection.time === slot.time} className={styles.slot}
            onClick={() => onChange({ ...selection, time: slot.time })}>{slot.time}</button>)}
        </div></div>;
      })}</div> : <p className={styles.notice}>There are no available times for this day. Choose another date or consultation type.</p>}
    </fieldset>
    <div className={styles.actions}><p className={styles.smallNote}>You&apos;ll review every detail before confirming.</p>
      <button type="button" className={styles.primary} disabled={!canContinue} onClick={onContinue}>Continue to patient details <ArrowRight size={18} aria-hidden /></button>
    </div>
  </section>;
}
