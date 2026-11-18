"use client";

import Image from "next/image";
import { ChevronDown, MapPin, PhoneCall } from "lucide-react";
import DoctorProfileAvailability from "./DoctorProfileAvailability";
import DoctorProfileVideos from "./DoctorProfileVideos";
import DoctorProfileCallback from "./DoctorProfileCallback";
import { selectDesign17ProfileHospital } from "@/features/search/design17Profile";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { DoctorProfileContent } from "@/features/search/doctorProfileContent";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import styles from "./DoctorProfileDetails.module.css";
import summaryStyles from "@/features/booking/design20/BookingSummary.module.css";

interface Props { doctor: DoctorListingItem; content: DoctorProfileContent }

export default function DoctorProfileDetails({ doctor, content }: Props) {
  const { editorial, qualifications, expertise, hospitals, hasBackground, faqs } = content;
  return <div className={styles.details}>
    {(!!editorial?.summary.length || expertise.length > 0) && <div id="profile-overview" className={styles.overviewGroup}>
    {!!editorial?.summary.length && <section id="profile-about" className={styles.panel} aria-labelledby="profile-about-heading">
      <header className={styles.sectionHeading}><h2 id="profile-about-heading">About the doctor</h2></header>
      <div className={styles.biography}>{editorial.summary.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>}

    {!!expertise.length && <section id="profile-expertise" className={styles.panel} aria-labelledby="profile-expertise-heading">
      <header className={styles.sectionHeading}><h2 id="profile-expertise-heading">Areas of expertise</h2></header>
      <ul className={styles.expertiseList}>{expertise.map(item => <li key={item}>{item}</li>)}</ul>
    </section>}

    </div>}

    {hasBackground && <section id="profile-background" className={styles.panel} aria-labelledby="profile-background-heading">
      <header className={styles.sectionHeading}><h2 id="profile-background-heading">{editorial?.clinicalExperience?.length ? "Qualifications & experience" : editorial?.education?.length ? "Qualifications & training" : "Qualifications"}</h2></header>
      <div className={styles.background}>
        {!!qualifications.length && <ul className={styles.qualificationList}>{qualifications.map(item => <li key={item}>{item}</li>)}</ul>}
        {!!editorial?.education?.length && <details className={styles.disclosure}>
          <summary>Education & training<ChevronDown size={16} aria-hidden /></summary>
          <ul className={styles.historyList}>{editorial.education.map(item => <li key={item.title}><span>{item.title}</span>{item.institution && <small>{item.institution}</small>}</li>)}</ul>
        </details>}
        {!!editorial?.clinicalExperience?.length && <details className={styles.disclosure}>
          <summary>Professional experience<ChevronDown size={16} aria-hidden /></summary>
          <ul className={styles.historyList}>{editorial.clinicalExperience.map(item => <li key={`${item.role}-${item.hospital}`}><span>{item.role}</span>{item.hospital && <small>{item.hospital}</small>}</li>)}</ul>
        </details>}
        {!!editorial?.awards?.length && <details className={styles.disclosure}>
          <summary>Awards & recognition<ChevronDown size={16} aria-hidden /></summary>
          <ul className={styles.historyList}>{editorial.awards.map(item => <li key={`${item.title}-${item.subtitle ?? ""}`}><span>{item.title}</span>{item.subtitle && <small>{item.subtitle}</small>}</li>)}</ul>
        </details>}
        {!!editorial?.memberships?.length && <details className={styles.disclosure}>
          <summary>Professional memberships<ChevronDown size={16} aria-hidden /></summary>
          <ul className={styles.historyList}>{editorial.memberships.map(item => <li key={item}>{item}</li>)}</ul>
        </details>}
      </div>
    </section>}

    {(hospitals.length > 0 || doctor.modes.video === true) && <section id="profile-locations" className={styles.panel} aria-labelledby="profile-locations-heading">
      <header className={styles.sectionHeading}><h2 id="profile-locations-heading">Locations & availability</h2></header>
      <ul className={styles.locationList}>{hospitals.map(hospital => {
        const preview = getDesign16HospitalPreview(hospital);
        const directions = preview?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital)}`;
        const distance = doctor.practiceLocations?.find(location => location.hospital === hospital)?.distanceKm ?? preview?.distanceKm;
        const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Get directions";
        return <li key={hospital}><MapPin size={19} aria-hidden /><div className={styles.practiceDetails}><h3>{hospital}{" "}<a className={summaryStyles.distancePill} href={directions} target="_blank" rel="noopener noreferrer" title="Get directions" aria-label={`${distanceLabel}. Get directions to ${hospital} (opens in a new tab)`}>{distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a></h3><DoctorProfileAvailability doctor={selectDesign17ProfileHospital(doctor, hospital)} mode="hospital" /></div></li>;
      })}{doctor.modes.video === true && <li><Image src="/icons/doctor-card/video.svg" width={19} height={19} alt="" /><div className={styles.practiceDetails}><h3>Video consultation</h3><DoctorProfileAvailability doctor={doctor} mode="video" /></div></li>}</ul>
    </section>}

    <DoctorProfileVideos doctor={doctor} />

    {!!faqs.length && <section id="profile-faq" className={styles.panel} aria-labelledby="profile-faq-heading">
      <header className={styles.sectionHeading}><h2 id="profile-faq-heading">Frequently asked questions</h2></header>
      <div className={styles.faqList}>{faqs.map((faq, index) => <details key={faq.question} className={styles.disclosure} name={`doctor-${doctor.id}-faq`}>
        <summary aria-controls={`doctor-faq-answer-${index}`}>{faq.question}<ChevronDown size={16} aria-hidden /></summary>
        <div id={`doctor-faq-answer-${index}`} className={styles.faqAnswer}><p>{faq.answer}</p></div>
      </details>)}</div>
    </section>}

    <aside className={styles.assistance} aria-label="Appointment assistance">
      <details className={styles.bookingHelp}><summary>Booking help<ChevronDown size={16} aria-hidden /></summary><p>Choose Book appointment to select your hospital, consultation type and time. Sign in when prompted, then choose the patient and review your booking. You can edit the appointment before payment.</p></details>
      <a href="tel:08067506836"><PhoneCall size={16} aria-hidden />Call 080 6750 6836</a>
    </aside>
    <DoctorProfileCallback doctorName={doctor.name} />
  </div>;
}
