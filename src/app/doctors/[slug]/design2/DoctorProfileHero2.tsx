"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Clock3, Languages, MapPin } from "lucide-react";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { DoctorProfilePreviewContent } from "@/features/search/doctorProfilePreview";
import { duration, ease } from "@/lib/motion";
import DoctorProfileAvailability from "../DoctorProfileAvailability";
import ProfileSampleLabel from "./ProfileSampleLabel";
import styles from "./DoctorProfileHero2.module.css";

export default function DoctorProfileHero2({ doctor, content, showRole = true }: { doctor: DoctorListingItem; content: DoctorProfilePreviewContent; showRole?: boolean }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const reduced = useReducedMotion();
  // Department names belong in the speciality line. Keep the institutional role
  // here; the complete source designation is available in Professional background.
  const roles = doctor.designation?.match(/\b(?:(?:Senior|Associate|Junior|Attending|Visiting|Chief|Executive|Additional|Assistant|Honorary|Managing|Medical|Group|Vice)\s+)*(?:Consultant|Clinical Lead|Director|Chairman|Chairperson|Founder|Head|Registrar|Professor|President)\b/gi) ?? [];
  const role = [...new Map(roles.map(value => [value.toLowerCase(), value])).values()].join(" · ");
  const experience = content.displayExperience.replace(/\s+(?:of\s+)?experience\b/i, "").trim();
  const initials = doctor.name.replace(/^Dr\.?\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("");
  const hasPortrait = !!doctor.img && failedImage !== doctor.img;
  return <header className={styles.hero} aria-labelledby="doctor-profile-name" data-portrait={hasPortrait}>
    <motion.div className={styles.identity} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }}>
      <h1 id="doctor-profile-name">{doctor.name}</h1>
      <p className={styles.speciality}>{doctor.speciality}</p>
      {showRole && !!role && <p className={styles.designation}>{role}</p>}
    </motion.div>
    <div className={styles.portrait}>
      {hasPortrait ? <Image src={doctor.img} alt={doctor.name} fill sizes="(max-width: 639px) 96px, (max-width: 767px) 128px, (max-width: 1023px) 30vw, (max-width: 1335px) 32vw, 400px" priority className={styles.photo} onError={() => setFailedImage(doctor.img)} />
        : <div className={styles.photoFallback} role="img" aria-label={`${doctor.name}, photo unavailable`}><span aria-hidden>{initials}</span></div>}
    </div>
    <div className={styles.details}>
      {(!!experience || !!content.displayLanguages.length) && <dl className={styles.facts}>
        {!!experience && <div><dt className={styles.srOnly}>Experience</dt><dd><Clock3 size={16} aria-hidden /><span><strong>{experience}</strong> experience<ProfileSampleLabel show={content.sampleFields.includes("experience")} /></span></dd></div>}
        {!!content.displayLanguages.length && <div><dt className={styles.srOnly}>Languages</dt><dd><Languages size={16} aria-hidden /><span>{content.displayLanguages.join(", ")}<ProfileSampleLabel show={content.sampleFields.includes("languages")} /></span></dd></div>}
      </dl>}
      {!!doctor.hospital && <a className={styles.consultsAt} href="#profile-locations"><MapPin size={16} aria-hidden /><span>{doctor.hospital}</span></a>}
      <div className={styles.heroAvailability}><DoctorProfileAvailability doctor={doctor} tone="light" showModeLabels /></div>
    </div>
  </header>;
}
