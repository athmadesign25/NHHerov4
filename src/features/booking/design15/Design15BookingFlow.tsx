"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, Info, LogIn, Pencil, UserRound } from "lucide-react";
import type { BookingDoctorSummary } from "../types";
import type { Design15Variant } from "@/features/design-preview/journeyDesigns";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { bookingDirectoryHref } from "../design7/navigation";
import { safeReturnTo } from "../design13/navigation";
import SlotPicker from "../design13/SlotPicker";
import AppointmentContext from "../design13/AppointmentContext";
import ConfirmationStep from "../design7/ConfirmationStep";
import LoginDialog from "./LoginDialog";
import PatientSelection from "./PatientSelection";
import BookingReview from "./BookingReview";
import Payment from "./Payment";
import useDesign15Booking from "./useDesign15Booking";
import styles from "./Booking.module.css";

export default function Design15BookingFlow({ doctor: sourceDoctor, variant }: { doctor: BookingDoctorSummary; variant: Design15Variant }) {
  const doctor = useMemo(() => ({ ...sourceDoctor, name: presentationDoctorName(sourceDoctor.name) }), [sourceDoctor]);
  const flow = useDesign15Booking(doctor, variant);
  const { draft } = flow;
  const params = useSearchParams();
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(draft.stage);
  const selected = draft.patients.find(entry => entry.id === draft.selectedPatientId);
  const returnHref = safeReturnTo(params.get("returnTo"), bookingDirectoryHref(variant, doctor.city, draft.selection.mode), variant);
  const titles = { patient: "Who are we caring for?", appointment: "Choose a time that fits.", review: "Your appointment, nearly there.", payment: "One last step.", confirmation: "Your appointment." };
  const current = draft.stage === "patient" ? 0 : draft.stage === "appointment" ? 1 : draft.stage === "confirmation" ? 3 : 2;
  useEffect(() => {
    if (previous.current !== draft.stage) { previous.current = draft.stage; heading.current?.focus(); }
  }, [draft.stage]);
  const later = async () => { await flow.flush(); router.push(returnHref); };
  if (!flow.loaded) return <p className={styles.loading} role="status">Preparing your appointment…</p>;
  return <div className={styles.flow} data-journey-design={variant} data-journey-booking-content>
    <header className={styles.header}><Link href={returnHref} className={styles.back}><ArrowLeft size={16} aria-hidden />Back to doctors</Link>
      <h1 ref={heading} tabIndex={-1}>{titles[draft.stage]}</h1>
      <nav aria-label="Booking progress"><ol>{["Patient", "Time", "Review & pay", "Confirmed"].map((label, index) => <li key={label} aria-current={index === current ? "step" : undefined} data-complete={index < current || undefined}><span>{index < current ? <Check size={12} aria-hidden /> : index + 1}</span>{label}</li>)}</ol></nav>
    </header>
    {flow.notice && <div className={styles.notice} role="status"><Info size={18} aria-hidden /><p>{flow.notice}</p></div>}
    {flow.recoveryUnavailable && <div className={styles.notice} role="status"><Info size={18} aria-hidden /><p>We couldn’t save your progress. Keep this page open to finish your booking.</p></div>}
    <div className={styles.layout}>
      <div className={styles.context}><AppointmentContext doctor={doctor} selection={draft.selection} seconds={flow.seconds} showHold={Boolean(draft.failureHold && !draft.receipt)} expired={flow.expired} variant={variant}
        onChange={draft.identity && selected && draft.selection.time && !draft.receipt && !flow.busy ? () => flow.go("appointment") : undefined} />
        {draft.identity && <div className={styles.account}><Check size={15} aria-hidden /><span>Signed in with {draft.identity.method === "mobile" ? "mobile" : "email"}</span><button type="button" className={styles.textButton} disabled={flow.busy} onClick={() => flow.setLoginOpen(true)}>Change</button></div>}
      </div>
      <div className={styles.main}>
        {!draft.identity ? <section className={`${styles.panel} ${styles.loginPrompt}`}><span className={styles.avatar}><LogIn size={24} aria-hidden /></span><h2>Let’s get you signed in</h2><p>Use your mobile number or email to choose a patient and appointment time.</p><button type="button" className={styles.primary} onClick={() => flow.setLoginOpen(true)}>Log in to continue</button></section> : <>
          {flow.expired && !draft.receipt && <div className={styles.expired} role="alert"><Clock3 size={19} aria-hidden /><div><strong>Your reservation has expired.</strong><p>Your patient details are kept. Choose an available time to continue.</p></div>{draft.stage !== "appointment" && <button type="button" className={styles.secondary} onClick={() => flow.go("appointment")}>Choose a time</button>}</div>}
          {!flow.expired && draft.failureHold && flow.seconds <= 120 && <p className={styles.warning} role="status">Less than two minutes remain on your reservation.</p>}
          {draft.stage === "patient" && <PatientSelection identity={draft.identity} patients={draft.patients} selectedId={draft.selectedPatientId} onSelect={flow.selectPatient} onAdd={flow.addPatient} onContinue={flow.continuePatient} />}
          {draft.stage === "appointment" && selected && <><div className={styles.selectedPatient}><UserRound size={19} aria-hidden /><div><span>Appointment for</span><strong>{selected.patient.name}</strong></div><button type="button" className={styles.textButton} onClick={() => flow.go("patient")}><Pencil size={14} aria-hidden />Change</button></div>
            <SlotPicker key={`${draft.selection.mode}-${draft.selection.hospital}-${draft.selection.time}`} doctor={doctor} selection={draft.selection} now={flow.now} variant={variant} onSelect={flow.selectTime}
              onCancel={draft.selection.time && !flow.expired ? () => flow.go("review") : undefined} /></>}
          {draft.stage === "review" && selected && <BookingReview patient={selected.patient} fee={doctor.fee} mode={draft.selection.mode} payment={draft.payment} busy={flow.busy} expired={flow.expired} retrying={Boolean(draft.failureHold)} onPayment={flow.setPayment} onEditPatient={() => flow.go("patient")} onSubmit={() => { void flow.submitReview(); }} onLater={() => { void later(); }} />}
          {draft.stage === "payment" && <Payment fee={doctor.fee} busy={flow.busy} expired={flow.expired} onPay={() => { void flow.pay(); }} onBack={() => flow.go("review")} />}
          {draft.stage === "confirmation" && draft.receipt && <ConfirmationStep doctor={doctor} design={variant} receipt={draft.receipt} patientName={selected?.patient.name ?? ""} onCancel={flow.cancelReceipt} onNewPreview={flow.newAppointment} returnHref={returnHref} />}
        </>}
      </div>
    </div>
    <LoginDialog open={flow.loginOpen} onClose={() => flow.setLoginOpen(false)} onSuccess={identity => { flow.login(identity); requestAnimationFrame(() => heading.current?.focus()); }} />
    {process.env.NODE_ENV === "development" && <details className={styles.developerTools}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.secondary} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
  </div>;
}
