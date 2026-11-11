"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { SavedPatient } from "../design14/patients";
import MemberAvatar from "../design17/MemberAvatar";
import { design17PatientAvatar } from "../design17/patients";
import styles from "./BookingMemberPicker.module.css";

interface BookingMemberPickerProps {
  patients: SavedPatient[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

function memberMeta({ patient }: SavedPatient) {
  const relation = patient.relation === "self" ? "You" : patient.relation.charAt(0).toUpperCase() + patient.relation.slice(1);
  return `${relation}${patient.age !== "" ? ` · ${patient.age} yrs` : ""}`;
}

export default function BookingMemberPicker({ patients, selectedId, busy, onSelect, onAdd }: BookingMemberPickerProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const selected = patients.find(entry => entry.id === selectedId);
  // A member selected in the navbar must remain visible in the compact list.
  const compact = selected && !patients.slice(0, 3).some(entry => entry.id === selectedId)
    ? [...patients.slice(0, 2), selected] : patients.slice(0, 3);
  const visible = expanded ? patients : compact;

  return <div className={styles.container}>
    <div id={`${id}-members`} className={styles.members} role="radiogroup" aria-label="Choose a member">
      {visible.map(entry => <label key={entry.id} className={styles.option} data-selected={entry.id === selectedId || undefined} data-disabled={busy || undefined}>
        <input
          className={styles.radio}
          type="radio"
          name={`${id}-patient`}
          value={entry.id}
          checked={entry.id === selectedId}
          disabled={busy}
          onChange={() => onSelect(entry.id)}
        />
        <span className={styles.check} aria-hidden>{entry.id === selectedId && <Check size={12} strokeWidth={3} />}</span>
        <MemberAvatar src={design17PatientAvatar(entry)} name={entry.patient.name} size={40} className={styles.avatar} />
        <span className={styles.copy}><strong>{entry.patient.name}</strong><small>{memberMeta(entry)}</small></span>
      </label>)}
    </div>
    <div className={styles.actions}>
      {patients.length < 10 && <button type="button" className={styles.add} disabled={busy} onClick={onAdd}><span className={styles.addIcon} aria-hidden><Plus size={16} /></span>Add new member</button>}
      {patients.length > 3 && <button type="button" className={styles.expand} disabled={busy} aria-expanded={expanded} aria-controls={`${id}-members`} onClick={() => setExpanded(value => !value)}>
        {expanded ? "Show fewer members" : "View all members"}<ChevronDown size={14} aria-hidden />
      </button>}
    </div>
  </div>;
}
