"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Download, MapPin, RotateCcw, Video, X } from "lucide-react";
import { isDesign15Variant, type JourneyDesign } from "@/features/design-preview/journeyDesigns";
import type { BookingDoctorSummary } from "../types";
import { formatBookingDate } from "../format";
import { receiptCalendar, type PreviewReceipt } from "./model";
import { bookingDirectoryHref } from "./navigation";
import styles from "./Booking.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  design: JourneyDesign;
  receipt: PreviewReceipt;
  patientName: string;
  onCancel: () => void;
  onNewPreview: () => void;
  returnHref?: string;
}

export default function ConfirmationStep({ doctor, design, receipt, patientName, onCancel, onNewPreview, returnHref }: Props) {
  const isD14 = design === "d14" || isDesign15Variant(design);
  const cancelled = receipt.status === "cancelled";
  const selection = receipt.selection;
  const download = () => {
    const url = URL.createObjectURL(new Blob([receiptCalendar(receipt, doctor.name)], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${receipt.ref}-preview.ics`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <section className={`${styles.panel} ${styles.confirmation}`} aria-labelledby="d7-confirmation-heading">
    <div className={cancelled ? styles.cancelledIcon : styles.confirmedIcon}>{cancelled ? <X size={30} aria-hidden /> : <Check size={32} aria-hidden />}</div>
    {!isD14 && <span className={styles.eyebrow}>DESIGN {design.slice(1)} · PREVIEW COMPLETE</span>}
    <h2 id="d7-confirmation-heading">{isD14 ? cancelled ? "Appointment cancelled" : "Appointment confirmed" : cancelled ? "Preview booking cancelled." : "You’re all set."}</h2>
    <p className={styles.confirmationLead}>{cancelled ? isD14 ? "Your appointment has been cancelled. You can choose a new appointment whenever you’re ready." : "This demonstration booking has been cancelled. You can choose a new appointment whenever you’re ready." : `${patientName ? `${patientName}’s appointment` : "Your appointment"} with ${doctor.name} is confirmed${isD14 ? "." : " in this preview."}`}</p>
    {!isD14 && <div className={styles.confirmationNote}>This is a demonstration receipt. No real appointment is reserved, no money was charged, and no SMS or email is sent.</div>}
    <div className={styles.receiptReference}><span>{isD14 ? "Booking reference" : "Preview reference"}</span><strong>{receipt.ref}</strong><span className={cancelled ? styles.cancelledBadge : styles.confirmedBadge}>{cancelled ? "Cancelled" : isD14 ? "Confirmed" : "Confirmed · preview"}</span></div>
    <div className={styles.receiptGrid}><div><CalendarDays size={20} aria-hidden /><span>Date & time</span><strong>{formatBookingDate(selection.date)}<br />{selection.time}</strong></div>
      <div>{selection.mode === "hospital" ? <MapPin size={20} aria-hidden /> : <Video size={20} aria-hidden />}<span>{selection.mode === "hospital" ? "Hospital visit" : "Video consultation"}</span><strong>{selection.mode === "hospital" ? selection.hospital : isD14 ? "Video appointment" : "Video appointment preview"}</strong></div>
    </div>
    <div className={styles.paymentReceipt}><span>{receipt.payment === "online" ? isD14 ? cancelled ? "Paid online" : "Payment successful" : cancelled ? "Demo payment reversed" : "Demo payment successful" : cancelled ? "No payment due" : isD14 ? "Pay at hospital" : "Pay at the hospital"}</span><strong>{doctor.fee}</strong>{isD14 ? <small>{cancelled ? receipt.payment === "online" ? "Contact our care team for cancellation and refund information." : "Your appointment is cancelled." : receipt.payment === "online" ? "Consultation fee paid" : "Pay at reception before your consultation."}</small> : <small>{receipt.payment === "online" ? "Simulated only · no charge or refund occurs" : "Illustrative consultation fee"}</small>}</div>
    {!cancelled && <><div className={styles.nextSteps}><h3>Before your {selection.mode === "hospital" ? "visit" : "consultation"}</h3><p>{isD14 ? selection.mode === "hospital" ? "Arrive ahead of your appointment time and bring an ID and any relevant medical reports." : "Have a stable internet connection, a quiet place, and your reports ready." : selection.mode === "hospital" ? "For a real appointment, arrive ahead of your time and bring an ID and any relevant medical reports." : "For a real video visit, have a stable internet connection, a quiet place, and your reports ready."}</p></div>
      <div className={styles.confirmationActions}>{!isD14 && <><button type="button" className={styles.secondary} onClick={download}><Download size={16} aria-hidden />Save preview to calendar</button><button type="button" className={styles.secondary} onClick={onNewPreview}><RotateCcw size={16} aria-hidden />Start a new preview</button></>}<button type="button" className={styles.textButton} onClick={onCancel}>{isD14 ? "Cancel appointment" : "Cancel preview booking"}</button></div></>}
    {cancelled && <button type="button" className={styles.primary} onClick={onNewPreview}>Choose a new appointment <ArrowRight size={17} aria-hidden /></button>}
    <Link href={returnHref ?? bookingDirectoryHref(design, doctor.city, selection.mode)} className={styles.backToDoctors}>Back to find doctors <ArrowRight size={16} aria-hidden /></Link>
  </section>;
}
