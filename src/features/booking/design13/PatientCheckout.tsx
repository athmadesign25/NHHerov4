"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, ChevronDown, CreditCard, Pencil, Plus, UserRound } from "lucide-react";
import { DEMO_VERIFICATION_CODE, EMPTY_PATIENT, validatePatient, type PatientDraft, type PaymentChoice } from "../design7/model";
import type { ConsultationType, Gender, PatientRelation } from "../types";
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
}

const SAMPLE_PROFILES = [
  { id: "alex", name: "Alex Morgan", age: "32", gender: "other", relation: "self", label: "Myself" },
  { id: "jamie", name: "Jamie Morgan", age: "8", gender: "other", relation: "child", label: "Child" },
] as const;
const relationLabels: Record<PatientRelation, string> = { self: "Myself", spouse: "Spouse", child: "Child", parent: "Parent", other: "Someone else" };
const genderLabels: Record<Gender, string> = { female: "Female", male: "Male", other: "Other / prefer not to say" };

export default function PatientCheckout({ patient, onChange, verifiedPhone, onVerify, payment, onPayment, mode, fee, onSubmit, expired, busy }: Props) {
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(() => verifiedPhone && verifiedPhone === patient.phone
    ? SAMPLE_PROFILES.find(profile => profile.name === patient.name && profile.age === patient.age &&
      profile.gender === patient.gender && profile.relation === patient.relation)?.id ?? "" : "");
  const emailDetails = useRef<HTMLDetailsElement>(null);
  const verified = Boolean(verifiedPhone) && verifiedPhone === patient.phone;
  const errors = submitted ? validatePatient(patient, verifiedPhone) : {};
  const saved = verified && SAMPLE_PROFILES.some((profile) => profile.id === selectedProfile &&
    profile.name === patient.name && profile.age === patient.age && profile.gender === patient.gender && profile.relation === patient.relation);
  const selectedPayment = mode === "video" ? "online" : payment;
  const actionLabel = busy ? "Processing…" : selectedPayment === "online" ? `Pay ${fee} & book` : "Confirm booking · Pay at hospital";
  const phoneMessage = phoneError || errors.phone;

  const focus = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());
  const change = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => {
    setSelectedProfile("");
    onChange({ ...patient, [key]: value });
  };
  const changePhone = (value: string) => {
    onChange({ ...patient, phone: value.replace(/\D/g, "").slice(0, 10) });
    onVerify("");
    setSentTo(""); setCode(""); setCodeError(""); setPhoneError("");
  };
  const sendCode = () => {
    if (!/^[6-9]\d{9}$/.test(patient.phone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      focus("d13-phone");
      return;
    }
    setSentTo(patient.phone); setCode(""); setCodeError(""); setPhoneError("");
    focus("d13-code");
  };
  const acceptCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits); setCodeError("");
    if (digits.length !== 6) return;
    if (sentTo !== patient.phone || digits !== DEMO_VERIFICATION_CODE) {
      setCodeError("Use the displayed demo code 123456.");
      return;
    }
    onVerify(patient.phone);
    setPhoneError("");
    focus("d13-verified");
  };
  const chooseProfile = (id: string) => {
    const profile = SAMPLE_PROFILES.find((item) => item.id === id);
    if (!profile) return;
    onChange({ name: profile.name, age: profile.age, gender: profile.gender, relation: profile.relation, phone: patient.phone, email: "" });
    setSelectedProfile(id);
  };
  const addPatient = () => {
    onChange({ ...EMPTY_PATIENT, phone: patient.phone });
    setSelectedProfile("");
    focus("d13-name");
  };
  const fillSample = () => {
    onChange({ name: "Alex Morgan", age: "32", gender: "other", relation: "self", phone: verified ? patient.phone : "9000000000", email: "" });
    if (!verified) onVerify("");
    setSelectedProfile(verified ? "alex" : "");
    setSentTo(""); setCode(""); setCodeError(""); setPhoneError(""); setSubmitted(false);
    if (!verified) focus("d13-send-code");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (expired || busy) return;
    setSubmitted(true);
    const nextErrors = validatePatient(patient, verifiedPhone);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.email && emailDetails.current) emailDetails.current.open = true;
      const first = ["phone", "name", "age", "gender", "relation", "email"].find((key) => nextErrors[key]);
      const target = first === "phone" && Boolean(sentTo) && sentTo === patient.phone && !verified ? "code" : first;
      if (target) focus(`d13-${target}`);
      return;
    }
    if (mode === "video" && payment !== "online") {
      onPayment("online");
      return;
    }
    onSubmit();
  };

  return <div className={styles.checkout} data-journey-palette="light">
    <form id="d13-checkout-form" className={styles.panel} onSubmit={submit} noValidate aria-labelledby="d13-checkout-heading" aria-busy={busy}>
      <header className={styles.heading}><h2 id="d13-checkout-heading">Patient & payment</h2><p>A few details, then you’re ready to book.</p></header>

      <div className={styles.field}>
        <label htmlFor="d13-phone">Mobile number <span aria-hidden>*</span></label>
        <div className={styles.phoneControl} data-invalid={Boolean(phoneMessage) || undefined}>
          <span className={styles.countryCode}>+91</span>
          <input id="d13-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={patient.phone} placeholder="10-digit mobile number" onChange={(event) => changePhone(event.target.value)} disabled={busy} aria-required aria-invalid={Boolean(phoneMessage)} aria-describedby="d13-phone-help" />
          {verified ? <span className={styles.verifiedIcon}><CheckCircle2 size={20} aria-label="Verified for preview" /></span>
            : <button id="d13-send-code" type="button" onClick={sendCode} disabled={busy}>{sentTo === patient.phone && sentTo ? "Resend demo code" : "Send demo code"}</button>}
        </div>
        <p id="d13-phone-help" className={phoneMessage ? styles.error : styles.hint}>{phoneMessage || "Demo verification only. No SMS is sent."}</p>
      </div>

      {sentTo === patient.phone && Boolean(sentTo) && !verified && <div className={styles.verification}>
        <label htmlFor="d13-code">Enter demo code <strong>{DEMO_VERIFICATION_CODE}</strong></label>
        <input id="d13-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} placeholder="6-digit code" disabled={busy} aria-invalid={Boolean(codeError)} aria-describedby={codeError ? "d13-code-error" : "d13-code-help"}
          onChange={(event) => acceptCode(event.target.value)}
          onPaste={(event) => { event.preventDefault(); acceptCode(event.clipboardData.getData("text")); }} />
        <p id="d13-code-help" className={styles.hint}>Paste or type the code. It verifies automatically.</p>
        {codeError && <p id="d13-code-error" className={styles.error} role="alert">{codeError}</p>}
      </div>}
      {verified && <p id="d13-verified" className={styles.verified} role="status" tabIndex={-1}><CheckCircle2 size={17} aria-hidden />Mobile verified for this preview</p>}

      {verified && <fieldset className={styles.samplePatients}>
        <legend>Choose a patient</legend><p className={styles.hint}>Fictional sample profiles for this preview.</p>
        <div className={styles.patientChoices}>
          {SAMPLE_PROFILES.map((profile) => <button type="button" key={profile.id} aria-pressed={saved && selectedProfile === profile.id} disabled={busy} onClick={() => chooseProfile(profile.id)}>
            <UserRound size={18} aria-hidden /><span><strong>{profile.name}</strong><small>{profile.age} years · {profile.label}</small></span>{saved && selectedProfile === profile.id && <Check size={16} aria-hidden />}
          </button>)}
          <button type="button" className={styles.addPatient} onClick={addPatient} disabled={busy}><Plus size={18} aria-hidden />Add patient</button>
        </div>
      </fieldset>}

      {saved ? <section className={styles.patientSummary} aria-label="Selected sample patient">
        <div><span className={styles.summaryLabel}>Patient details</span><strong>{patient.name}</strong><p>{patient.age} years · {genderLabels[patient.gender as Gender]} · {relationLabels[patient.relation]}</p></div>
        <button type="button" onClick={() => { setSelectedProfile(""); focus("d13-name"); }} disabled={busy}><Pencil size={15} aria-hidden />Edit</button>
      </section> : <section className={styles.patientSection} aria-labelledby="d13-patient-heading">
        <div className={styles.sectionHeading}><h3 id="d13-patient-heading">Patient details</h3><span>Required fields *</span></div>
        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.fullSpan}`}><label htmlFor="d13-name">Full name <span aria-hidden>*</span></label><input id="d13-name" autoComplete="name" maxLength={80} placeholder="Patient’s full name" value={patient.name} onChange={(event) => change("name", event.target.value)} disabled={busy} aria-required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "d13-name-error" : undefined} />{errors.name && <p className={styles.error} id="d13-name-error">{errors.name}</p>}</div>
          <div className={styles.field}><label htmlFor="d13-age">Age <span aria-hidden>*</span></label><input id="d13-age" type="number" inputMode="numeric" min={0} max={120} placeholder="Years" value={patient.age} onChange={(event) => change("age", event.target.value)} disabled={busy} aria-required aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? "d13-age-error" : undefined} />{errors.age && <p className={styles.error} id="d13-age-error">{errors.age}</p>}</div>
          <div className={styles.field}><label htmlFor="d13-gender">Gender <span aria-hidden>*</span></label><select id="d13-gender" value={patient.gender} onChange={(event) => change("gender", event.target.value as Gender | "")} disabled={busy} aria-required aria-invalid={Boolean(errors.gender)} aria-describedby={errors.gender ? "d13-gender-error" : undefined}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other / prefer not to say</option></select>{errors.gender && <p className={styles.error} id="d13-gender-error">{errors.gender}</p>}</div>
          <div className={`${styles.field} ${styles.fullSpan}`}><label htmlFor="d13-relation">Booking for</label><select id="d13-relation" value={patient.relation} onChange={(event) => change("relation", event.target.value as PatientRelation)} disabled={busy} aria-invalid={Boolean(errors.relation)} aria-describedby={errors.relation ? "d13-relation-error" : undefined}>{(Object.keys(relationLabels) as PatientRelation[]).map((relation) => <option value={relation} key={relation}>{relationLabels[relation]}</option>)}</select>{errors.relation && <p className={styles.error} id="d13-relation-error">{errors.relation}</p>}</div>
        </div>
      </section>}

      <details className={styles.optionalDetails} ref={emailDetails}>
        <summary>Email <span>(optional)</span><ChevronDown size={16} aria-hidden /></summary>
        <div className={styles.field}><label htmlFor="d13-email">Email address</label><input id="d13-email" type="email" autoComplete="email" maxLength={160} placeholder="you@example.com" value={patient.email} onChange={(event) => onChange({ ...patient, email: event.target.value })} disabled={busy} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "d13-email-error" : "d13-email-help"} /><p id="d13-email-help" className={styles.hint}>No email is sent in this preview.</p>{errors.email && <p className={styles.error} id="d13-email-error">{errors.email}</p>}</div>
      </details>

      <fieldset className={styles.paymentSection}>
        <legend>How would you like to pay?</legend>
        <div className={styles.paymentChoices}>
          <label className={styles.paymentOption} data-selected={selectedPayment === "online" || undefined}><input type="radio" name="d13-payment" value="online" checked={selectedPayment === "online"} onChange={() => onPayment("online")} disabled={busy} /><CreditCard size={20} aria-hidden /><span><strong>Pay online</strong><small>Demo UPI or card checkout</small></span><span className={styles.radioMark} aria-hidden>{selectedPayment === "online" && <Check size={12} />}</span></label>
          {mode === "hospital" && <label className={styles.paymentOption} data-selected={selectedPayment === "hospital" || undefined}><input type="radio" name="d13-payment" value="hospital" checked={selectedPayment === "hospital"} onChange={() => onPayment("hospital")} disabled={busy} /><Building2 size={20} aria-hidden /><span><strong>Pay at hospital</strong><small>Pay at reception before your visit</small></span><span className={styles.radioMark} aria-hidden>{selectedPayment === "hospital" && <Check size={12} />}</span></label>}
        </div>
        {mode === "video" && <p className={styles.hint}>Video appointments use online payment in this preview.</p>}
      </fieldset>

      <details className={styles.previewTools}><summary>Try a sample patient <ChevronDown size={16} aria-hidden /></summary><p>Fill fictional details to explore the complete booking preview.</p><button type="button" onClick={fillSample} disabled={busy}>Use Alex Morgan sample details</button></details>
      {submitted && Object.keys(errors).length > 0 && <p className={styles.error} role="alert">Please check the highlighted details to continue.</p>}
      {expired && <p className={styles.error} role="alert">Your preview slot hold has expired. Choose another appointment time to continue.</p>}
      <p className={styles.privacy}>Preview only. No real appointment, payment, SMS or email. Your draft is kept temporarily for recovery and expires after 30 minutes.</p>
    </form>

    <div className={styles.actionBar} data-journey-palette="light">
      <div className={styles.total}><span>Consultation fee</span><strong>{fee}</strong></div>
      <button type="submit" form="d13-checkout-form" className={styles.submit} disabled={expired || busy}>{actionLabel}<ArrowRight size={17} aria-hidden /></button>
    </div>
  </div>;
}
