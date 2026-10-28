"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Smartphone } from "lucide-react";
import { DEMO_VERIFICATION_CODE, type PatientDraft, validatePatient } from "./model";
import type { Gender, PatientRelation } from "../types";
import styles from "./Booking.module.css";

interface Props {
  patient: PatientDraft;
  onChange: (patient: PatientDraft) => void;
  verifiedPhone: string;
  onVerify: (phone: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PatientStep({ patient, onChange, verifiedPhone, onVerify, onBack, onContinue }: Props) {
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validatePatient(patient, verifiedPhone) : {};
  const verified = patient.phone === verifiedPhone && Boolean(verifiedPhone);
  const change = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => onChange({ ...patient, [key]: value });
  const sendCode = () => {
    if (!/^[6-9]\d{9}$/.test(patient.phone)) { setCodeError("Enter a valid 10-digit Indian mobile number first."); return; }
    setSentTo(patient.phone); setCode(""); setCodeError("");
  };
  const verify = () => {
    if (sentTo !== patient.phone || code !== DEMO_VERIFICATION_CODE) { setCodeError("Use the displayed preview code 123456."); return; }
    onVerify(patient.phone); setCodeError("");
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setSubmitted(true);
    const nextErrors = validatePatient(patient, verifiedPhone);
    if (!Object.keys(nextErrors).length) onContinue();
    else {
      const fields: Record<string, string> = { name: "d7-patient-name", age: "d7-patient-age", gender: "d7-patient-gender", phone: "d7-phone", email: "d7-email" };
      const invalid = fields[Object.keys(nextErrors)[0]];
      if (invalid) document.getElementById(invalid)?.focus();
    }
  };
  return <form className={styles.panel} onSubmit={submit} noValidate aria-labelledby="d7-patient-heading">
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>A LITTLE ABOUT YOU</span><h2 id="d7-patient-heading">Who is the appointment for?</h2><p>Use sample details to explore this preview. Personal details are not saved.</p></div>
    <div className={styles.sampleRow}><span>Exploring the complete experience?</span><button type="button" className={styles.textButton} onClick={() => {
      onChange({ name: "Alex Morgan", age: "32", gender: "other", relation: "self", phone: "9000000000", email: "" });
      onVerify(""); setSentTo(""); setCode(""); setCodeError(""); setSubmitted(false);
    }}>Use sample details</button></div>
    <fieldset className={styles.fieldset}><legend>Booking for</legend><div className={styles.relationRow}>
      {(["self", "spouse", "child", "parent", "other"] as PatientRelation[]).map(relation => <button key={relation} type="button" className={styles.choicePill} aria-pressed={patient.relation === relation} onClick={() => change("relation", relation)}>{relation === "self" ? "Myself" : relation}</button>)}
    </div></fieldset>
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fullSpan}`}><label htmlFor="d7-patient-name">Patient&apos;s full name <span aria-hidden>*</span></label>
        <input id="d7-patient-name" autoComplete="name" maxLength={80} value={patient.name} onChange={event => change("name", event.target.value)} aria-required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "d7-name-error" : undefined} placeholder="As it appears on your ID" />
        {errors.name && <span id="d7-name-error" className={styles.fieldError}>{errors.name}</span>}</div>
      <div className={styles.field}><label htmlFor="d7-patient-age">Age <span aria-hidden>*</span></label>
        <input id="d7-patient-age" type="number" min="0" max="120" inputMode="numeric" value={patient.age} onChange={event => change("age", event.target.value)} aria-required aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? "d7-age-error" : undefined} placeholder="Years" />
        {errors.age && <span id="d7-age-error" className={styles.fieldError}>{errors.age}</span>}</div>
      <div className={styles.field}><label htmlFor="d7-patient-gender">Gender <span aria-hidden>*</span></label>
        <select id="d7-patient-gender" value={patient.gender} onChange={event => change("gender", event.target.value as Gender | "")} aria-required aria-invalid={Boolean(errors.gender)} aria-describedby={errors.gender ? "d7-gender-error" : undefined}>
          <option value="">Select gender</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other / prefer not to say</option>
        </select>{errors.gender && <span id="d7-gender-error" className={styles.fieldError}>{errors.gender}</span>}</div>
    </div>
    <div className={styles.divider} />
    <div className={styles.subheading}><Smartphone size={19} aria-hidden /><div><h3>Contact & verification</h3><p>Demo verification only. No text message is sent.</p></div></div>
    <div className={styles.field}><label htmlFor="d7-phone">Mobile number <span aria-hidden>*</span></label>
      <div className={styles.phoneRow}><span className={styles.countryCode}>+91</span><input id="d7-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit mobile number" value={patient.phone}
        onChange={event => { change("phone", event.target.value.replace(/\D/g, "").slice(0, 10)); onVerify(""); setCodeError(""); }}
        aria-required aria-invalid={Boolean(errors.phone)} aria-describedby="d7-phone-help" />
        {verified ? <span className={styles.verified}><Check size={15} aria-hidden />Verified</span> : <button type="button" className={styles.secondary} onClick={sendCode}>{sentTo === patient.phone && sentTo ? "Resend demo code" : "Get demo code"}</button>}</div>
      <span id="d7-phone-help" className={errors.phone ? styles.fieldError : styles.fieldHint}>{errors.phone || "Use a sample number to try the preview."}</span>
    </div>
    {sentTo === patient.phone && sentTo && !verified && <div className={styles.verification}>
      <p>Preview code: <strong>{DEMO_VERIFICATION_CODE}</strong></p><div className={styles.verifyRow}><label className={styles.srOnly} htmlFor="d7-code">Six-digit demo verification code</label>
        <input id="d7-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} placeholder="Enter 6-digit code" onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <button type="button" className={styles.secondary} onClick={verify}>Verify demo code</button></div>
    </div>}
    {codeError && <p className={styles.fieldError} role="alert">{codeError}</p>}
    <div className={styles.field}><label htmlFor="d7-email">Email <span className={styles.optional}>(optional)</span></label><input id="d7-email" type="email" autoComplete="email" maxLength={160} placeholder="you@example.com" value={patient.email} onChange={event => change("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "d7-email-error" : undefined} />{errors.email && <span id="d7-email-error" className={styles.fieldError}>{errors.email}</span>}</div>
    {submitted && Object.keys(errors).length > 0 && <p className={styles.fieldError} role="alert">Please check the highlighted details before continuing.</p>}
    <div className={styles.actions}><button className={styles.backButton} type="button" onClick={onBack}><ArrowLeft size={17} aria-hidden />Appointment</button><button className={styles.primary} type="submit">Review appointment <ArrowRight size={18} aria-hidden /></button></div>
  </form>;
}
