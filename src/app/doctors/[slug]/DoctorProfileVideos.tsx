"use client";

import { useState } from "react";
import HorizontalMediaRail from "@/components/ui/HorizontalMediaRail";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import { getDoctorProfileVideos, type DoctorProfileVideo } from "@/features/search/doctorProfileMedia";
import DoctorProfileVideoCard from "./DoctorProfileVideoCard";
import DoctorProfileVideoDialog from "./DoctorProfileVideoDialog";
import DoctorProfileSampleVideo from "./DoctorProfileSampleVideo";
import styles from "./DoctorProfileVideos.module.css";
export { hasDoctorProfileVideos } from "@/features/search/doctorProfileMedia";

export default function DoctorProfileVideos({ doctor, tone = "light", presentation = "default", previewFallback = false, collection, sourceTitle, embedded = false }: {
  doctor: DoctorListingItem;
  tone?: "light" | "dark";
  presentation?: "default" | "editorial";
  previewFallback?: boolean;
  collection?: { videos: readonly DoctorProfileVideo[]; kind: "doctor" | "speciality" };
  sourceTitle?: string;
  embedded?: boolean;
}) {
  const [modal, setModal] = useState<{ video: DoctorProfileVideo | null } | null>(null);
  const { videos, kind } = collection ?? getDoctorProfileVideos(doctor);
  const description = sourceTitle || (kind === "doctor"
    ? videos.some(video => video.speaker.startsWith("Patient story")) ? "Doctor insights and patient stories." : `Hear from ${doctor.name}.`
    : "Related care explained by Narayana Health specialists.");
  if (!videos.length) return previewFallback ? <DoctorProfileSampleVideo doctor={doctor} presentation={presentation} /> : null;
  const Heading = embedded ? "h3" : "h2";
  return <>
    <section id="profile-videos" className={`${styles.section} ${tone === "dark" ? styles.dark : ""} ${presentation === "editorial" ? styles.editorial : ""} ${embedded ? styles.embedded : ""}`} aria-labelledby="profile-videos-heading">
      <HorizontalMediaRail id="profile-video-rail" labelledBy="profile-videos-heading" itemLabel="videos"
        heading={<div className={styles.heading}><Heading id="profile-videos-heading">{embedded && kind === "speciality" ? "Related videos" : "Videos"}</Heading>{!embedded && <p>{description}</p>}</div>}>
        {videos.map(video => <DoctorProfileVideoCard key={video.id} video={video}
          layout={presentation === "editorial" ? "editorial" : "stacked"}
          headingLevel={embedded ? "h4" : "h3"} onPlay={selected => setModal({ video: selected })} />)}
      </HorizontalMediaRail>
    </section>
    {modal && <DoctorProfileVideoDialog videos={videos} initialVideo={modal.video} doctorName={doctor.name} tone={tone} onClose={() => setModal(null)} />}
  </>;
}
