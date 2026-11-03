"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, X } from "lucide-react";
import styles from "./DoctorProfileVideos.module.css";

interface ProfileVideo { id: string; title: string; thumbnail: string; year: string }

/** Verified Narayana Health uploads; the ID links directly to the original source. */
const doctorVideos: Readonly<Record<string, readonly ProfileVideo[]>> = {
  "dr-1": [
    { id: "UtahdIgEOww", title: "Message from Dr. Devi Shetty | World Heart Day", thumbnail: "/assets/doctor-profile-videos/devi-world-heart-day.jpg", year: "2022" },
    { id: "FUMohmy_cqs", title: "How to Keep Your Heart Healthy: Insights from Dr. Devi Shetty", thumbnail: "/assets/doctor-profile-videos/devi-heart-health.jpg", year: "2015" },
  ],
};

export function hasDoctorProfileVideos(doctorId: string): boolean {
  return Boolean(doctorVideos[doctorId]?.length);
}

function VideoDialog({ video, onClose }: { video: ProfileVideo; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    close.current?.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="profile-video-title" data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <header className={styles.dialogHeader}><div><span>Narayana Health · {video.year}</span><h2 id="profile-video-title">{video.title}</h2></div><button ref={close} type="button" onClick={onClose} aria-label="Close video"><X size={20} aria-hidden /></button></header>
    <div className={styles.player}><iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
    <footer className={styles.dialogFooter}><span>From Narayana Health’s official channel</span><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube<ArrowUpRight size={15} aria-hidden /></a></footer>
  </dialog>;
}

export default function DoctorProfileVideos({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [activeVideo, setActiveVideo] = useState<ProfileVideo | null>(null);
  const videos = doctorVideos[doctorId];
  if (!videos?.length) return null;
  return <>
    <section id="profile-videos" className={styles.section} aria-labelledby="profile-videos-heading">
      <header className={styles.heading}><h2 id="profile-videos-heading">Videos</h2><p>Hear from {doctorName}.</p></header>
      <div className={styles.videoGrid}>{videos.map(video => <button key={video.id} type="button" className={styles.videoCard} onClick={() => setActiveVideo(video)} aria-label={`Play ${video.title}`} aria-haspopup="dialog">
        <span className={styles.thumbnail}><Image src={video.thumbnail} alt="" fill sizes="(max-width: 639px) calc(100vw - 64px), (max-width: 767px) 42vw, (max-width: 1023px) 32vw, 420px" /><span className={styles.play}><Play size={22} fill="currentColor" aria-hidden /></span></span>
        <span className={styles.cardCopy}><strong>{video.title}</strong><span>Narayana Health · {video.year}</span></span>
      </button>)}</div>
    </section>
    {activeVideo && <VideoDialog video={activeVideo} onClose={() => setActiveVideo(null)} />}
  </>;
}
