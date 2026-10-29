"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { design17ProfileUrl } from "@/features/search/design17Profile";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design20BookingEntryUrl } from "@/features/search/design20BookingEntry";
import type { BookingDoctorSummary } from "../types";
import LoginModal from "@/features/auth/LoginModal";
import RazorpayDemo from "./RazorpayDemo";
import { design20Pricing } from "./pricing";
import AppointmentConfirmation from "../design18/AppointmentConfirmation";
import useDesign20Booking from "./useDesign20Booking";
import BookingSummary from "./BookingSummary";
import styles from "../design17/Booking.module.css";
import summaryStyles from "./BookingSummary.module.css";

export default function Design20BookingFlow({ doctor, confirmationRef }: { doctor: BookingDoctorSummary; confirmationRef?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const flow = useDesign20Booking(doctor, { returnTo: params.get("returnTo") ?? "/search/doctors?design=d20", confirmationRef });
  const { draft } = flow;
  const heading = useRef<HTMLHeadingElement>(null);
  const [loginDismissed, setLoginDismissed] = useState(false);
  const confirmed = Boolean(draft.receipt);
  useEffect(() => { if (flow.loaded) heading.current?.focus({ preventScroll: true }); }, [flow.loaded, confirmed]);
  const listingDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const activeDoctor = listingDoctor ? { ...doctor, name: listingDoctor.name, hospital: listingDoctor.hospital, fee: listingDoctor.fee } : doctor;
  const needsSlotSelection = flow.loaded && confirmationRef === undefined && !draft.receipt && !flow.missingReceipt && !draft.selection.time;
  const slotEntry = design20BookingEntryUrl({ ...doctor, hospital: draft.selection.hospital }, draft.selection.mode, draft.selection.date, flow.returnTo);
  useEffect(() => {
    if (needsSlotSelection) router.replace(slotEntry);
  }, [needsSlotSelection, router, slotEntry]);
  const pricing = design20Pricing(activeDoctor.fee, draft.discountCode, draft.sponsorshipId, draft.useHealthCredits);
  const profile = listingDoctor ? design17ProfileUrl(listingDoctor, draft.selection.mode, draft.selection.date, false, "d20", flow.returnTo) : flow.returnTo;
  return <div className={`${styles.page} ${summaryStyles.page}`} data-design17-booking="d20">
    <div className={`${styles.container} ${summaryStyles.container}`}>
      <Breadcrumbs theme="light" items={[{ label: "Home", href: "/" }, { label: "Doctors", href: flow.returnTo }, { label: doctor.name, href: profile }, { label: confirmationRef || draft.receipt ? "Confirmation" : "Book appointment" }]} />
      <header className={summaryStyles.intro}><div><h1 ref={heading} tabIndex={-1}>{flow.missingReceipt ? "Booking details unavailable" : draft.receipt ? "Appointment confirmed" : "Complete your booking"}</h1>{!draft.receipt && !flow.missingReceipt && <p>Choose a member and review your appointment.</p>}</div>
      </header>
      {!flow.loaded || needsSlotSelection ? <p className={styles.loading} role="status">{needsSlotSelection ? "Opening available times…" : "Preparing your appointment…"}</p>
        : flow.missingReceipt ? <section className={styles.panel}><h2>We couldn’t find this booking</h2><p className={styles.muted}>Return to the doctor list to choose an appointment.</p><Link href={flow.returnTo} className={styles.primary}>Find a doctor</Link></section>
        : !flow.isUserLoggedIn ? <section className={styles.panel}><h2>Sign in to continue</h2><p className={styles.muted}>Your appointment choices are saved. Sign in to select a member.</p><button type="button" className={styles.primary} onClick={() => { setLoginDismissed(false); flow.setLoginOpen(true); }}>Sign in</button></section>
        : <div className={`${styles.layout} ${styles.reviewLayout}`}><div className={styles.main}>
          {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
          {flow.recoveryUnavailable && <p className={styles.muted} role="status">Keep this page open to retain your booking progress.</p>}
          {draft.failureHold && !draft.receipt && <div className={styles.hold} role="status"><Clock3 size={19} aria-hidden /><div><strong>{flow.expired ? "Your slot reservation has expired" : "Your slot is reserved after the unsuccessful payment"}</strong><p>{flow.expired ? "Edit your appointment to choose another available time." : draft.selection.mode === "hospital" ? "Complete payment or choose pay at hospital before the reservation ends." : "Complete your online payment before the reservation ends."}</p></div>{!flow.expired && <time aria-label={`${Math.floor(flow.seconds / 60)} minutes ${flow.seconds % 60} seconds remaining`}>{Math.floor(flow.seconds / 60)}:{String(flow.seconds % 60).padStart(2, "0")}</time>}</div>}
          {!draft.receipt && <BookingSummary doctor={activeDoctor} flow={flow} />}
          {draft.stage === "payment" && <RazorpayDemo fee={pricing.total} busy={flow.busy} expired={flow.expired} mobile={draft.identity?.method === "mobile" ? draft.identity.value : undefined} email={draft.identity?.method === "email" ? draft.identity.value : undefined} onPay={() => { void flow.pay(); }} onClose={flow.closePayment} />}
          {draft.receipt && <AppointmentConfirmation doctor={activeDoctor} draft={draft} payableAmount={pricing.total} coveredByBenefits={pricing.amounts.total === 0} />}
        </div></div>}
      {process.env.NODE_ENV === "development" && flow.isUserLoggedIn && !draft.receipt && <details className={styles.developer}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.textButton} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
    </div>
    <LoginModal previewOtp isOpen={flow.loaded && !needsSlotSelection && !flow.isUserLoggedIn && !flow.missingReceipt && (flow.loginOpen || !loginDismissed)} onClose={() => { setLoginDismissed(true); flow.setLoginOpen(false); }} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </div>;
}
