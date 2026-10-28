"use client";

import { useRef, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { EMPTY_PATIENT, validatePatient, type PatientDraft } from "../design7/model";
import type { Gender, PatientRelation } from "../types";
import styles from "./PatientCheckout.module.css";

const RELATIONS: { value: PatientRelation; label: string }[] = [
  { value: "self", label: "Myself" }, { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" }, { value: "parent", label: "Parent" }, { value: "other", label: "Someone else" },
];

export default function NewPatientForm({ phone, busy, onSave, onCancel }: {
  phone: string;
  busy: boolean;
  onSave: (patient: PatientDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PatientDraft>(() => ({ ...EMPTY_PATIENT, phone }));
  const [submitted, setSubmitted] = useState(false);
  const emailDetails = useRef<HTMLDetailsElement>(null);
  const errors = submitted ? validatePatient(draft, phone) : {};
  const change = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const next = { ...draft, phone, name: draft.name.trim(), email: draft.email.trim() };
    const nextErrors = validatePatient(next, phone);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.email && emailDetails.current) emailDetails.current.open = true;
      const first = ["name", "age", "gender", "relation", "email"].find((key) => nextErrors[key]);
      requestAnimationFrame(() => { if (first) document.getElementById(`d14-new-${first}`)?.focus(); });
      return;
    }
    onSave({ ...next, age: String(Number(next.age)) });
  };

  return <form id="d14-add-patient-form" className={styles.newPatient} noValidate onSubmit={submit} aria-labelledby="d14-new-patient-heading" aria-busy={busy}>
    <header className={styles.heading}><h2 id="d14-new-patient-heading">Add patient</h2><p>Enter their details as they appear on medical records.</p></header>
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fullSpan}`}>
        <label htmlFor="d14-new-name">Full name <span aria-hidden>*</span></label>
        <input id="d14-new-name" autoComplete="name" maxLength={80} placeholder="Patient’s full name" value={draft.name} onChange={(event) => change("name", event.target.value)} disabled={busy} aria-required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "d14-new-name-error" : undefined} />
        {errors.name && <p id="d14-new-name-error" className={styles.error}>{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="d14-new-age">Age <span aria-hidden>*</span></label>
        <input id="d14-new-age" type="text" inputMode="numeric" maxLength={3} placeholder="Years" value={draft.age} onChange={(event) => change("age", event.target.value.replace(/\D/g, "").slice(0, 3))} disabled={busy} aria-required aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? "d14-new-age-error" : undefined} />
        {errors.age && <p id="d14-new-age-error" className={styles.error}>{errors.age}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="d14-new-gender">Gender <span aria-hidden>*</span></label>
        <select id="d14-new-gender" value={draft.gender} onChange={(event) => change("gender", event.target.value as Gender | "")} disabled={busy} aria-required aria-invalid={Boolean(errors.gender)} aria-describedby={errors.gender ? "d14-new-gender-error" : undefined}>
          <option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other / prefer not to say</option>
        </select>
        {errors.gender && <p id="d14-new-gender-error" className={styles.error}>{errors.gender}</p>}
      </div>
      <div className={`${styles.field} ${styles.fullSpan}`}>
        <label htmlFor="d14-new-relation">Relationship</label>
        <select id="d14-new-relation" value={draft.relation} onChange={(event) => change("relation", event.target.value as PatientRelation)} disabled={busy} aria-invalid={Boolean(errors.relation)} aria-describedby={errors.relation ? "d14-new-relation-error" : undefined}>
          {RELATIONS.map((relation) => <option key={relation.value} value={relation.value}>{relation.label}</option>)}
        </select>
        {errors.relation && <p id="d14-new-relation-error" className={styles.error}>{errors.relation}</p>}
      </div>
    </div>
    <details ref={emailDetails} className={styles.optionalDetails}>
      <summary>Email <span>(optional)</span><ChevronDown size={16} aria-hidden /></summary>
      <div className={styles.field}>
        <label htmlFor="d14-new-email">Email address</label>
        <input id="d14-new-email" type="email" autoComplete="email" maxLength={160} placeholder="you@example.com" value={draft.email} onChange={(event) => change("email", event.target.value)} disabled={busy} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "d14-new-email-error" : undefined} />
        {errors.email && <p id="d14-new-email-error" className={styles.error}>{errors.email}</p>}
      </div>
    </details>
    {submitted && Object.keys(errors).length > 0 && <p className={styles.error} role="alert">Please check the highlighted details.</p>}
    <div className={styles.formActions}><button type="button" className={styles.secondary} onClick={onCancel} disabled={busy}>Cancel</button><button type="submit" className={styles.primary} disabled={busy}>Save patient</button></div>
  </form>;
}
