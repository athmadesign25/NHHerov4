"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { design17ProfileUrl, getDesign17ProfileDoctor } from "@/features/search/design17Profile";
import type { BookingDoctorSummary } from "../types";
import BookingReview from "../design17/BookingReview";
import PaymentDialog from "../design17/PaymentDialog";
import { appointmentPricing } from "../design17/pricing";
import AppointmentConfirmation from "../design18/AppointmentConfirmation";
import InlineSignIn from "../design18/InlineSignIn";
import useDesign19Booking from "./useDesign19Booking";
import { design19InlineUrl } from "./model";
import styles from "../design17/Booking.module.css";

export default function Design19BookingFlow({ doctor, confirmationRef }: { doctor: BookingDoctorSummary; confirmationRef?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const flow = useDesign19Booking(doctor, { returnTo: params.get("returnTo") ?? "/search/doctors?design=d19", confirmationRef });
  const { draft } = flow;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [draft.stage]);
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const listingDoctor = getDesign17ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const activeDoctor = listingDoctor ? { ...doctor, name: listingDoctor.name, hospital: listingDoctor.hospital, fee: listingDoctor.fee } : doctor;
  const pricing = appointmentPricing(activeDoctor.fee, draft.discountCode);
  const profile = listingDoctor ? design17ProfileUrl(listingDoctor, draft.selection.mode, draft.selection.date, false, "d19", flow.returnTo) : flow.returnTo;
  const choosing = !confirmationRef && !draft.receipt && (draft.stage === "patient" || draft.stage === "appointment" || !flow.isUserLoggedIn);
  useEffect(() => {
    if (flow.loaded && choosing && !flow.missingReceipt) router.replace(design19InlineUrl(draft, flow.returnTo));
  }, [flow.loaded, flow.missingReceipt, flow.returnTo, choosing, draft, router]);
  return <div className={styles.page} data-design17-booking="d19">
    <div className={`${styles.container} ${choosing ? "" : styles.reviewContainer}`}>
      <Breadcrumbs theme="light" items={[{ label: "Home", href: "/" }, { label: "Doctors", href: flow.returnTo }, { label: doctor.name, href: profile }, { label: confirmationRef || draft.receipt ? "Confirmation" : "Book appointment" }]} />
      {!choosing && <header className={styles.header}><h1 ref={heading} tabIndex={-1}>{flow.missingReceipt ? "Booking details unavailable" : draft.receipt ? "Appointment confirmed" : "Review your appointment"}</h1></header>}
      {!flow.loaded ? <p className={styles.loading} role="status">Preparing your appointment…</p>
        : flow.missingReceipt ? <section className={styles.panel}><h2>We couldn’t find this booking</h2><p className={styles.muted}>Return to the doctor list to choose an appointment.</p><Link href={flow.returnTo} className={styles.primary}>Find a doctor</Link></section>
        : choosing ? <p className={styles.loading} role="status">Opening your doctor card…</p>
        : !flow.isUserLoggedIn ? <section className={styles.panel}><InlineSignIn onSuccess={flow.onSignedIn} onBack={() => router.push(flow.returnTo)} /></section>
        : <div className={`${styles.layout} ${styles.reviewLayout}`}><div className={styles.main}>
          {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
          {flow.recoveryUnavailable && <p className={styles.muted} role="status">Keep this page open to retain your booking progress.</p>}
          {draft.failureHold && !draft.receipt && <div className={styles.hold} role="status"><Clock3 size={19} aria-hidden /><div><strong>{flow.expired ? "Your slot reservation has expired" : "Your slot is reserved after the unsuccessful payment"}</strong><p>{flow.expired ? "Choose another available time to continue." : draft.selection.mode === "hospital" ? "Complete payment or choose pay at hospital before the reservation ends." : "Complete your online payment before the reservation ends."}</p></div>{!flow.expired && <time aria-label={`${Math.floor(flow.seconds / 60)} minutes ${flow.seconds % 60} seconds remaining`}>{Math.floor(flow.seconds / 60)}:{String(flow.seconds % 60).padStart(2, "0")}</time>}{flow.expired && <button type="button" className={styles.textButton} onClick={() => flow.go("appointment")}>Choose a time</button>}</div>}
          {(draft.stage === "review" || draft.stage === "payment") && patient && <BookingReview doctor={activeDoctor} selection={draft.selection} patient={patient} fee={activeDoctor.fee} mode={draft.selection.mode} discountCode={draft.discountCode} busy={flow.busy} expired={flow.expired} retrying={Boolean(draft.failureHold)} onDiscount={flow.applyDiscount} onEditAppointment={() => flow.go("appointment")} onPay={payment => { void flow.submitReview(payment); }} onLater={() => { void flow.finishLater(); }} />}
          {draft.stage === "payment" && <PaymentDialog fee={pricing.total} busy={flow.busy} expired={flow.expired} onPay={() => { void flow.pay(); }} onClose={() => flow.go("review")} />}
          {draft.receipt && <AppointmentConfirmation doctor={activeDoctor} draft={draft} />}
        </div></div>}
      {process.env.NODE_ENV === "development" && flow.isUserLoggedIn && !draft.receipt && <details className={styles.developer}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.textButton} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
    </div>
  </div>;
}
