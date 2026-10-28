"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, CreditCard, Plus, UserRound } from "lucide-react";
import { DEMO_VERIFICATION_CODE, EMPTY_PATIENT, validatePatient, type PatientDraft, type PaymentChoice } from "../design7/model";
import type { ConsultationType, PatientRelation } from "../types";
import NewPatientForm from "./NewPatientForm";
import { samePatientDetails, type SavedPatient } from "./patients";
import styles from "./PatientCheckout.module.css";

interface Props {
  patient: PatientDraft;
  onChange: (patient: PatientDraft) => void;
  verifiedPhone: string;
  onVerify: (phone: string) => void;
  payment: PaymentChoice;
  onPayment: (choice: PaymentChoice) => void;
  mode: ConsultationType;
  fee: string;
  onSubmit: () => void;
  expired: boolean;
  busy: boolean;
  savedPatients: SavedPatient[];
  onAddPatient: (patient: PatientDraft) => void;
}

const RELATION_LABELS: Record<PatientRelation, string> = { self: "Myself", spouse: "Spouse", child: "Child", parent: "Parent", other: "Family / other" };
const MAX_PATIENTS = 10;

export default function PatientCheckout({ patient, onChange, verifiedPhone, onVerify, payment, onPayment, mode, fee, onSubmit, expired, busy, savedPatients, onAddPatient }: Props) {
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const selectionForm = useRef<HTMLFormElement>(null);
  const verified = /^[6-9]\d{9}$/.test(verifiedPhone) && verifiedPhone === patient.phone;
  const otpRequested = Boolean(sentTo) && sentTo === patient.phone;
  const selected = verified ? savedPatients.find((entry) => samePatientDetails(entry.patient, patient)) : undefined;
  const hasSelection = Boolean(selected) && Object.keys(validatePatient(patient, verifiedPhone)).length === 0;
  const canAdd = savedPatients.length < MAX_PATIENTS;
  const selectedPayment = mode === "video" ? "online" : payment;
  const actionLabel = busy ? "Processing…" : selectedPayment === "online" ? `Pay ${fee} & book` : "Confirm booking · Pay at hospital";

  const focus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());
  const changeNumber = () => {
    onVerify("");
    onChange({ ...EMPTY_PATIENT, phone: patient.phone });
    setSentTo(""); setCode(""); setPhoneError(""); setCodeError(""); setAdding(false); setSelectionError(""); setAnnouncement("");
    focus("d14-phone");
  };
  const changePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const phone = (digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits).slice(0, 10);
    onChange({ ...EMPTY_PATIENT, phone });
    onVerify(""); setSentTo(""); setCode(""); setPhoneError(""); setCodeError(""); setSelectionError("");
  };
  const sendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(patient.phone)) {
      setPhoneError("Enter a valid 10-digit mobile number.");
      focus("d14-phone");
      return;
    }
    setSentTo(patient.phone); setCode(""); setCodeError(""); setPhoneError("");
    focus("d14-otp");
  };
  const verifyOtp = (value: string) => {
    if (value.length !== 6) {
      setCodeError("Enter the complete 6-digit OTP.");
      focus("d14-otp");
      return;
    }
    if (sentTo !== patient.phone || value !== DEMO_VERIFICATION_CODE) {
      setCodeError("That OTP isn’t correct. Please try again.");
      return;
    }
    onVerify(patient.phone);
    setCodeError(""); setSelectionError(""); setAnnouncement("Mobile number verified. Choose a patient to continue.");
    focus("d14-patient-heading");
  };
  const acceptOtp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits); setCodeError("");
    if (digits.length === 6) verifyOtp(digits);
  };
  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (otpRequested) verifyOtp(code); else sendOtp();
  };
  const choosePatient = (entry: SavedPatient) => {
    onChange({ ...entry.patient, phone: verifiedPhone });
    setSelectionError(""); setAnnouncement(`Appointment for ${entry.patient.name}.`);
  };
  const savePatient = (value: PatientDraft) => {
    const next = { ...value, phone: verifiedPhone };
    const existing = savedPatients.find((entry) => samePatientDetails(entry.patient, next));
    if (!existing) onAddPatient(next);
    onChange(next);
    setAdding(false); setSelectionError(""); setAnnouncement(`${next.name} saved and selected.`);
    requestAnimationFrame(() => {
      const selectedInput = selectionForm.current?.querySelector<HTMLInputElement>('input[name="d14-patient"]:checked');
      if (selectedInput) selectedInput.focus(); else document.getElementById("d14-patient-heading")?.focus();
    });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (expired || busy || adding) return;
    if (!verified || !hasSelection) {
      setSelectionError("Choose a patient to continue with your booking.");
      focus(verified ? "d14-patient-heading" : "d14-phone");
      return;
    }
    if (mode === "video" && payment !== "online") { onPayment("online"); return; }
    onSubmit();
  };

  return <div className={styles.checkout} data-journey-palette="light">
    <div className={styles.panel}>
      {!verified ? <form id="d14-login-form" className={styles.login} noValidate onSubmit={login} aria-labelledby="d14-login-heading" aria-busy={busy}>
        <header className={styles.heading}><h2 id="d14-login-heading">Log in to continue</h2><p>Use your mobile number to book your appointment.</p></header>
        {!otpRequested ? <>
          <div className={styles.field}>
            <label htmlFor="d14-phone">Mobile number</label>
            <div className={styles.phoneControl} data-invalid={Boolean(phoneError) || undefined}><span>+91</span><input id="d14-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={patient.phone} placeholder="10-digit mobile number" onChange={(event) => changePhone(event.target.value)} disabled={busy} aria-required aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? "d14-phone-error" : undefined} /></div>
            {phoneError && <p id="d14-phone-error" className={styles.error} role="alert">{phoneError}</p>}
          </div>
          <button type="submit" className={`${styles.primary} ${styles.loginAction}`} disabled={busy}>Send OTP<ArrowRight size={17} aria-hidden /></button>
        </> : <>
          <div className={styles.numberSummary}><span>+91 {patient.phone}</span><button type="button" onClick={changeNumber} disabled={busy}>Change number</button></div>
          <div className={styles.field}>
            <label htmlFor="d14-otp">Enter OTP</label>
            <input id="d14-otp" className={styles.otpInput} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} placeholder="6-digit OTP" onChange={(event) => acceptOtp(event.target.value)} onPaste={(event) => { event.preventDefault(); acceptOtp(event.clipboardData.getData("text")); }} disabled={busy} aria-required aria-invalid={Boolean(codeError)} aria-describedby={codeError ? "d14-otp-error" : "d14-otp-help"} />
            <p id="d14-otp-help" className={styles.hint}>Enter all six digits to continue.</p>
            {codeError && <p id="d14-otp-error" className={styles.error} role="alert">{codeError}</p>}
          </div>
          <div className={styles.loginActions}><button type="button" className={styles.secondary} onClick={sendOtp} disabled={busy}>Resend OTP</button><button type="submit" className={styles.primary} disabled={busy}>Continue<ArrowRight size={17} aria-hidden /></button></div>
        </>}
      </form> : <>
        <div className={styles.accountBar}><CheckCircle2 size={19} aria-hidden /><div><span>Mobile verified</span><strong>+91 {verifiedPhone}</strong></div><button type="button" onClick={changeNumber} disabled={busy}>Change number</button></div>
        {adding ? <NewPatientForm phone={verifiedPhone} busy={busy} onSave={savePatient} onCancel={() => { setAdding(false); focus("d14-add-patient"); }} />
          : <form id="d13-checkout-form" ref={selectionForm} noValidate onSubmit={submit} aria-labelledby="d14-patient-heading" aria-busy={busy}>
            <header className={styles.heading}><h2 id="d14-patient-heading" tabIndex={-1}>Who is this appointment for?</h2><p>Choose a patient to continue.</p></header>
            <fieldset className={styles.patientChoices}><legend className={styles.srOnly}>Select a patient</legend>
              {savedPatients.map((entry) => <label className={styles.patientCard} key={entry.id} data-selected={selected?.id === entry.id || undefined}>
                <input type="radio" name="d14-patient" value={entry.id} checked={selected?.id === entry.id} onChange={() => choosePatient(entry)} disabled={busy} />
                <span className={styles.avatar}><UserRound size={20} aria-hidden /></span><span className={styles.patientIdentity}><strong>{entry.patient.name}</strong><small>{entry.patient.age} years · {RELATION_LABELS[entry.patient.relation]}</small></span><span className={styles.radioMark} aria-hidden>{selected?.id === entry.id && <Check size={12} />}</span>
              </label>)}
            </fieldset>
            {!savedPatients.length && <p className={styles.hint}>Add a patient to continue with this appointment.</p>}
            <button id="d14-add-patient" type="button" className={styles.addPatient} onClick={() => { setAdding(true); setSelectionError(""); focus("d14-new-name"); }} disabled={busy || !canAdd}><Plus size={17} aria-hidden />Add patient</button>
            {!canAdd && <p className={styles.hint}>You can keep up to {MAX_PATIENTS} patients. Choose an existing patient to continue.</p>}
            {selectionError && <p className={styles.error} role="alert">{selectionError}</p>}
            {hasSelection && <fieldset className={styles.paymentSection}><legend>How would you like to pay?</legend>
              <div className={styles.paymentChoices}>
                <label className={styles.paymentCard} data-selected={selectedPayment === "online" || undefined}><input type="radio" name="d14-payment" value="online" checked={selectedPayment === "online"} onChange={() => onPayment("online")} disabled={busy} /><CreditCard size={20} aria-hidden /><span><strong>Pay online</strong><small>UPI or card</small></span><span className={styles.radioMark} aria-hidden>{selectedPayment === "online" && <Check size={12} />}</span></label>
                {mode === "hospital" && <label className={styles.paymentCard} data-selected={selectedPayment === "hospital" || undefined}><input type="radio" name="d14-payment" value="hospital" checked={selectedPayment === "hospital"} onChange={() => onPayment("hospital")} disabled={busy} /><Building2 size={20} aria-hidden /><span><strong>Pay at hospital</strong><small>Pay at reception</small></span><span className={styles.radioMark} aria-hidden>{selectedPayment === "hospital" && <Check size={12} />}</span></label>}
              </div>
              {mode === "video" && <p className={styles.hint}>Video appointments use online payment.</p>}
            </fieldset>}
          </form>}
      </>}
      {expired && <p className={`${styles.error} ${styles.expiry}`} role="alert">This appointment time has expired. Choose a new time to continue.</p>}
    </div>
    {verified && hasSelection && !adding && <div className={styles.actionBar}>
      <div className={styles.total}><span>Consultation fee</span><strong>{fee}</strong></div>
      <button type="submit" form="d13-checkout-form" className={styles.primary} disabled={expired || busy}>{actionLabel}<ArrowRight size={17} aria-hidden /></button>
    </div>}
    <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>
  </div>;
}
