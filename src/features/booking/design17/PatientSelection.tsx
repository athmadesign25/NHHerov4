"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { SavedPatient } from "../design14/patients";
import type { AuthIdentity } from "../design15/auth";
import type { PatientDraft } from "../design7/model";
import MemberAvatar from "./MemberAvatar";
import { design17PatientAvatar } from "./patients";
import NewPatient from "../design15/NewPatient";
import memberStyles from "@/components/booking/MemberSelector/MemberSelector.module.css";
import styles from "./Booking.module.css";

export default function PatientSelection({ identity, patients, selectedId, onSelect, onAdd }: {
  identity: AuthIdentity; patients: SavedPatient[]; selectedId: string | null; onSelect: (id: string) => void; onAdd: (patient: PatientDraft) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const selected = patients.find(entry => entry.id === selectedId)?.patient;
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return <section className={styles.memberSection} aria-labelledby="d17-patient-title">
    <div ref={root} className={`${memberStyles.container} ${styles.memberControl}`} onKeyDown={event => {
      if (event.key === "Escape" && open) { event.preventDefault(); close(); }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        if (!open) { setOpen(true); requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus()); return; }
        const options = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
        const index = options.findIndex(option => option === document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length;
        options[next]?.focus();
      }
    }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <h2 id="d17-patient-title" className={memberStyles.label} tabIndex={-1}>Select member</h2>
      <button ref={trigger} type="button" className={`${memberStyles.trigger} ${styles.memberTrigger} ${open ? memberStyles.triggerOpen : ""}`} aria-label={`Select member${selected ? `: ${selected.name}` : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(value => !value)}>
        <span className={memberStyles.triggerLeft}><MemberAvatar src={design17PatientAvatar(patients.find(entry => entry.id === selectedId))} className={`${memberStyles.avatar} ${styles.memberAvatar}`} /><span className={`${memberStyles.name} ${styles.memberName}`}>{selected?.name ?? "Choose a member"}</span>{selected && <span className={memberStyles.relationTag}>{selected.relation === "self" ? "You" : selected.relation}</span>}</span>
        <ChevronDown size={16} aria-hidden className={`${memberStyles.chevron} ${open ? memberStyles.chevronRotated : ""}`} />
      </button>
      {open && <div className={`${memberStyles.dropdown} ${styles.memberDropdown}`}>
        <div id={menuId} role="listbox" aria-label="Select member">{patients.map(entry => <button key={entry.id} type="button" role="option" aria-selected={entry.id === selectedId} className={`${memberStyles.memberOption} ${styles.memberOption}`} onClick={() => { onSelect(entry.id); close(); }}>
          <span className={memberStyles.optionLeft}><MemberAvatar src={design17PatientAvatar(entry)} className={`${memberStyles.optionAvatar} ${styles.memberAvatar}`} /><span><span className={`${memberStyles.optionName} ${styles.memberName}`}>{entry.patient.name}</span><span className={memberStyles.optionMeta}><span className={memberStyles.relationTag}>{entry.patient.relation === "self" ? "You" : entry.patient.relation}</span><span className={styles.memberAge}>{entry.patient.age} yrs</span></span></span></span>
          {entry.id === selectedId && <Check size={16} aria-hidden />}
        </button>)}</div>
        {patients.length < 10 && <><div className={memberStyles.divider} /><button type="button" className={`${memberStyles.addPatientBtn} ${styles.addMember}`} onClick={() => { setOpen(false); setAdding(true); }}><Plus size={16} aria-hidden />Add new patient / member</button></>}
      </div>}
    </div>
    {adding && <div className={styles.newMember}><NewPatient identity={identity} onSave={patient => { onAdd(patient); setAdding(false); requestAnimationFrame(() => trigger.current?.focus()); }} onCancel={() => { setAdding(false); trigger.current?.focus(); }} /></div>}
  </section>;
}
