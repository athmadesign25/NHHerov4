"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { appointmentDates, DESIGN16_BOOKING_DAYS } from "../appointmentTime";
import { getDesign3BookingSlots } from "../design3Availability";
import type { AppointmentSelection } from "../design7/model";
import type { BookingDoctorSummary } from "../types";
import AppointmentSelector from "@/app/search/designs/d20/AppointmentSelector";
import styles from "./AppointmentEditor.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  now: number;
  busy?: boolean;
  onSave: (selection: AppointmentSelection) => void;
  onCancel: () => void;
}

/** Edits stay local until an available appointment is explicitly saved. */
export default function AppointmentEditor({ doctor, selection, now, busy = false, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<AppointmentSelection>(() => ({ ...selection }));
  const [notice, setNotice] = useState("");
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);

  const dates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.hospital }));
  const availableModes = (["hospital", "video"] as const).filter(mode => profile?.modes[mode] === true);
  const slotsFor = (date: string) => getDesign3BookingSlots(doctor.id, date, draft.mode, draft.hospital, new Date(now), DESIGN16_BOOKING_DAYS, "d20").filter(slot => slot.available);
  const slots = slotsFor(draft.date);
  const validSelection = draft.doctorId === doctor.id && availableModes.includes(draft.mode) && dates.includes(draft.date) && slots.some(slot => slot.time === draft.time);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const save = () => {
    if (busy) return;
    // Recheck the current clock before committing; a time can pass while editing.
    const stillAvailable = getDesign3BookingSlots(doctor.id, draft.date, draft.mode, draft.hospital, new Date(Math.max(now, Date.now())), DESIGN16_BOOKING_DAYS, "d20").some(slot => slot.available && slot.time === draft.time);
    if (!validSelection || !stillAvailable) {
      setDraft(previous => ({ ...previous, time: "" }));
      setNotice("This time is no longer available. Please choose another time.");
      return;
    }
    onSave(draft);
  };

  return <section className={styles.editor} aria-labelledby={`${id}-heading`}>
    <h3 id={`${id}-heading`} ref={heading} tabIndex={-1}>Edit appointment</h3>
    <fieldset className={styles.controls} disabled={busy}>
      <legend className={styles.srOnly}>Appointment options</legend>
      <AppointmentSelector doctor={doctor} selection={draft} now={now} onChange={next => {
        setDraft(next);
        setNotice(next.time ? "" : "Choose a time to confirm your appointment.");
      }} />
    </fieldset>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.actions}>
      <button type="button" className={styles.cancel} disabled={busy} onClick={onCancel}>Cancel</button>
      <button type="button" className={styles.save} disabled={busy || !validSelection} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
    </div>
  </section>;
}
