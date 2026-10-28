"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Clock3, Info } from "lucide-react";
import { resolveJourneyDesign } from "@/features/design-preview/journeyDesigns";
import type { BookingDoctorSummary } from "../types";
import { getDesign3BookingSlots, isDesign3BookingSlotAvailable } from "../design3Availability";
import {
  EMPTY_PATIENT, HOLD_DURATION_MS, clearCheckout, createPreviewReceipt, getOrCreateHold,
  holdIsActive, readCheckout, remainingHoldSeconds, sameSelection, storeCheckout, validatePatient,
  type AppointmentSelection, type PatientDraft, type PaymentChoice, type PreviewReceipt, type SlotHold,
} from "./model";
import AppointmentStep, { appointmentDates } from "./AppointmentStep";
import PatientStep from "./PatientStep";
import ReviewStep from "./ReviewStep";
import DemoPaymentStep from "./DemoPaymentStep";
import ConfirmationStep from "./ConfirmationStep";
import BookingSummary from "./BookingSummary";
import { bookingDirectoryHref } from "./navigation";
import styles from "./Booking.module.css";

type Step = "appointment" | "patient" | "review" | "payment" | "confirmation";
const STEPS = [{ id: "appointment", label: "Appointment" }, { id: "patient", label: "Patient details" }, { id: "review", label: "Review & pay" }, { id: "confirmation", label: "Confirmation" }] as const;
const STEP_COPY: Record<Step, { title: string; description: string }> = {
  appointment: { title: "Make time for your health.", description: "Choose your visit and a time that suits you." },
  patient: { title: "A little about you.", description: "Add patient details and try the demo mobile verification." },
  review: { title: "Check your appointment.", description: "Review the details, then choose how you’d like to pay." },
  payment: { title: "Complete your payment.", description: "Try the dummy checkout. No real payment is collected." },
  confirmation: { title: "Your booking preview.", description: "Your appointment details, together in one place." },
};

