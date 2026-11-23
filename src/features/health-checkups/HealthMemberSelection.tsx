"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import BookingMemberPicker from "@/features/booking/shared/BookingMemberPicker";
import NewPatient from "@/features/booking/shared/NewPatient";
import MemberAvatar from "@/features/booking/shared/MemberAvatar";
import { patientAvatar } from "@/features/booking/shared/patients";
import { chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, rememberBookingMembers, subscribeBookingMembers } from "@/features/booking/shared/memberSelection";
import type { AuthIdentity, SavedPatient } from "@/features/booking/shared/types";
import { useHealthMember } from "./HealthMemberContext";
import HealthDialog from "./HealthDialog";
import page from "./HealthCheckups.module.css";
import styles from "./HealthMemberSelection.module.css";

const ACCOUNT: AuthIdentity = { method: "email", value: "signed-in@nh.example" };

export default function HealthMemberSelection({ hasCart = false }: { hasCart?: boolean }) {
  const { ready, confirmMember } = useHealthMember();
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const preference = useSyncExternalStore(subscribeBookingMembers, getBookingMemberSelection, getServerBookingMemberSelection);
  const members: SavedPatient[] = useMemo(() => preference.members.map(({ id, ...patient }) => ({
    id, patient: { ...patient, phone: "", email: ACCOUNT.value },
  })), [preference.members]);
  const selected = members.find(member => member.id === preference.selectedId);
  const open = !ready || expanded || !selected;

  function select(id: string) {
    if (hasCart && preference.selectedId !== id) { setPendingId(id); return; }
    commit(id);
  }
  function commit(id: string) {
    chooseBookingMember(id);
    confirmMember();
    setExpanded(false);
    setPendingId(null);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }

  return <section className={ready ? styles.compact : styles.section} aria-label="Booking member">
    {ready && selected && <button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-haspopup="dialog" aria-label={`Booking for ${selected.patient.name}. Change member`} onClick={() => setExpanded(value => !value)}>
      <MemberAvatar src={patientAvatar(selected)} name={selected.patient.name} size={32} className={styles.avatar} />
      <span><strong>{selected.patient.name}</strong></span>
      <ChevronDown size={16} aria-hidden className={styles.chevron} data-open={open} />
    </button>}
    {open && (ready ? <HealthDialog title="Who is this checkup for?" onClose={() => setExpanded(false)}>
      <div className={styles.memberChoices}>
        <BookingMemberPicker showAllMembers patients={members} selectedId={preference.selectedId} busy={false} onSelect={select} onAdd={() => setAdding(true)} />
      </div>
    </HealthDialog> : <div id="health-members" className={styles.panel}>
      <div className={styles.heading}><h2>Who is this checkup for?</h2></div>
      <BookingMemberPicker showAllMembers patients={members} selectedId={null} busy={false} onSelect={select} onAdd={() => setAdding(true)} />
    </div>)}
    {adding && <HealthDialog title="Add new member" onClose={() => setAdding(false)}>
      <NewPatient identity={ACCOUNT} onCancel={() => setAdding(false)} onSave={patient => {
        const id = `health-member-${crypto.randomUUID()}`;
        rememberBookingMembers([{ id, patient }]);
        setAdding(false);
        select(id);
      }} />
    </HealthDialog>}
    {pendingId && <HealthDialog title="Change booking member?" onClose={() => setPendingId(null)}>
      <p className={page.dialogSub}>Your cart will be cleared. Choose packages or tests again for {members.find(member => member.id === pendingId)?.patient.name}.</p>
      <div className={page.modalActions}>
        <button type="button" className={page.textButton} onClick={() => setPendingId(null)}>Keep current member</button>
        <button type="button" className={page.primary} onClick={() => commit(pendingId)}>Change member</button>
      </div>
    </HealthDialog>}
  </section>;
}
