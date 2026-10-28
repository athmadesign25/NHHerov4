"use client";

import { useState } from "react";
import { ArrowRight, Check, Plus, UserRound } from "lucide-react";
import type { SavedPatient } from "../design14/patients";
import type { PatientDraft } from "../design7/model";
import type { AuthIdentity } from "./auth";
import NewPatient from "./NewPatient";
import styles from "./Booking.module.css";

export default function PatientSelection({ identity, patients, selectedId, onSelect, onAdd, onContinue }: {
  identity: AuthIdentity; patients: SavedPatient[]; selectedId: string | null;
  onSelect: (id: string) => void; onAdd: (patient: PatientDraft) => void; onContinue: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const close = () => {
    setAdding(false);
    requestAnimationFrame(() => (document.getElementById("d15-add-patient") ?? document.querySelector<HTMLInputElement>('input[name="d15-patient"]:checked'))?.focus());
  };
  if (adding) return <section className={styles.panel}><NewPatient identity={identity} onSave={patient => { onAdd(patient); close(); }} onCancel={close} /></section>;
  return <section className={styles.panel} aria-labelledby="d15-patients-heading">
    <header className={styles.sectionHeading}><h2 id="d15-patients-heading">Who is this appointment for?</h2><p>Choose a patient, or add someone new.</p></header>
    <fieldset className={styles.patientChoices}><legend className={styles.srOnly}>Select a patient</legend>{patients.map(entry => <label className={styles.patientCard} key={entry.id} data-selected={entry.id === selectedId || undefined}>
      <input type="radio" name="d15-patient" checked={entry.id === selectedId} onChange={() => onSelect(entry.id)} />
      <span className={styles.avatar}><UserRound size={21} aria-hidden /></span><span><strong>{entry.patient.name}</strong><small>{entry.patient.age} years · {entry.patient.relation === "self" ? "Myself" : entry.patient.relation}</small></span><span className={styles.radioMark}>{entry.id === selectedId && <Check size={13} aria-hidden />}</span>
    </label>)}</fieldset>
    {patients.length < 10 && <button id="d15-add-patient" type="button" className={styles.addPatient} onClick={() => setAdding(true)}><Plus size={18} aria-hidden />Add a patient</button>}
    <div className={styles.actions}><button type="button" className={styles.primary} disabled={!selectedId} onClick={onContinue}>Continue to appointment time <ArrowRight size={17} aria-hidden /></button></div>
  </section>;
}