function setReceiptUrl(ref?: string) {
  const url = new URL(window.location.href);
  if (ref) url.searchParams.set("receipt", ref); else url.searchParams.delete("receipt");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function initialSelection(doctor: BookingDoctorSummary, params: URLSearchParams, now: number): AppointmentSelection {
  const hospitals = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const hospital = hospitals.find(item => item.name === params.get("hospital"))?.name
    ?? hospitals.find(item => item.name === doctor.hospital)?.name
    ?? hospitals[0]?.name ?? doctor.hospital;
  const dates = appointmentDates(now);
  const offers = (mode: "hospital" | "video") => dates.some(date => getDesign3BookingSlots(doctor.id, date, mode, hospital, new Date(now)).some(slot => slot.available));
  const requestedMode = params.get("mode") === "video" ? "video" : "hospital";
  const mode = offers(requestedMode) ? requestedMode : offers("hospital") ? "hospital" : "video";
  const requestedDate = params.get("date") === "today" ? dates[0] : params.get("date") === "tomorrow" ? dates[1] : params.get("date");
  const date = dates.includes(requestedDate ?? "") ? requestedDate! : dates.find(day => getDesign3BookingSlots(doctor.id, day, mode, hospital, new Date(now)).some(slot => slot.available)) ?? dates[0];
  const requestedTime = params.get("time") ?? "";
  const time = isDesign3BookingSlotAvailable(doctor.id, date, requestedTime, mode, hospital, new Date(now)) ? requestedTime : "";
  return { doctorId: doctor.id, mode, hospital, date, time };
}

export default function Design7BookingFlow({ doctor }: { doctor: BookingDoctorSummary }) {
  const params = useSearchParams();
  const design = resolveJourneyDesign(params.get("design"));
  const initialParams = useRef(params.toString());
  const initialDoctor = useRef(doctor);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>("appointment");
  const [selection, setSelection] = useState<AppointmentSelection>({ doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "", time: "" });
  const [patient, setPatient] = useState<PatientDraft>({ ...EMPTY_PATIENT });
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [hold, setHold] = useState<SlotHold | null>(null);
  const [receipt, setReceipt] = useState<PreviewReceipt | null>(null);
  const [payment, setPayment] = useState<PaymentChoice>("online");
  const [accepted, setAccepted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const committing = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<Step>("appointment");

  useEffect(() => {
    const doctor = initialDoctor.current;
    const time = Date.now();
    const saved = readCheckout(doctor.id);
    const query = new URLSearchParams(initialParams.current);
    const fallback = initialSelection(doctor, query, time);
    setNow(time);
    if (saved?.receipt && query.get("receipt") === saved.receipt.ref) {
      setSelection(saved.selection); setReceipt(saved.receipt); setPayment(saved.receipt.payment); setStep("confirmation");
    } else if (saved?.hold && holdIsActive(saved.hold, saved.selection, time) && isDesign3BookingSlotAvailable(doctor.id, saved.selection.date, saved.selection.time, saved.selection.mode, saved.selection.hospital, new Date(time))) {
      setSelection(saved.selection); setHold(saved.hold); setStep("patient");
      setNotice("Your original slot hold is still running. Re-enter patient and contact details to continue; those details are never saved.");
    } else {
      setSelection(fallback);
      if (saved?.hold) { clearCheckout(doctor.id); setNotice("Your previous preview hold has expired. Choose an available time to start again."); }
      else if (query.has("receipt")) { setReceiptUrl(); setNotice("This preview receipt is no longer available in this tab. You can start a new booking below."); }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh); window.addEventListener("pageshow", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("pageshow", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    if (!loaded || !selection.time) return;
    if (!storeCheckout({ version: 1, selection, hold, receipt })) setStorageUnavailable(true);
  }, [loaded, selection, hold, receipt]);

  useEffect(() => {
    if (step !== previousStep.current) { heading.current?.focus({ preventScroll: false }); previousStep.current = step; }
  }, [step]);

  const slotAvailable = (value = selection, time = Date.now()) => isDesign3BookingSlotAvailable(doctor.id, value.date, value.time, value.mode, value.hospital, new Date(time));
  const expired = Boolean(hold && !receipt && !holdIsActive(hold, selection, now));
  const holdSeconds = remainingHoldSeconds(hold, now);
  const stepIndex = step === "payment" ? 2 : STEPS.findIndex(item => item.id === step);

  const changeSelection = (value: AppointmentSelection) => {
    if (!sameSelection(selection, value)) {
      setHold(null); setReceipt(null); setAccepted(false); setFailed(false); committing.current = false;
      clearCheckout(doctor.id);
    }
    if (value.mode === "video") setPayment("online");
    setSelection(value); setNotice("");
  };
  const chooseAgain = (message = "") => {
    setHold(null); setReceipt(null); setSelection(value => ({ ...value, time: "" }));
    setAccepted(false); setFailed(false); setBusy(false); committing.current = false;
    clearCheckout(doctor.id); setReceiptUrl(); setNotice(message); setStep("appointment");
  };
  const continueAppointment = () => {
    if (!slotAvailable()) { setNotice("That time is no longer available. Please choose a current appointment time."); return; }
    setNotice(""); setStep("patient");
  };
  const continuePatient = () => {
    const time = Date.now(); setNow(time);
    if (Object.keys(validatePatient(patient, verifiedPhone)).length) return;
    if (!slotAvailable(selection, time) || (hold && !holdIsActive(hold, selection, time))) { chooseAgain("The original hold or appointment time has expired. Your patient details are still here; choose a new time."); return; }
    setHold(getOrCreateHold(hold, selection, time)); setNotice(""); setStep("review");
  };
  const finish = (gatewaySucceeded: boolean) => {
    if (committing.current || receipt) return;
    const time = Date.now(); setNow(time);
    if (!accepted || Object.keys(validatePatient(patient, verifiedPhone)).length) { setStep("patient"); setNotice("Please check and verify the patient details before confirming."); return; }
    const next = createPreviewReceipt(hold, selection, payment, gatewaySucceeded, slotAvailable(selection, time), time);
    if (!next) { chooseAgain("Your preview hold or selected time has expired. No payment was processed. Choose a new time to continue."); return; }
    committing.current = true; setBusy(true);
    // This is deliberately local only: no payment, booking, auth or SMS endpoint is called.
    setReceipt(next); setHold(null); setFailed(false); setBusy(false); setNotice(""); setStep("confirmation");
    setReceiptUrl(next.ref);
    if (!storeCheckout({ version: 1, selection, hold: null, receipt: next })) setStorageUnavailable(true);
  };
  const continueReview = () => {
    const time = Date.now(); setNow(time);
    if (!holdIsActive(hold, selection, time) || !slotAvailable(selection, time)) { chooseAgain("Your preview hold has expired. Choose a new time to continue."); return; }
    if (!accepted) return;
    if (payment === "hospital") finish(false);
    else { setFailed(false); setNotice(""); setStep("payment"); }
  };
  const expirePreview = () => {
    const time = Date.now();
    setHold(value => value ? { ...value, createdAt: time - HOLD_DURATION_MS - 1, expiresAt: time - 1 } : value);
    setNow(time);
  };
  const cancelReceipt = () => {
    if (!receipt) return;
    const next: PreviewReceipt = { ...receipt, status: "cancelled" };
    setReceipt(next);
    storeCheckout({ version: 1, selection, hold: null, receipt: next });
  };
  const editStep = (next: "appointment" | "patient") => { setAccepted(false); setStep(next); setNotice(""); };

  if (!loaded) return <div className={styles.loading} role="status">Preparing your appointment…</div>;
  return <div className={styles.flow} data-journey-design={design}>
    <div className={styles.intro} data-journey-palette={design === "d9" ? "dark" : undefined}>
    <div className={styles.flowHeader}><Link href={bookingDirectoryHref(design, doctor.city, selection.mode)} className={styles.backButton}><ArrowLeft size={17} aria-hidden />Find doctors</Link>
      <span className={styles.demoBadge}>INTERACTIVE PREVIEW · NO REAL BOOKING</span>
    </div>
    <div className={styles.flowTitle}><span className={styles.eyebrow}>YOUR NEXT STEP TO BETTER HEALTH</span><h1 ref={heading} tabIndex={-1}>{STEP_COPY[step].title}</h1><p>{STEP_COPY[step].description}</p></div>
    <nav className={styles.steps} aria-label="Booking progress"><ol>{STEPS.map((item, index) => <li key={item.id} data-current={index === stepIndex || undefined} data-complete={index < stepIndex || undefined}>
      <span className={styles.stepNumber} aria-hidden>{index < stepIndex ? <Check size={15} /> : String(index + 1).padStart(2, "0")}</span>
      <span aria-current={index === stepIndex ? "step" : undefined}>{item.label}</span>
    </li>)}</ol></nav>
    </div>
    {notice && <div className={styles.notice} role="status"><Info size={18} aria-hidden /><span>{notice}</span></div>}
    {storageUnavailable && <div className={styles.notice} role="status"><Info size={18} aria-hidden /><span>This browser cannot save preview selections. Keep this page open to finish; a refresh will clear the hold and receipt.</span></div>}
    {expired && <div className={styles.expiredNotice} role="alert"><Clock3 size={23} aria-hidden /><div><strong>Your 15-minute preview hold has ended.</strong><p>Nothing was charged. Your patient details are still here; choose another available time to continue.</p></div><button type="button" className={styles.secondary} onClick={() => chooseAgain()}>Choose a new time</button></div>}
    {!expired && hold && !receipt && hold.expiresAt - now <= 120_000 && <div className={styles.timeWarning} role="status">Less than two minutes remain on your preview hold. Finish checkout or choose a new time if you need longer.</div>}
    {hold && !receipt && <div className={styles.mobileHold} data-urgent={holdSeconds <= 120 || undefined}>
      <Clock3 size={17} aria-hidden /><span>{expired ? "Preview hold expired" : "Your preview slot is held"}</span>
      <strong role="timer" aria-label={`${Math.floor(holdSeconds / 60)} minutes and ${holdSeconds % 60} seconds remaining`}>{String(Math.floor(holdSeconds / 60)).padStart(2, "0")}:{String(holdSeconds % 60).padStart(2, "0")}</strong>
    </div>}
    <div className={styles.layout} data-journey-booking-content>
      <div className={styles.mainColumn} data-journey-palette={design === "d12" ? "light" : undefined}>
        {step === "appointment" && <AppointmentStep doctor={doctor} selection={selection} now={now} onChange={changeSelection} onContinue={continueAppointment} />}
        {step === "patient" && <PatientStep patient={patient} onChange={value => { setPatient(value); setAccepted(false); }} verifiedPhone={verifiedPhone} onVerify={setVerifiedPhone} onBack={() => editStep("appointment")} onContinue={continuePatient} />}
        {step === "review" && <ReviewStep doctor={doctor} selection={selection} patient={patient} payment={payment} onPayment={setPayment} accepted={accepted} onAccepted={setAccepted} onEdit={editStep} onContinue={continueReview} expired={expired} busy={busy} />}
        {step === "payment" && <DemoPaymentStep amount={doctor.fee} expired={expired} busy={busy} failed={failed} onSuccess={() => finish(true)} onFailure={() => setFailed(true)} onRetry={() => {
          const time = Date.now(); setNow(time);
          if (!holdIsActive(hold, selection, time)) chooseAgain("Your hold expired before the retry. Please choose a new time.");
          else setFailed(false);
        }} onCancel={() => { setStep("review"); setFailed(false); setNotice("Payment was cancelled. Nothing was charged. Your original slot hold continues."); }} onExpire={expirePreview} />}
        {step === "confirmation" && receipt && <ConfirmationStep doctor={doctor} design={design} receipt={receipt} patientName={patient.name} onCancel={cancelReceipt} onNewPreview={() => chooseAgain("Choose a new appointment time. This starts a new demonstration and replaces your previous preview in this tab.")} />}
      </div>
      <BookingSummary doctor={doctor} design={design} selection={selection} patientName={patient.name} hold={hold} now={now} complete={Boolean(receipt)} />
    </div>
  </div>;
}
