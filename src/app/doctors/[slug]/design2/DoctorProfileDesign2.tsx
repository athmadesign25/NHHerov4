"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ProfileShare from "@/app/search/designs/d20/ProfileShare";
import { readListingParams, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { getDesign20CardContent } from "@/features/search/design20CardContent";
import { doctorProfilePath } from "@/features/search/doctorProfileUrl";
import { getDoctorProfilePresentation } from "@/features/search/doctorProfilePresentation";
import type { CapturedDoctorProfile } from "@/features/search/doctorProfileSource";
import DoctorProfileDesignSwitch from "../DoctorProfileDesignSwitch";
import DoctorProfileSectionPicker from "../DoctorProfileSectionPicker";
import DoctorProfileBooking from "../DoctorProfileBooking";
import DoctorProfileVideos from "../DoctorProfileVideos";
import DoctorProfileHero2 from "./DoctorProfileHero2";
import DoctorProfileClinical2 from "./DoctorProfileClinical2";
import DoctorProfileLocations2 from "./DoctorProfileLocations2";
import DoctorProfileResearch2 from "./DoctorProfileResearch2";
import DoctorProfileBlogs2 from "./DoctorProfileBlogs2";
import DoctorProfileFaq2 from "./DoctorProfileFaq2";
import DoctorProfileHelp2 from "./DoctorProfileHelp2";
import DoctorProfileSourceSections2, { getSourceContentSections } from "./DoctorProfileSourceSections2";
import useProfileFocusClearance from "./useProfileFocusClearance";
import styles from "./DoctorProfileDesign2.module.css";

interface Props { doctor: DoctorListingItem; returnTo: string; initialMode: ConsultationMode; date: string; source?: CapturedDoctorProfile | null }

export default function DoctorProfileDesign2({ doctor: originalDoctor, returnTo, initialMode, date, source }: Props) {
  const profile = useProfileFocusClearance();
  const [bookingRequest, setBookingRequest] = useState<{ id: number; mode: ConsultationMode; hospital: string }>();
  const bookAt = (mode: ConsultationMode, hospital: string) => setBookingRequest(previous => ({ id: (previous?.id ?? 0) + 1, mode, hospital }));
  const { doctor, content, media, linkedVideos } = getDoctorProfilePresentation(originalDoctor, source);
  const master = !!source?.isSample;
  const listingFilters = readListingParams(new URLSearchParams(returnTo.split("?")[1] ?? "")).filters;
  const cardContent = getDesign20CardContent(master ? doctor : originalDoctor, {
    specialties: listingFilters.specialties,
    focusTerms: listingFilters.expertise,
    languages: listingFilters.languages,
  });
  const sourceSections = source ? getSourceContentSections(source) : null;
  const hasAbout = sourceSections ? sourceSections.some(([id]) => id === "profile-overview") : !!content.editorial?.summary.length;
  const hasExpertise = sourceSections ? sourceSections.some(([id]) => id === "profile-expertise") : content.hasClinicalDetails;
  const hasBackground = sourceSections ? sourceSections.some(([id]) => id === "profile-background") : content.hasBackground || !!content.publications.length || !!doctor.designation?.trim();
  const hasHospitals = !!content.hospitals.length || !!doctor.modes.video;
  const hasResources = !!(media.videos.length || linkedVideos.length || content.articles.length);
  const sections = [
    ...(hasAbout ? [["profile-overview", "About"]] : []),
    ...(hasExpertise ? [["profile-expertise", "Expertise"]] : []),
    ...(hasHospitals ? [["profile-locations", "Hospitals"]] : []),
    ...(hasBackground ? [["profile-background", "Background"]] : []),
    ...(hasResources ? [["profile-resources", "Videos & articles"]] : []),
    ...(content.faqs.length ? [["profile-faq", "FAQs"]] : []),
  ];
  return <main ref={profile} className={styles.page} data-doctor-profile data-profile-design="2" data-nav-theme="light">
    <DoctorProfileHero2 doctor={doctor} cardContent={cardContent} qualifications={content.qualifications} tools={<>
      <Link className={styles.heroBack} href={returnTo}><ArrowLeft size={16} aria-hidden /><span>All doctors</span></Link>
      {!master && <ProfileShare className={styles.heroShare} doctorName={doctor.name} profileUrl={doctorProfilePath(doctor)} />}
    </>} />
    <div className={styles.canvas}>
      {master && <aside className={styles.masterNotice} aria-label="Master profile preview">
        <strong>Master profile · fictional sample</strong>
        <div><Link href="/doctors/dr-nidhi-tandon?profileDesign=2">Detailed profile<ArrowUpRight size={14} aria-hidden /></Link><Link href="/doctors/dr-arun-b-s?profileDesign=2">Minimal profile<ArrowUpRight size={14} aria-hidden /></Link></div>
      </aside>}
      {!!sections.length && <DoctorProfileSectionPicker sections={sections} tone="light" />}
      <article className={styles.body} aria-label={`${doctor.name} profile details`}>
        {source ? <DoctorProfileSourceSections2 source={source} section="overview" /> : <DoctorProfileClinical2 doctor={doctor} content={content} section="overview" />}
        {source ? <DoctorProfileSourceSections2 source={source} section="expertise" /> : <DoctorProfileClinical2 doctor={doctor} content={content} section="expertise" />}
        <DoctorProfileLocations2 doctor={doctor} hospitals={content.hospitals} onBook={master ? undefined : bookAt} />
        {source ? <DoctorProfileSourceSections2 source={source} section="background" /> : <DoctorProfileClinical2 doctor={doctor} content={content} section="background"><DoctorProfileResearch2 content={content} embedded /></DoctorProfileClinical2>}
        {hasResources && <section id="profile-resources" className={`${styles.chapter} ${styles.resources}`} aria-labelledby="profile-resources-heading">
          <header className={styles.chapterHeading}><h2 id="profile-resources-heading">Videos & articles</h2></header>
          <DoctorProfileVideos doctor={doctor} tone="light" presentation="editorial" collection={media} sourceTitle={source?.videos?.title} embedded />
          {!!linkedVideos.length && <section id={media.videos.length ? "profile-video-links" : "profile-videos"} className={styles.nestedSection} aria-labelledby="profile-video-links-heading">
            <h3 id="profile-video-links-heading" className={styles.subheading}>{media.videos.length ? "More videos" : "Videos"}</h3>
            <ul className={styles.articles}>{linkedVideos.map(video => <li key={video.url || video.title}>{video.url ? <a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}<ArrowUpRight size={16} aria-hidden /></a> : <span>{video.title}</span>}</li>)}</ul>
          </section>}
          <DoctorProfileBlogs2 content={content} embedded />
        </section>}
        <DoctorProfileFaq2 doctor={doctor} faqs={content.faqs} />
        <DoctorProfileHelp2 doctorName={doctor.name} hasEnquiry={source?.hasEnquiry} contact={source?.overview.contact} />
      </article>
    </div>
    <DoctorProfileDesignSwitch active={2} />
    {!master && <DoctorProfileBooking doctor={doctor} initialMode={initialMode} date={date} returnTo={returnTo} tone="light" bookingRequest={bookingRequest} />}
  </main>;
}
