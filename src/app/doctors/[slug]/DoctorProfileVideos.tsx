"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useMouseDragScroll from "@/app/search/designs/d20/useMouseDragScroll";
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
  const [edges, setEdges] = useState({ overflow: false, start: false, end: false });
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { videos, kind } = collection ?? getDoctorProfileVideos(doctor);
  const singleEditorial = presentation === "editorial" && videos.length === 1;
  const description = sourceTitle || (kind === "doctor"
    ? videos.some(video => video.speaker.startsWith("Patient story")) ? "Doctor insights and patient stories." : `Hear from ${doctor.name}.`
    : "Related care explained by Narayana Health specialists.");
  const videoKey = videos.map(video => video.id).join("|");
  useMouseDragScroll(rail, videoKey);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const measure = () => setEdges({ overflow: element.scrollWidth > element.clientWidth + 1, start: element.scrollLeft > 1, end: element.scrollLeft + element.clientWidth < element.scrollWidth - 1 });
    const observer = new ResizeObserver(measure);
    observer.observe(element); element.addEventListener("scroll", measure, { passive: true }); measure();
    return () => { observer.disconnect(); element.removeEventListener("scroll", measure); };
  }, [videoKey]);
  const scroll = (direction: number) => {
    const element = rail.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap);
    const visible = Math.max(1, Math.round(element.clientWidth / step));
    element.scrollBy({ left: direction * step * visible, behavior: reduced ? "auto" : "smooth" });
  };
  if (!videos.length) return previewFallback ? <DoctorProfileSampleVideo doctor={doctor} presentation={presentation} /> : null;
  const Heading = embedded ? "h3" : "h2";
  return <>
    <section id="profile-videos" className={`${styles.section} ${tone === "dark" ? styles.dark : ""} ${presentation === "editorial" ? styles.editorial : ""} ${embedded ? styles.embedded : ""}`} aria-labelledby="profile-videos-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.heading}><Heading id="profile-videos-heading">{embedded && kind === "speciality" ? "Related videos" : "Videos"}</Heading>{!embedded && !singleEditorial && <p>{description}</p>}</div>
        <div className={styles.controls}>
          {videos.length > 1 && <button type="button" className={styles.viewAll} onClick={() => setModal({ video: null })} aria-haspopup="dialog">View all {videos.length} videos</button>}
          {edges.overflow && <div className={styles.arrows}><button type="button" onClick={() => scroll(-1)} disabled={!edges.start} aria-label="Previous videos" aria-controls="profile-video-rail"><ChevronLeft size={20} aria-hidden /></button><button type="button" onClick={() => scroll(1)} disabled={!edges.end} aria-label="Next videos" aria-controls="profile-video-rail"><ChevronRight size={20} aria-hidden /></button></div>}
        </div>
      </header>
      <div ref={rail} id="profile-video-rail" className={`${styles.videoRail} ${singleEditorial ? styles.singleRail : ""}`} data-lenis-prevent-horizontal onFocusCapture={event => {
        const element = rail.current; const card = (event.target as HTMLElement).closest<HTMLElement>("a");
        if (!element || !card) return;
        const bounds = element.getBoundingClientRect(); const item = card.getBoundingClientRect();
        if (item.left < bounds.left || item.right > bounds.right) element.scrollBy({ left: item.left - bounds.left, behavior: reduced ? "auto" : "smooth" });
      }}>{videos.map(video => <DoctorProfileVideoCard key={video.id} video={video} layout={singleEditorial ? "horizontal" : "stacked"} description={singleEditorial ? description : undefined} onPlay={selected => setModal({ video: selected })} />)}</div>
    </section>
    {modal && <DoctorProfileVideoDialog videos={videos} initialVideo={modal.video} doctorName={doctor.name} tone={tone} onClose={() => setModal(null)} />}
  </>;
}
