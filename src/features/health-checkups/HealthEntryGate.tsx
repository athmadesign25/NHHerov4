"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { usePathname } from "next/navigation";
import { HealthMemberContext } from "./HealthMemberContext";
import HealthMemberSelection from "./HealthMemberSelection";
import { scrollHealthToTop } from "./healthScroll";
import JourneyHeading from "@/components/ui/JourneyHeading";
import { clearHealthBookingHistory } from "./healthBookingHistory";
import page from "./HealthCheckups.module.css";
import styles from "./HealthEntryGate.module.css";

/** One entry check for listing, package/test deep links and checkout. */
export default function HealthEntryGate({ children }: { children: ReactNode }) {
  const { isUserLoggedIn, isAuthReady } = useAuthState();
  const pathname = usePathname();
  useEffect(() => {
    const frame = requestAnimationFrame(scrollHealthToTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname, isAuthReady, isUserLoggedIn]);
  if (!isAuthReady) return <div className={page.page} aria-busy="true" aria-label="Loading health checkups" />;
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
  // Keep the choice through detail and checkout routes; reset on module exit/logout.
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const listing = pathname.replace(/\/$/, "") === "/health-checkups";
  useEffect(() => {
    const frame = requestAnimationFrame(scrollHealthToTop);
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return <HealthMemberContext.Provider value={{ ready, confirmMember: () => setReady(true) }}>
    {listing || ready ? children : <div className={page.page}>
      <div className={page.container}>
        <header className={page.intro}><JourneyHeading>Health checkups & lab tests</JourneyHeading></header>
        <HealthMemberSelection />
      </div>
    </div>}
  </HealthMemberContext.Provider>;
}
