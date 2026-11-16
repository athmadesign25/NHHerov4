"use client";

import Image from "next/image";
import type { Ref, ReactNode } from "react";
import JourneyHeading from "@/components/ui/JourneyHeading";
import styles from "./HealthListing4.module.css";

interface Props { title: string; headingRef: Ref<HTMLHeadingElement>; children?: ReactNode }

/** A compact discovery hero; the existing catalogue remains the booking surface. */
export default function HealthHero4({ title, headingRef, children }: Props) {
  return <header className={styles.hero} data-nav-theme="dark">
    <div className={styles.heroBackdrop} aria-hidden="true">
      <div className={styles.heroImage}>
        <Image src="/doctor_patient.png" alt="" fill priority sizes="(max-width: 639px) 100vw, 65vw" />
      </div>
      <div className={styles.heroShade} />
    </div>
    <div className={styles.heroInner}>
      <div className={styles.heroCopy}>
        <JourneyHeading ref={headingRef} tabIndex={-1} className={styles.heroTitle}>{title}</JourneyHeading>
        <p className={styles.heroSubtext}>Find the right checkup, at a centre near you.</p>
      </div>
      {children}
    </div>
  </header>;
}
