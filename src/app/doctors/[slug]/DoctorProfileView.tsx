"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, GraduationCap, Languages, UserRound } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProfileShare from "@/app/search/designs/d20/ProfileShare";
import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import { design17ProfileUrl } from "@/features/search/design17Profile";
import { getDesign20CardContent } from "@/features/search/design20CardContent";
import { getDoctorProfileContent } from "@/features/search/doctorProfileContent";
import DoctorProfileDetails from "./DoctorProfileDetails";
import { hasDoctorProfileVideos } from "./DoctorProfileVideos";
import DoctorProfileBooking from "./DoctorProfileBooking";
import DoctorProfileSectionPicker from "./DoctorProfileSectionPicker";
import styles from "./DoctorProfileView.module.css";

interface Props { doctor: DoctorListingItem; returnTo: string; initialMode: ConsultationMode; date: string }

/** A reading-first profile, with the shared appointment picker in its floating bar. */
export default function DoctorProfileView({ doctor, returnTo, initialMode, date }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduced = useReducedMotion();
  const content = getDesign20CardContent(doctor);
  const profile = getDoctorProfileContent(doctor);
  const years = content.experienceValue?.match(/\d+(?:\.\d+)?/)?.[0];
  const profileHref = design17ProfileUrl(doctor, initialMode, date, false, "d20", returnTo);
  const sections = [
    ...(profile.editorial?.summary.length ? [["profile-about", "About"]] : []),
    ...(profile.expertise.length ? [["profile-expertise", "Expertise"]] : []),
    ...(profile.hasBackground ? [["profile-background", "Background"]] : []),
    ...(profile.hospitals.length || doctor.modes.video === true ? [["profile-locations", "Locations"]] : []),
    ...(hasDoctorProfileVideos(doctor.id) ? [["profile-videos", "Videos"]] : []),
    ...(profile.faqs.length ? [["profile-faq", "FAQs"]] : []),
  ];

  return <main className={styles.page} data-doctor-profile data-nav-theme="light">
    <div className={styles.container}>
      <Breadcrumbs theme="light" items={[{ label: "Home", href: "/" }, { label: "Doctors", href: returnTo }, { label: doctor.name }]} />
      <div className={styles.pageTools}><Link className={styles.back} href={returnTo}><ArrowLeft size={16} aria-hidden />Back to doctors</Link><ProfileShare doctorName={doctor.name} profileUrl={profileHref} /></div>
      <article className={styles.profileSurface}>
      <motion.header className={styles.hero} aria-labelledby="doctor-profile-name" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, ease: [.22, 1, .36, 1] }}>
        <div className={styles.portrait}>
          {doctor.img && !imageFailed ? <><Image src={doctor.img} alt="" fill sizes="(max-width: 767px) 100vw, 1240px" className={styles.photoAmbient} aria-hidden /><div className={styles.photoFrame}><Image src={doctor.img} alt={doctor.name} fill sizes="(max-width: 639px) calc(100vw - 32px), 640px" priority className={styles.photo} onError={() => setImageFailed(true)} /></div></>
            : <div className={styles.photoFallback}><UserRound size={64} strokeWidth={1} aria-hidden /><span>Photo unavailable</span></div>}
          <div className={styles.identity}><h1 id="doctor-profile-name">{doctor.name}</h1><div className={styles.specialityMeta}><p>{doctor.speciality}</p>{years && <span className={styles.experience}><strong>{years}+ years</strong><span>experience</span></span>}</div>{doctor.designation && <p className={styles.role}>{doctor.designation}</p>}</div>
        </div>
        <div className={styles.overview}>
          <dl className={styles.facts}>
            {profile.credentialSummary && <div><dt><GraduationCap size={18} aria-hidden /><span className={styles.factLabel}>Qualifications</span></dt><dd title={doctor.degrees}>{profile.credentialSummary}</dd></div>}
            {!!doctor.languages?.length && <div><dt><Languages size={18} aria-hidden /><span className={styles.factLabel}>Languages spoken</span></dt><dd>{doctor.languages.join(" · ")}</dd></div>}
          </dl>
        </div>
      </motion.header>
      <DoctorProfileSectionPicker sections={sections} />
      <DoctorProfileDetails doctor={doctor} content={profile} />
      </article>
    </div>
    <DoctorProfileBooking doctor={doctor} initialMode={initialMode} date={date} returnTo={returnTo} />
  </main>;
}
