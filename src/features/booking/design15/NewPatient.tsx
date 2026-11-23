"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Gender, PatientRelation } from "../types";
import type { PatientDraft } from "../design7/model";
import type { AuthIdentity } from "./auth";
import { patientErrors, patientForIdentity } from "./model";
import styles from "./Booking.module.css";

export default function NewPatient({ identity, onSave, onCancel }: { identity: AuthIdentity; onSave: (patient: PatientDraft) => void; onCancel: () => void }) {
  const [patient, setPatient] = useState(() => patientForIdentity(identity));
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { document.getElementById("d15-new-name")?.focus(); }, []);
  const update = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => setPatient(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...patient, name: patient.name.trim() };
    const errors = patientErrors(next, identity);
    setErrors(errors);
    if (Object.keys(errors).length) {
      const first = ["name", "age", "gender", "relation"].find(key => errors[key]);
      if (first) document.getElementById(`d15-new-${first}`)?.focus();
      return;
    }
    onSave(next);
  };
  return <form onSubmit={submit} noValidate className={styles.form} aria-labelledby="d15-new-patient-heading">
    <header className={styles.sectionHeading}><h2 id="d15-new-patient-heading">Add a patient</h2><p>Use their details as they appear on medical records.</p></header>
    <div className={styles.field}><label htmlFor="d15-new-name">Full name</label><input id="d15-new-name" autoComplete="name" maxLength={80} value={patient.name} onChange={event => update("name", event.target.value)} placeholder="Patient’s full name" aria-required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "d15-name-error" : undefined} />{errors.name && <p id="d15-name-error" className={styles.error}>{errors.name}</p>}</div>
    <div className={styles.twoColumns}><div className={styles.field}><label htmlFor="d15-new-age">Age</label><input id="d15-new-age" inputMode="numeric" maxLength={3} value={patient.age} onChange={event => update("age", event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Years" aria-required aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? "d15-age-error" : undefined} />{errors.age && <p id="d15-age-error" className={styles.error}>{errors.age}</p>}</div>
      <div className={styles.field}><label htmlFor="d15-new-gender">Gender</label><select id="d15-new-gender" value={patient.gender} onChange={event => update("gender", event.target.value as Gender | "")} aria-required aria-invalid={Boolean(errors.gender)} aria-describedby={errors.gender ? "d15-gender-error" : undefined}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other / prefer not to say</option></select>{errors.gender && <p id="d15-gender-error" className={styles.error}>{errors.gender}</p>}</div></div>
    <div className={styles.field}><label htmlFor="d15-new-relation">Relationship</label><select id="d15-new-relation" value={patient.relation} onChange={event => update("relation", event.target.value as PatientRelation)}><option value="self">Myself</option><option value="spouse">Spouse</option><option value="child">Child</option><option value="parent">Parent</option><option value="other">Someone else</option></select></div>
    <div className={styles.actions}><button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button><button type="submit" className={styles.primary}>Save patient</button></div>
  </form>;
}
