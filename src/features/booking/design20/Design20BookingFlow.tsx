"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { design17ProfileUrl } from "@/features/search/design17Profile";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design20BookingEntryUrl } from "@/features/search/design20BookingEntry";
import type { BookingDoctorSummary } from "../types";
import LoginModal from "@/features/auth/LoginModal";
import RazorpayDemo from "./RazorpayDemo";
import { design20Pricing } from "./pricing";
import AppointmentConfirmation from "./AppointmentConfirmation";
import AppointmentConfirmation2 from "./confirmation2/AppointmentConfirmation2";
import AppointmentConfirmation3 from "./confirmation3/AppointmentConfirmation3";
import AppointmentConfirmation4 from "./confirmation4/AppointmentConfirmation4";
import AppointmentConfirmation5 from "./confirmation5/AppointmentConfirmation5";
import AppointmentConfirmation6 from "./confirmation6/AppointmentConfirmation6";
import ConfirmationDesignSwitcher, { type ConfirmationDesign } from "./ConfirmationDesignSwitcher";
import useDesign20Booking from "./useDesign20Booking";
import { protectConfirmedBookingMember } from "./memberSelection";
import BookingSummary from "./BookingSummary";
import PreviousBookingSummary from "./previous/BookingSummary";
import BookingSummary4 from "./summary4/BookingSummary4";
import summary4Styles from "./summary4/BookingSummary4.module.css";
import BookingDesignSwitcher, { type BookingSummaryDesign } from "./BookingDesignSwitcher";
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
  const [loginDismissed, setLoginDismissed] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const summaryDesign: BookingSummaryDesign = params.get("summaryDesign") === "1" ? 1 : params.get("summaryDesign") === "2" ? 2 : params.get("summaryDesign") === "3" ? 3 : 4;
  const pageSummaryStyles = summaryDesign === 2 ? summaryStyles : previousSummaryStyles;
  const confirmationDesign: ConfirmationDesign = params.get("confirmationDesign") === "1" ? 1 : params.get("confirmationDesign") === "2" ? 2 : params.get("confirmationDesign") === "3" ? 3 : params.get("confirmationDesign") === "4" ? 4 : params.get("confirmationDesign") === "5" ? 5 : 6;
  const confirmed = Boolean(draft.receipt);
  const showConfirmation = confirmed && flow.isUserLoggedIn;
  useEffect(() => {
    if (confirmed && flow.isUserLoggedIn) return protectConfirmedBookingMember();
  }, [confirmed, flow.isUserLoggedIn]);
  useEffect(() => { if (flow.loaded) heading.current?.focus({ preventScroll: true }); }, [flow.loaded, confirmed, flow.isUserLoggedIn]);
  const listingDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const activeDoctor = listingDoctor ? { ...doctor, name: listingDoctor.name, hospital: listingDoctor.hospital, fee: listingDoctor.fee } : doctor;
  const needsSlotSelection = flow.loaded && confirmationRef === undefined && !draft.receipt && !flow.missingReceipt && !draft.selection.time;
  const slotEntry = design20BookingEntryUrl({ ...doctor, hospital: draft.selection.hospital }, draft.selection.mode, draft.selection.date, flow.returnTo);
  useEffect(() => {
    if (needsSlotSelection) router.replace(slotEntry);
  }, [needsSlotSelection, router, slotEntry]);
  const pricing = design20Pricing(activeDoctor.fee, draft.discountCode, draft.sponsorshipId, draft.useHealthCredits);
  const profile = listingDoctor ? design17ProfileUrl(listingDoctor, draft.selection.mode, draft.selection.date, false, "d20", flow.returnTo) : flow.returnTo;
  const changeSummaryDesign = (design: BookingSummaryDesign) => {
    const url = new URL(window.location.href);
    url.searchParams.set("summaryDesign", String(design));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const changeConfirmationDesign = (design: ConfirmationDesign) => {
    const url = new URL(window.location.href);
    url.searchParams.set("confirmationDesign", String(design));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  return <div className={`${styles.page} ${summaryStyles.page} ${showConfirmation ? confirmationStyles.page : ""}`} data-design17-booking="d20" data-booking-confirmed={showConfirmation || undefined} data-confirmation-design={showConfirmation ? confirmationDesign : undefined}>
    <div className={`${styles.container} ${pageSummaryStyles.container}`}>
      {!showConfirmation && <>{summaryDesign === 1 ? <Breadcrumbs theme="light" items={[{ label: "Home", href: "/" }, { label: "Doctors", href: flow.returnTo }, { label: doctor.name, href: profile }, { label: "Book appointment" }]} /> : summaryDesign === 2 && <nav className={summaryStyles.backNav} aria-label="Booking navigation">
        {confirmed || flow.missingReceipt ? <Link className={summaryStyles.back} href={flow.returnTo}><ArrowLeft size={16} aria-hidden />Back to doctors</Link>
          : <button type="button" className={summaryStyles.back} disabled={!flow.loaded || flow.busy} onClick={() => { void flow.backToSlots(); }}><ArrowLeft size={16} aria-hidden />Back</button>}
      </nav>}
        <header className={`${pageSummaryStyles.intro} ${summaryDesign === 4 ? summary4Styles.intro : ""} ${summaryDesign >= 3 ? previousSummaryStyles.introWithBack : ""}`}>
          {summaryDesign >= 3 && (confirmed || flow.missingReceipt
            ? <Link className={previousSummaryStyles.titleBack} href={flow.returnTo} aria-label="Back to doctors" title="Back to doctors"><ArrowLeft size={20} aria-hidden /></Link>
            : <button type="button" className={previousSummaryStyles.titleBack} aria-label="Go back" title="Back" disabled={!flow.loaded || flow.busy} onClick={() => { void flow.backToSlots(); }}><ArrowLeft size={20} aria-hidden /></button>)}
          <div><h1 ref={heading} tabIndex={-1}>{flow.missingReceipt ? "Booking details unavailable" : confirmed ? "Sign in to view your appointment" : "Complete your booking"}</h1>{!flow.missingReceipt && !confirmed && <p>Choose a member and review your appointment.</p>}</div></header></>}
      {!flow.loaded || needsSlotSelection ? <p className={styles.loading} role="status">{needsSlotSelection ? "Opening available times…" : "Preparing your appointment…"}</p>
        : flow.missingReceipt ? <section className={styles.panel}><h2>We couldn’t find this booking</h2><p className={styles.muted}>Return to the doctor list to choose an appointment.</p><Link href={flow.returnTo} className={styles.primary}>Find a doctor</Link></section>
        : !flow.isUserLoggedIn ? <section className={styles.panel}><h2>Sign in to continue</h2><p className={styles.muted}>{confirmed ? "Sign in to view your confirmed appointment." : "Your appointment choices are saved. Sign in to select a member."}</p><button type="button" className={styles.primary} onClick={() => { setLoginDismissed(false); flow.setLoginOpen(true); }}>Sign in</button></section>
        : <div className={`${styles.layout} ${styles.reviewLayout}`}><div className={styles.main}>
          {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
          {flow.recoveryUnavailable && <p className={styles.muted} role="status">Keep this page open to retain your booking progress.</p>}
          {draft.failureHold && !draft.receipt && <div className={styles.hold} role="status"><Clock3 size={19} aria-hidden /><div><strong>{flow.expired ? "Your slot reservation has expired" : "Your slot is reserved after the unsuccessful payment"}</strong><p>{flow.expired ? "Edit your appointment to choose another available time." : draft.selection.mode === "hospital" ? "Complete payment or choose pay at hospital before the reservation ends." : "Complete your online payment before the reservation ends."}</p></div>{!flow.expired && <time aria-label={`${Math.floor(flow.seconds / 60)} minutes ${flow.seconds % 60} seconds remaining`}>{Math.floor(flow.seconds / 60)}:{String(flow.seconds % 60).padStart(2, "0")}</time>}</div>}
          {!draft.receipt && (summaryDesign === 4 ? <BookingSummary4 doctor={activeDoctor} flow={flow} onEditingChange={setEditingSummary} /> : summaryDesign === 2 ? <BookingSummary doctor={activeDoctor} flow={flow} onEditingChange={setEditingSummary} /> : <PreviousBookingSummary doctor={activeDoctor} flow={flow} onEditingChange={setEditingSummary} doctorPlacement={summaryDesign === 3 ? "appointment" : "header"} />)}
          {draft.stage === "payment" && <RazorpayDemo fee={pricing.total} busy={flow.busy} expired={flow.expired} onPay={() => { void flow.pay(); }} onClose={flow.closePayment} />}
          {draft.receipt && (confirmationDesign === 1 ? <AppointmentConfirmation doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} /> : confirmationDesign === 2 ? <AppointmentConfirmation2 doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} /> : confirmationDesign === 3 ? <AppointmentConfirmation3 doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} /> : confirmationDesign === 4 ? <AppointmentConfirmation4 doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} /> : confirmationDesign === 5 ? <AppointmentConfirmation5 doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} /> : <AppointmentConfirmation6 doctor={activeDoctor} draft={draft} pricing={pricing} headingRef={heading} />)}
        </div></div>}
      {process.env.NODE_ENV === "development" && flow.isUserLoggedIn && !draft.receipt && <details className={styles.developer}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.textButton} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
    </div>
    {flow.loaded && flow.isUserLoggedIn && !draft.receipt && !needsSlotSelection && !flow.missingReceipt && draft.stage !== "payment" && <BookingDesignSwitcher active={summaryDesign} disabled={flow.busy || editingSummary} onChange={changeSummaryDesign} />}
    {flow.loaded && showConfirmation && !flow.missingReceipt && <ConfirmationDesignSwitcher active={confirmationDesign} onChange={changeConfirmationDesign} />}
    <LoginModal previewOtp isOpen={flow.loaded && !needsSlotSelection && !flow.isUserLoggedIn && !flow.missingReceipt && (flow.loginOpen || !loginDismissed)} onClose={() => { setLoginDismissed(true); flow.setLoginOpen(false); }} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </div>;
}
