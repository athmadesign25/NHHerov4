"use client";

import Image from "next/image";
import { CalendarDays, Clock3, MapPin, Pencil, Video } from "lucide-react";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection } from "../design7/model";
import { isDesign15Variant, type QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import { formatBookingDate } from "../format";
import styles from "./AppointmentContext.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  onChange?: () => void;
  seconds: number;
  showHold: boolean;
  expired: boolean;
  variant?: QuickJourneyDesign;
}

export default function AppointmentContext({ doctor, selection, onChange, seconds, showHold, expired, variant = "d13" }: Props) {
  const remaining = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const isDesign15 = isDesign15Variant(variant);
  const useInitials = isDesign15 && /\/images\/misc\/doctor_avatar/i.test(doctor.img);
  const nameParts = doctor.name.replace(/^(?:Dr\.?|Prof\.?)\s+/i, "").trim().split(/\s+/);
  const initials = `${nameParts[0]?.[0] ?? ""}${nameParts.length > 1 ? nameParts.at(-1)?.[0] ?? "" : ""}`.toUpperCase() || "NH";
  return <aside className={styles.context} data-journey-palette={isDesign15 ? undefined : "dark"} aria-label="Your appointment">
    <div className={styles.identity}>
      <div className={styles.portrait}>{useInitials ? <span className={styles.initials} aria-hidden>{initials}</span> : <Image src={doctor.img} alt="" fill sizes="64px" priority />}</div>
      <div><h2>{doctor.name}</h2><p>{doctor.speciality}</p></div>
      {onChange && <button className={styles.change} type="button" onClick={onChange} aria-label="Change appointment"><Pencil size={14} aria-hidden /><span>Change</span></button>}
    </div>
    <div className={styles.details}>
      <p className={styles.date}><CalendarDays size={16} aria-hidden /><strong>{selection.time ? `${formatBookingDate(selection.date, "short")} · ${selection.time}` : "Choose a date & time"}<span className={styles.timezone}> IST</span></strong></p>
      <p className={styles.hospital}>{selection.mode === "hospital" ? <MapPin size={15} aria-hidden /> : <Video size={15} aria-hidden />}<span>{selection.mode === "hospital" ? selection.hospital : "Video consultation"}</span></p>
    </div>
    <div className={styles.fee}><span>Consultation fee</span><strong>{doctor.fee}</strong></div>
    {showHold && <div className={styles.hold} data-urgent={seconds <= 120 || undefined}>
      <Clock3 size={15} aria-hidden /><span>{isDesign15 ? expired ? "Reservation expired" : "Slot reserved" : variant === "d14" ? expired ? "Slot hold ended" : "Time left to book" : expired ? "Preview hold ended" : "Preview slot held"}</span>
      <strong role="timer" aria-label={`${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds remaining`}>{remaining}</strong>
    </div>}
  </aside>;
}
