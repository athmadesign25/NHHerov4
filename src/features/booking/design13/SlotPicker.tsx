"use client";

import { useState } from "react";
import { Building2, ChevronLeft, Video } from "lucide-react";
import type { BookingDoctorSummary, ConsultationType } from "../types";
import { getDesign3BookingSlots } from "../design3Availability";
import { appointmentDates } from "../appointmentTime";
import { formatBookingDate } from "../format";
import type { AppointmentSelection } from "../design7/model";
import { isDesign15Variant, type QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import styles from "./SlotPicker.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  now: number;
  onSelect: (selection: AppointmentSelection) => void;
  onCancel?: () => void;
  variant?: QuickJourneyDesign;
}

export default function SlotPicker({ doctor, selection, now, onSelect, onCancel, variant = "d13" }: Props) {
  const isDesign15 = isDesign15Variant(variant);
  const [draft, setDraft] = useState(selection);
  const dates = appointmentDates(now);
  const hospitals = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const slots = getDesign3BookingSlots(doctor.id, draft.date, draft.mode, draft.hospital, new Date(now));
  const availableModes = (["hospital", "video"] as const).filter(mode =>
    dates.some(date => getDesign3BookingSlots(doctor.id, date, mode, draft.hospital, new Date(now)).some(slot => slot.available)));
  const updateContext = (mode: ConsultationType, hospital: string) => {
    if (mode === draft.mode && hospital === draft.hospital) return;
    const date = dates.find(day => getDesign3BookingSlots(doctor.id, day, mode, hospital, new Date(now)).some(slot => slot.available)) ?? dates[0];
    setDraft({ ...draft, mode, hospital, date, time: "" });
  };
  return <section className={styles.panel} data-journey-palette={isDesign15 ? undefined : "light"} aria-labelledby="d13-times-heading">
    <header className={styles.heading}><div><h2 id="d13-times-heading">Choose your time</h2><p>{variant === "d14" || isDesign15 ? "Choose an appointment that works for you." : "Select a time to continue to patient details."}</p></div>
      {onCancel && <button type="button" className={styles.back} onClick={onCancel}><ChevronLeft size={16} aria-hidden />Keep my time</button>}</header>
    {availableModes.length > 1 || !availableModes.includes(draft.mode) ? <div className={styles.mode} role="group" aria-label="Consultation type">
      {availableModes.map(mode => <button key={mode} type="button" aria-pressed={draft.mode === mode} onClick={() => updateContext(mode, draft.hospital)}>
        {mode === "hospital" ? <Building2 size={16} aria-hidden /> : <Video size={16} aria-hidden />}{mode === "hospital" ? "In hospital" : "Video"}
      </button>)}
    </div> : <p className={styles.caption}>{draft.mode === "hospital" ? "In-hospital consultation" : "Video consultation"}</p>}
    {draft.mode === "hospital" && hospitals.length > 1 && <label className={styles.hospital}>Hospital
      <select value={draft.hospital} onChange={event => updateContext(draft.mode, event.target.value)}>{hospitals.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</select>
    </label>}
    <fieldset className={styles.fieldset}><legend>Choose a day <span>India time · IST</span></legend>
      <div className={styles.dates} data-lenis-prevent-horizontal>
        {dates.map(date => {
          const value = new Date(`${date}T12:00:00Z`);
          const available = getDesign3BookingSlots(doctor.id, date, draft.mode, draft.hospital, new Date(now)).some(slot => slot.available);
          return <button type="button" key={date} disabled={!available} aria-pressed={draft.date === date} aria-label={`${formatBookingDate(date)}${available ? "" : ", no available times"}`}
            onClick={() => { if (date !== draft.date) setDraft({ ...draft, date, time: "" }); }}>
            <span>{new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(value)}</span>
            <strong>{value.getUTCDate()}</strong><span>{new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(value)}</span>
          </button>;
        })}
      </div>
    </fieldset>
    <fieldset className={styles.fieldset}><legend>Available times</legend>
      {slots.some(slot => slot.available) ? <div className={styles.periods}>{(["morning", "afternoon", "evening"] as const).map(period => {
        const available = slots.filter(slot => slot.period === period && slot.available);
        return available.length ? <div key={period}><p className={styles.period}>{period}</p><div className={styles.times}>
          {available.map(slot => <button key={slot.time} type="button" aria-pressed={draft.time === slot.time}
            aria-label={`Choose ${slot.time} on ${formatBookingDate(draft.date)}`}
            onClick={() => onSelect({ ...draft, time: slot.time })}>{slot.time}</button>)}
        </div></div> : null;
      })}</div> : <p className={styles.empty}>No times are available for this selection. Try another day or consultation type.</p>}
    </fieldset>
    {!isDesign15 && <p className={styles.note}>{variant === "d14" ? "We’ll hold your slot for 15 minutes while you complete your booking." : "Selecting a time starts a 15-minute preview hold. Your appointment is confirmed only after checkout."}</p>}
  </section>;
}
