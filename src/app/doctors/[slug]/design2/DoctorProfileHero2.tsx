"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { Design20CardContent } from "@/features/search/design20CardContent";
import ExpertiseSummary from "@/app/search/designs/d20/ExpertiseSummary";
import { duration, ease } from "@/lib/motion";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import styles from "./DoctorProfileHero2.module.css";

export default function DoctorProfileHero2({ doctor, cardContent, qualifications, tools }: { doctor: DoctorListingItem; cardContent: Design20CardContent; qualifications: string[]; tools?: ReactNode }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const education = [...new Set(qualifications.map(value => value.trim()).filter(Boolean))];
  const experienceYears = cardContent.experienceValue?.match(/\d+(?:\.\d+)?/)?.[0];
  const initials = doctor.name.replace(/^Dr\.?\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("");
  const hasPortrait = !!doctor.img && failedImage !== doctor.img;
  return <header className={styles.hero} aria-labelledby="doctor-profile-name" data-portrait={hasPortrait} data-nav-theme="dark">
    <div className={styles.portrait}>
      {hasPortrait ? <Image src={doctor.img} alt={doctor.name} fill sizes="(max-width: 767px) 100vw, 60vw" preload className={styles.photo} onError={() => setFailedImage(doctor.img)} />
        : <div className={styles.photoFallback} role="img" aria-label={`${doctor.name}, photo unavailable`}><span aria-hidden>{initials}</span></div>}
    </div>
    <div className={styles.scrim} aria-hidden />
    <div className={styles.inner}>
    <div className={styles.tools}>{tools}</div>
    <div className={styles.content}>
    <motion.div className={styles.identity} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }}>
      <div className={styles.name}>
        <h1 id="doctor-profile-name">{doctor.name}</h1>
        <div className={styles.nameSweep} aria-hidden="true">
          <TextSweepEffect key={doctor.name} words={[doctor.name]} sweepMs={duration.slowest * 2000}
            active={!reduced} sweepColor="var(--color-heading-wipe)"
            finalColor="var(--color-text-inverse)" />
        </div>
      </div>
      {(cardContent.speciality || experienceYears) && <div className={styles.identityMeta}>
        {cardContent.speciality && <p className={styles.speciality}>{cardContent.speciality}</p>}
        {experienceYears && <span className={styles.experience} aria-label={`${experienceYears}+ years ${cardContent.experienceLabel}`}>
          {cardContent.speciality && <span aria-hidden>·</span>}<strong>{experienceYears}+ yrs</strong>
        </span>}
      </div>}
      {!!education.length && <p className={styles.education}>{education.join(" · ")}</p>}
      {!!cardContent.fullExpertise.length && <div className={styles.expertise}><ExpertiseSummary terms={cardContent.fullExpertise} /></div>}
      {cardContent.language && <p className={styles.language}>Speaks {cardContent.language}</p>}
    </motion.div>
    </div>
    </div>
  </header>;
}
