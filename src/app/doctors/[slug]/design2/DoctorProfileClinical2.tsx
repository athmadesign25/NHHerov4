import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { DoctorProfilePreviewContent } from "@/features/search/doctorProfilePreview";
import ProfileSampleLabel from "./ProfileSampleLabel";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileClinical2({ doctor, content, section, children }: { doctor: DoctorListingItem; content: DoctorProfilePreviewContent; section?: "overview" | "expertise" | "background"; children?: ReactNode }) {
  const { editorial, expertise, treatments, qualifications, hasBackground, hasClinicalDetails, sampleFields } = content;
  return <>
    {(!section || section === "overview") && !!editorial?.summary.length && <section id="profile-overview" className={styles.chapter} aria-labelledby="profile-about-heading">
      <header className={styles.chapterHeading}><h2 id="profile-about-heading">About</h2><ProfileSampleLabel show={sampleFields.includes("summary")} /></header>
      <div className={styles.prose}>{editorial.summary.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>}
    {(!section || section === "expertise") && hasClinicalDetails && <section id="profile-expertise" className={styles.chapter} aria-labelledby="profile-expertise-heading">
      <header className={styles.chapterHeading}><h2 id="profile-expertise-heading">Areas of expertise</h2><ProfileSampleLabel show={sampleFields.includes("expertise")} /></header>
      <div className={styles.chapterContent}>
        {!!expertise.length && <ul className={styles.expertise}>{expertise.map(item => <li key={item}>{item}</li>)}</ul>}
        {!!treatments.length && <div className={styles.subsection}><h3>Conditions & treatments<ProfileSampleLabel show={sampleFields.includes("treatments")} /></h3>
          <ul className={styles.clinicalList}>{treatments.slice(0, 6).map(item => <li key={item}>{item}</li>)}</ul>
          {treatments.length > 6 && <details className={styles.more}><summary><span className={styles.whenClosed}>View all {treatments.length} conditions & treatments</span><span className={styles.whenOpen}>Show fewer</span><ChevronDown size={16} aria-hidden /></summary><ul className={styles.clinicalList}>{treatments.slice(6).map(item => <li key={item}>{item}</li>)}</ul></details>}
        </div>}
      </div>
    </section>}
    {(!section || section === "background") && (hasBackground || !!content.publications.length || !!doctor.designation?.trim()) && <section id="profile-background" className={styles.chapter} aria-labelledby="profile-background-heading">
      <header className={styles.chapterHeading}><h2 id="profile-background-heading">Professional background</h2></header>
      <div className={styles.chapterContent}>
        {!!doctor.designation && <div className={styles.professionalRole}><h3>Current role</h3><p>{doctor.designation}</p></div>}
        <ProfileSampleLabel show={sampleFields.includes("qualifications")} />
        {!!qualifications.length && <h3 className={styles.subheading}>Qualifications</h3>}
        {!!qualifications.length && <ul className={styles.credentials}>{qualifications.map(item => <li key={item}>{item}</li>)}</ul>}
        {!!editorial?.education?.length && <details className={styles.disclosure}><summary><span>Education & training<ProfileSampleLabel show={sampleFields.includes("education")} /></span><ChevronDown size={18} aria-hidden /></summary><ul className={styles.history}>{editorial.education.map(item => <li key={item.title}><span>{item.title}</span>{item.institution && <small>{item.institution}</small>}</li>)}</ul></details>}
        {!!editorial?.clinicalExperience?.length && <details className={styles.disclosure}><summary><span>Professional experience<ProfileSampleLabel show={sampleFields.includes("clinicalExperience")} /></span><ChevronDown size={18} aria-hidden /></summary><ul className={styles.history}>{editorial.clinicalExperience.map(item => <li key={item.role}><span>{item.role}</span>{item.hospital && <small>{item.hospital}</small>}</li>)}</ul></details>}
        {!!editorial?.awards?.length && <details className={styles.disclosure}><summary><span>Recognition & affiliations<ProfileSampleLabel show={sampleFields.includes("awards")} /></span><ChevronDown size={18} aria-hidden /></summary><ul className={styles.history}>{editorial.awards.map(item => <li key={`${item.title}-${item.subtitle ?? ""}`}><span>{item.title}</span>{item.subtitle && <small>{item.subtitle}</small>}</li>)}</ul></details>}
        {!!editorial?.memberships?.length && <details className={styles.disclosure}><summary><span>Professional memberships<ProfileSampleLabel show={sampleFields.includes("memberships")} /></span><ChevronDown size={18} aria-hidden /></summary><ul className={styles.history}>{editorial.memberships.map(item => <li key={item}>{item}</li>)}</ul></details>}
        {children}
      </div>
    </section>}
  </>;
}
