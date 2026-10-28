"use client";

import Image from "next/image";
import { Building2, CalendarDays, Clock3, Phone, UserRound, Video } from "lucide-react";
import type { JourneyDesign } from "@/features/design-preview/journeyDesigns";
import type { BookingDoctorSummary } from "../types";
import { formatBookingDate } from "../format";
import { remainingHoldSeconds, type AppointmentSelection, type SlotHold } from "./model";
import styles from "./Booking.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  design: JourneyDesign;
  selection: AppointmentSelection;
  patientName: string;
  hold: SlotHold | null;
  now: number;
  complete: boolean;
}

export default function BookingSummary({ doctor, design, selection, patientName, hold, now, complete }: Props) {
  const seconds = remainingHoldSeconds(hold, now);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <aside className={styles.summary} aria-label="Your appointment summary" data-journey-palette={design === "d9" ? "dark" : design === "d12" ? "light" : undefined}>
    <div className={styles.summaryDoctor}><div className={styles.summaryPortrait}><Image src={doctor.img} alt={doctor.name} fill sizes="96px" priority /></div><div><span className={styles.eyebrow}>YOUR SPECIALIST</span><h2>{doctor.name}</h2><p>{doctor.speciality}</p><span>{doctor.experienceYears} experience</span></div></div>
    <div className={styles.summaryRows}><div>{selection.mode === "hospital" ? <Building2 size={18} aria-hidden /> : <Video size={18} aria-hidden />}<span>{selection.mode === "hospital" ? selection.hospital : "Video consultation"}</span></div>
      <div><CalendarDays size={18} aria-hidden /><span>{selection.date ? formatBookingDate(selection.date, "short") : "Choose your date"}</span></div><div><Clock3 size={18} aria-hidden /><span>{selection.time || "Choose your time"}</span></div>{patientName && <div><UserRound size={18} aria-hidden /><span>{patientName}</span></div>}
    </div>
    <div className={styles.summaryFee}><span>Consultation fee</span><strong>{doctor.fee}</strong></div>
    {hold && !complete && <div className={styles.hold} data-urgent={seconds <= 120 || undefined}><div><Clock3 size={17} aria-hidden /><span>{seconds > 0 ? "Preview slot held for" : "Preview hold expired"}</span><strong role="timer" aria-label={`${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds remaining`}>{time}</strong></div><p>{seconds > 0 ? "Complete checkout before the timer ends. Retrying payment keeps this same deadline." : "Select a new time to start another preview hold."}</p></div>}
    <p className={styles.summaryPrivacy}>Preview only. Personal details are not saved.</p>
    <a className={styles.helpLink} href="tel:18602080208"><Phone size={16} aria-hidden /><span>Need help? <strong>Call Narayana Health</strong></span></a>
  </aside>;
}
