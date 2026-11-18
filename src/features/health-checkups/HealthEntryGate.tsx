"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import BookingMemberPicker from "@/features/booking/shared/BookingMemberPicker";
import NewPatient from "@/features/booking/shared/NewPatient";
import { chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, rememberBookingMembers, subscribeBookingMembers } from "@/features/booking/shared/memberSelection";
import type { AuthIdentity, SavedPatient } from "@/features/booking/shared/types";
import JourneyHeading from "@/components/ui/JourneyHeading";
import HealthDialog from "./HealthDialog";
import { clearHealthBookingHistory } from "./healthBookingHistory";
import page from "./HealthCheckups.module.css";
import styles from "./HealthEntryGate.module.css";

const ACCOUNT: AuthIdentity = { method: "email", value: "signed-in@nh.example" };

/** One entry check for listing, package/test deep links and checkout. */
export default function HealthEntryGate({ children }: { children: ReactNode }) {
  const { isUserLoggedIn, isAuthReady } = useAuthState();
  if (!isAuthReady) return null;
  return isUserLoggedIn ? <MemberEntry>{children}</MemberEntry> : <SignInEntry />;
}

function SignInEntry() {
  const [loginOpen, setLoginOpen] = useState(true);
  useEffect(() => { clearHealthBookingHistory(); }, []);
  return <div className={`${page.page} ${styles.page}`}>
    <section className={styles.container} aria-labelledby="health-entry-title">
      <header className={styles.header}>
        <JourneyHeading id="health-entry-title" className={styles.heading}>Health checkups & lab tests</JourneyHeading>
        <p>Sign in to choose who you’re booking for.</p>
      </header>
      <div className={styles.actions}>
        <Link href="/" className={page.textButton}>Back to home</Link>
        <button type="button" className={page.primary} onClick={() => setLoginOpen(true)}>Sign in</button>
      </div>
    </section>
    {loginOpen && <LoginModal isOpen manageFocus previewOtp onClose={() => setLoginOpen(false)} />}
  </div>;
}

function MemberEntry({ children }: { children: ReactNode }) {
  // The route layout survives catalogue navigation. Leaving the module or
  // signing out resets this step; browsing details or returning from checkout does not.
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const preference = useSyncExternalStore(subscribeBookingMembers, getBookingMemberSelection, getServerBookingMemberSelection);
  const members: SavedPatient[] = useMemo(() => preference.members.map(({ id, ...patient }) => ({
    id, patient: { ...patient, phone: "", email: ACCOUNT.value },
  })), [preference.members]);
  const memberId = members.some(member => member.id === preference.selectedId)
    ? preference.selectedId : members[0]?.id ?? null;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  if (ready) return children;

  function continueToCatalogue() {
    if (!memberId) return;
    chooseBookingMember(memberId);
    setReady(true);
  }

  return <div className={`${page.page} ${styles.page}`}>
    <section className={styles.container} aria-labelledby="health-member-title">
      <header className={styles.header}>
        <JourneyHeading ref={heading} tabIndex={-1} id="health-member-title" className={styles.heading}>Who is this checkup for?</JourneyHeading>
        <p>Choose a member to explore packages and tests.</p>
      </header>
      <div className={styles.members}>
        <BookingMemberPicker patients={members} selectedId={memberId} busy={false} onSelect={chooseBookingMember} onAdd={() => setAdding(true)} />
      </div>
      <div className={styles.actions}>
        <Link href="/" className={page.textButton}>Back to home</Link>
        <button type="button" className={page.primary} disabled={!memberId} onClick={continueToCatalogue}>Continue</button>
      </div>
    </section>
    {adding && <HealthDialog title="Add new member" onClose={() => setAdding(false)}>
      <NewPatient identity={ACCOUNT} onCancel={() => setAdding(false)} onSave={patient => {
        const id = `health-member-${crypto.randomUUID()}`;
        rememberBookingMembers([{ id, patient }], id);
        setAdding(false);
      }} />
    </HealthDialog>}
  </div>;
}
