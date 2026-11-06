"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, UserRound, X } from "lucide-react";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import videoStyles from "./DoctorProfileVideos.module.css";
import styles from "./DoctorProfileSampleVideo.module.css";

function SamplePoster({ doctor }: { doctor: DoctorListingItem }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.poster}>
    {doctor.img && !failed ? <Image src={doctor.img} alt="" fill sizes="(max-width: 639px) 90vw, 600px" className={styles.photo} onError={() => setFailed(true)} /> : <UserRound className={styles.fallback} size={64} strokeWidth={1} aria-hidden />}
    <span className={styles.sample}>Sample</span>
  </span>;
}

function SampleVideoDialog({ doctor, title, onClose }: { doctor: DoctorListingItem; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = "hidden"; close.current?.focus();
    return () => { element.close(); document.body.style.overflow = previousOverflow; trigger?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className={`${videoStyles.dialog} ${styles.dialog}`} aria-labelledby="sample-video-title" aria-describedby="sample-video-description" data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <header className={videoStyles.dialogHeader}><div><span>Sample video</span><h2 id="sample-video-title">{title}</h2></div><button ref={close} type="button" onClick={onClose} aria-label="Close sample video"><X size={20} aria-hidden /></button></header>
    <SamplePoster doctor={doctor} />
    <div className={styles.description}><p id="sample-video-description">Sample video — content will be added.</p><p>This preview shows the video layout. It is not a recording by {doctor.name}.</p></div>
  </dialog>;
}

/** Only the design preview opts into sample media. Never impersonate an upload. */
export default function DoctorProfileSampleVideo({ doctor, presentation }: { doctor: DoctorListingItem; presentation: "default" | "editorial" }) {
  const [open, setOpen] = useState(false);
  const title = `Understanding ${doctor.speciality || "your care"}`;
  return <>
    <section id="profile-videos" className={`${videoStyles.section} ${presentation === "editorial" ? videoStyles.editorial : ""}`} aria-labelledby="profile-videos-heading" data-profile-sample-video>
      <header className={videoStyles.sectionHeader}><div className={videoStyles.heading}><h2 id="profile-videos-heading">Videos</h2><p>A preview of the videos section for this profile.</p></div></header>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Preview sample video: ${title}`}>
        <span className={styles.thumbnail}><SamplePoster doctor={doctor} /><span className={styles.play}><Play size={20} fill="currentColor" aria-hidden /></span></span>
        <span className={videoStyles.cardCopy}><strong>{title}</strong><span>Sample video · Design preview</span></span>
      </button>
    </section>
    {open && <SampleVideoDialog doctor={doctor} title={title} onClose={() => setOpen(false)} />}
  </>;
}
