"use client";

import { getAppointmentFee } from "@/features/booking/executiveSlots";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { duration } from "@/lib/motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design20BookingEntryUrl } from "@/features/search/design20BookingEntry";
import type { BookingDoctorSummary } from "../types";
import LoginModal from "@/features/auth/LoginModal";
import RazorpayDemo from "./RazorpayDemo";
import PaymentRecoveryNotice from "./PaymentRecoveryNotice";
import PaymentReservation from "./PaymentReservation";
import { design20Pricing } from "./pricing";
import AppointmentConfirmation7 from "./confirmation7/AppointmentConfirmation7";
import useDesign20Booking from "./useDesign20Booking";
import { protectConfirmedBookingMember } from "./memberSelection";
import BookingSummary4 from "./summary4/BookingSummary4";
import summary4Styles from "./summary4/BookingSummary4.module.css";
import styles from "../design17/Booking.module.css";
import summaryStyles from "./BookingSummary.module.css";
import previousSummaryStyles from "./previous/BookingSummary.module.css";
import confirmationStyles from "./AppointmentConfirmation.module.css";

export default function Design20BookingFlow({ doctor, confirmationRef }: { doctor: BookingDoctorSummary; confirmationRef?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const flow = useDesign20Booking(doctor, { returnTo: params.get("returnTo") ?? "/search/doctors?design=d21", confirmationRef });
  const { draft } = flow;
  const heading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const [loginDismissed, setLoginDismissed] = useState(false);
  const confirmed = Boolean(draft.receipt);
  const showConfirmation = confirmed && flow.isUserLoggedIn;
  const reserved = Boolean(draft.reservationSkipped && !draft.receipt && flow.isUserLoggedIn);
  useEffect(() => {
    if ((confirmed || reserved) && flow.isUserLoggedIn) return protectConfirmedBookingMember();
  }, [confirmed, reserved, flow.isUserLoggedIn]);
  useEffect(() => { if (flow.loaded) heading.current?.focus({ preventScroll: true }); }, [flow.loaded, confirmed, flow.isUserLoggedIn]);
  const pricingSelection = draft.receipt?.selection ?? draft.selection;
  const listingDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: pricingSelection.hospital }));
  const baseDoctor = listingDoctor ? { ...doctor, name: listingDoctor.name, hospital: listingDoctor.hospital, fee: listingDoctor.fee } : doctor;
  const activeDoctor = { ...baseDoctor, fee: getAppointmentFee(baseDoctor.fee, pricingSelection) };
  const needsSlotSelection = flow.loaded && confirmationRef === undefined && !draft.receipt && !flow.missingReceipt && !draft.selection.time;
  const slotEntry = design20BookingEntryUrl({ ...doctor, hospital: draft.selection.hospital }, draft.selection.mode, draft.selection.date, flow.returnTo);
  useEffect(() => {
    if (needsSlotSelection) router.replace(slotEntry);
  }, [needsSlotSelection, router, slotEntry]);
  const pricing = design20Pricing(activeDoctor.fee, draft.discountCode, draft.sponsorshipId, draft.useHealthCredits);
  return <div className={`${styles.page} ${summaryStyles.page} ${showConfirmation ? confirmationStyles.page : ""}`} data-design17-booking="d20" data-booking-confirmed={showConfirmation || undefined} data-confirmation-design={showConfirmation ? 7 : undefined}>
    <div className={`${styles.container} ${previousSummaryStyles.container}`}>
      {!showConfirmation && !reserved && <header className={`${previousSummaryStyles.intro} ${summary4Styles.intro} ${previousSummaryStyles.introWithBack}`}>
        {confirmed || flow.missingReceipt
          ? <Link className={previousSummaryStyles.titleBack} href={flow.returnTo} aria-label="Back to doctors" title="Back to doctors"><ArrowLeft size={20} aria-hidden /></Link>
          : <button type="button" className={previousSummaryStyles.titleBack} aria-label="Go back" title="Back" disabled={!flow.loaded || flow.busy} onClick={() => { void flow.backToSlots(); }}><ArrowLeft size={20} aria-hidden /></button>}
        <div><h1 ref={heading} tabIndex={-1} className={summaryStyles.headingSweepAnchor}>{flow.missingReceipt ? "Booking details unavailable" : confirmed ? "Sign in to view your appointment" : "Complete your booking"}{!flow.missingReceipt && !confirmed && <span className={summaryStyles.headingSweep} aria-hidden="true"><TextSweepEffect words={["Complete your booking"]} sweepMs={duration.slowest * 2000} active={flow.loaded && !reducedMotion} sweepColor="var(--color-primary)" finalColor="var(--d7-text)" /></span>}</h1>{!flow.missingReceipt && !confirmed && <p>Choose a member and review your appointment.</p>}</div>
      </header>}
      {!flow.loaded || needsSlotSelection ? <p className={styles.loading} role="status">{needsSlotSelection ? "Opening available times…" : "Preparing your appointment…"}</p>
        : flow.missingReceipt ? <section className={styles.panel}><h2>We couldn’t find this booking</h2><p className={styles.muted}>Return to the doctor list to choose an appointment.</p><Link href={flow.returnTo} className={styles.primary}>Find a doctor</Link></section>
        : !flow.isUserLoggedIn ? <section className={styles.panel}><h2>Sign in to continue</h2><p className={styles.muted}>{confirmed ? "Sign in to view your confirmed appointment." : "Your appointment choices are saved. Sign in to select a member."}</p><button type="button" className={styles.primary} onClick={() => { setLoginDismissed(false); flow.setLoginOpen(true); }}>Sign in</button></section>
        : <div className={`${styles.layout} ${styles.reviewLayout}`}><div className={styles.main}>
          {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
          {draft.paymentRecovery && !reserved && draft.stage !== "payment" && !draft.receipt && <PaymentRecoveryNotice status={draft.paymentRecovery} expired={flow.expired} covered={pricing.amounts.total === 0} />}
          {reserved && <PaymentReservation seconds={flow.seconds} expired={flow.expired} doctor={activeDoctor} member={draft.patients.find(entry => entry.id === draft.selectedPatientId)} selection={draft.selection} total={pricing.total} busy={flow.busy} onRetry={() => { void flow.submitReview("online"); }} onChooseSlot={() => { void flow.backToSlots(); }} />}
          {!draft.receipt && !reserved && <BookingSummary4 doctor={activeDoctor} flow={flow} />}
          {draft.stage === "payment" && <RazorpayDemo fee={pricing.total} busy={flow.busy} expired={flow.expired} onPay={() => { void flow.pay(); }} onClose={flow.closePayment} />}
          {draft.receipt && <AppointmentConfirmation7 key={draft.receipt.ref} doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} />}
        </div></div>}
      {process.env.NODE_ENV === "development" && flow.isUserLoggedIn && !draft.receipt && <details className={styles.developer}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.textButton} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
    </div>
    <LoginModal previewOtp isOpen={flow.loaded && !needsSlotSelection && !flow.isUserLoggedIn && !flow.missingReceipt && (flow.loginOpen || !loginDismissed)} onClose={() => { setLoginDismissed(true); flow.setLoginOpen(false); }} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </div>;
}
