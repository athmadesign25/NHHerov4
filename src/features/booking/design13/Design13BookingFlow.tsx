"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, ChevronRight, Clock3, Info, Phone } from "lucide-react";
import type { BookingDoctorSummary } from "../types";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";
import { bookingDirectoryHref } from "../design7/navigation";
import ConfirmationStep from "../design7/ConfirmationStep";
import AppointmentContext from "./AppointmentContext";
import PatientCheckout from "./PatientCheckout";
import Design14PatientCheckout from "../design14/PatientCheckout";
import { defaultExistingPatients } from "../design14/patients";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import SlotPicker from "./SlotPicker";
import PaymentPreview from "./PaymentPreview";
import { safeReturnTo } from "./navigation";
import useQuickBooking from "./useQuickBooking";
import styles from "./Design13BookingFlow.module.css";

export default function Design13BookingFlow({ doctor: sourceDoctor, variant = "d13" }: { doctor: BookingDoctorSummary; variant?: QuickJourneyDesign }) {
  const presentation = variant === "d14";
  const doctor = presentation ? { ...sourceDoctor, name: presentationDoctorName(sourceDoctor.name) } : sourceDoctor;
  const flow = useQuickBooking(doctor, variant);
  const params = useSearchParams();
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(flow.stage);
  const returnHref = safeReturnTo(params.get("returnTo"), bookingDirectoryHref(variant, doctor.city, flow.selection.mode), variant);
  useEffect(() => {
    if (flow.loaded && previous.current !== flow.stage) {
      heading.current?.focus({ preventScroll: false });
      previous.current = flow.stage;
    }
  }, [flow.stage, flow.loaded]);
  if (!flow.loaded) return <div className={styles.loading} role="status">Preparing your appointment…</div>;
  const loggedIn = Boolean(flow.verifiedPhone) && flow.verifiedPhone === flow.patient.phone;
  const current = presentation ? flow.stage === "appointment" ? 0 : flow.stage === "confirmation" ? 3 : loggedIn ? 2 : 1
    : flow.stage === "appointment" ? 0 : flow.stage === "confirmation" ? 2 : 1;
  const steps = presentation ? ["Time", "Log in", "Patient", "Confirmed"] : ["Choose time", "Patient & payment", "Confirmed"];
  const title = flow.stage === "appointment" ? "Find a time that fits." : flow.stage === "checkout"
    ? presentation && !loggedIn ? "Log in to continue." : "Your appointment, nearly there."
    : flow.stage === "payment" ? "One last step." : presentation
      ? flow.receipt?.status === "cancelled" ? "Appointment cancelled." : "Appointment confirmed." : "Your booking preview.";
  return <div className={styles.flow} data-journey-design={variant} data-journey-booking-content>
    <header className={styles.header} data-login-journey={presentation || undefined}>
      <div><h1 ref={heading} tabIndex={-1}>{title}</h1>{!presentation && <p>Demo booking · No real appointment or payment</p>}</div>
      <nav aria-label="Booking progress"><ol>{steps.map((label, index) =>
        <li key={label} aria-current={index === current ? "step" : undefined} data-complete={index < current || undefined}>
          <span>{index < current ? <Check size={12} aria-hidden /> : index + 1}</span><span>{label}</span>{index < steps.length - 1 && <ChevronRight size={12} aria-hidden />}
        </li>)}</ol></nav>
    </header>
    {flow.notice && <div className={styles.notice} role="status"><Info size={17} aria-hidden /><p>{flow.notice}</p></div>}
    {flow.recoveryUnavailable && <div className={styles.notice} role="status"><Info size={17} aria-hidden /><p>{presentation ? "We couldn’t save your progress. Keep this page open to finish booking." : "Draft recovery is unavailable. Keep this tab open to finish; reloading may require patient details again."}</p></div>}
    <div className={styles.layout}>
      <div className={styles.context}>
        <AppointmentContext doctor={doctor} selection={flow.selection} onChange={flow.stage !== "appointment" && flow.stage !== "confirmation" ? flow.editTime : undefined}
          seconds={flow.seconds} showHold={Boolean(flow.hold && !flow.receipt)} expired={flow.expired} variant={variant} />
        <div className={styles.assistance}><Phone size={16} aria-hidden /><p>Need a hand?<a href="tel:18602080208">Talk to our care team</a></p></div>
        {!presentation && <p className={styles.privacy}>Preview drafts expire after 30 minutes. Use sample details to explore.</p>}
      </div>
      <section className={styles.main} aria-label="Complete your appointment">
        {flow.expired && flow.stage !== "appointment" && <div className={styles.expired} role="alert"><Clock3 size={19} aria-hidden /><div><strong>{presentation ? "Your slot hold has ended." : "Your preview hold has ended."}</strong><p>Your patient details are kept. Choose a time to continue.</p></div><button type="button" onClick={flow.editTime}>Choose another time</button></div>}
        {!flow.expired && flow.hold && flow.seconds <= 120 && <p className={styles.warning} role="status">Less than two minutes remain. Finish checkout or choose another time; your patient details will stay.</p>}
        {flow.stage === "appointment" && <SlotPicker key={`${flow.selection.doctorId}-${flow.selection.time}`} doctor={doctor} selection={flow.selection} now={flow.now} onSelect={flow.selectTime}
          onCancel={flow.selection.time && !flow.expired ? flow.keepTime : undefined} variant={variant} />}
        {flow.stage === "checkout" && (presentation
          ? <Design14PatientCheckout patient={flow.patient} onChange={flow.setPatient} verifiedPhone={flow.verifiedPhone} onVerify={flow.setVerifiedPhone}
            payment={flow.payment} onPayment={flow.setPayment} mode={flow.selection.mode} fee={doctor.fee} onSubmit={flow.submit} expired={flow.expired} busy={flow.busy}
            savedPatients={[...defaultExistingPatients(flow.verifiedPhone), ...flow.savedPatients]} onAddPatient={flow.addPatient} />
          : <PatientCheckout patient={flow.patient} onChange={flow.setPatient} verifiedPhone={flow.verifiedPhone} onVerify={flow.setVerifiedPhone}
            payment={flow.payment} onPayment={flow.setPayment} mode={flow.selection.mode} fee={doctor.fee} onSubmit={flow.submit} expired={flow.expired} busy={flow.busy} />)}
        {flow.stage === "payment" && <PaymentPreview fee={doctor.fee} expired={flow.expired} busy={flow.busy} failed={flow.failed}
          onSuccess={() => { void flow.finish(true); }} onFailure={() => flow.setFailed(true)} onRetry={flow.retryPayment} onCancel={flow.cancelPayment} onExpire={flow.expire} variant={variant} />}
        {flow.stage === "confirmation" && flow.receipt && <div className={styles.receipt} data-journey-palette="light">
          <ConfirmationStep doctor={doctor} design={variant} receipt={flow.receipt} patientName={flow.patient.name}
            onCancel={flow.cancelReceipt} onNewPreview={flow.startNew} returnHref={returnHref} />
        </div>}
      </section>
    </div>
    <Link href={returnHref} className={styles.back}>Back to your doctor results</Link>
  </div>;
}
