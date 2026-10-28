import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MapPin, UserRound, Video } from "lucide-react";
import type { BookingDoctorSummary } from "../types";
import type { Design15Draft } from "../design15/model";
import { formatBookingDate } from "../format";
import { appointmentPricing } from "../design17/pricing";
import styles from "../design17/Booking.module.css";

export default function AppointmentConfirmation({ doctor, draft }: { doctor: BookingDoctorSummary; draft: Design15Draft }) {
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const pricing = appointmentPricing(doctor.fee, draft.discountCode);
  return <section className={`${styles.panel} ${styles.confirmation}`} aria-labelledby="d18-confirmation-title">
    <header className={styles.confirmationHeading}><div className={styles.confirmed}><Check size={26} aria-hidden /></div><div><h2 id="d18-confirmation-title">Your appointment is confirmed</h2><p className={styles.muted}>You’ll receive a confirmation email and SMS on your registered email address and mobile number.</p></div></header>
    <div className={styles.reviewDoctor}><Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt="" width={48} height={48} sizes="48px" /><div><strong>{doctor.name}</strong><p className={styles.muted}>{doctor.speciality}</p></div></div>
    <div className={styles.reviewRecap}>
      <div className={styles.reviewSlot}><CalendarDays size={17} aria-hidden /><div><span className={styles.slotLabel}>Date & time</span><strong>{formatBookingDate(draft.selection.date)} · {draft.selection.time} <span className={styles.slotTimezone}>IST</span></strong></div></div>
      {patient && <div className={styles.reviewMember}><UserRound size={17} aria-hidden /><div><span className={styles.slotLabel}>Patient</span><strong>{patient.name} <span className={styles.reviewAge}>· {patient.age} years</span></strong></div></div>}
      <p className={styles.reviewLocation}>{draft.selection.mode === "hospital" ? <MapPin size={17} aria-hidden /> : <Video size={17} aria-hidden />}<span>{draft.selection.mode === "hospital" ? draft.selection.hospital : "Video consultation"}</span></p>
    </div>
    <div className={styles.confirmationReference}><span>Payment mode</span><strong>{draft.payment === "online" ? "Paid online" : "Pay at hospital"}</strong></div>
    <div className={styles.total}><span>{draft.payment === "online" ? "Amount paid" : "Amount due at hospital"}</span><strong>{pricing.total}</strong></div>
    {draft.selection.mode === "video" && <p className={styles.muted}>Have a stable internet connection, a quiet place and your reports ready.</p>}
    {draft.payment === "hospital" && <p className={styles.muted}>Pay at reception before your consultation.</p>}
    <div className={styles.portalSupport}><h3>Manage your care</h3><p className={styles.muted}>Track your appointments, view your medical history and access your health records through the patient portal.</p>
      <div className={styles.confirmationActions}><Link href="/" className={styles.secondary}>Go back to home</Link><a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label="Log in to patient portal (opens in a new tab)">Log in to patient portal <ArrowRight size={17} aria-hidden /></a></div>
    </div>
  </section>;
}
