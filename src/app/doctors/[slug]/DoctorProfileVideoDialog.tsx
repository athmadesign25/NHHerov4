"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, X } from "lucide-react";
import type { DoctorProfileVideo } from "@/features/search/doctorProfileMedia";
import DoctorProfileVideoCard from "./DoctorProfileVideoCard";
import styles from "./DoctorProfileVideos.module.css";

export default function DoctorProfileVideoDialog({ videos, initialVideo, doctorName, tone = "light", onClose }: {
  videos: readonly DoctorProfileVideo[]; initialVideo: DoctorProfileVideo | null; doctorName: string; tone?: "light" | "dark"; onClose: () => void;
}) {
  const [video, setVideo] = useState(initialVideo);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const lastVideo = useRef(initialVideo?.id);
  const galleryScroll = useRef(0);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = "hidden"; close.current?.focus();
    return () => { element.close(); document.body.style.overflow = previousOverflow; trigger?.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    if (video) { dialog.current?.scrollTo(0, 0); close.current?.focus({ preventScroll: true }); }
    else if (lastVideo.current) {
      dialog.current?.scrollTo(0, galleryScroll.current);
      dialog.current?.querySelector<HTMLElement>(`[data-video-id="${lastVideo.current}"]`)?.focus({ preventScroll: true });
    }
  }, [video]);
  return <dialog ref={dialog} className={`${styles.dialog} ${!video ? styles.galleryDialog : ""} ${tone === "dark" ? styles.dark : ""}`} aria-labelledby="profile-video-title" data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <header className={styles.dialogHeader}><div>
      {video && videos.length > 1 ? <button className={styles.backToGallery} type="button" onClick={() => setVideo(null)}><ArrowLeft size={16} aria-hidden />All videos</button> : <span>{doctorName} · {videos.length} videos</span>}
      <h2 id="profile-video-title">{video ? video.title : "All videos"}</h2>
    </div><button ref={close} type="button" onClick={onClose} aria-label="Close videos"><X size={20} aria-hidden /></button></header>
    {video ? <>
      <div className={styles.player}><iframe key={video.id} src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
      <footer className={styles.dialogFooter}><span>Narayana Health{video.year ? ` · ${video.year}` : ""}</span><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube<ArrowUpRight size={15} aria-hidden /></a></footer>
    </> : <div className={styles.galleryGrid}>{videos.map(item => <DoctorProfileVideoCard key={item.id} video={item} onPlay={selected => {
      galleryScroll.current = dialog.current?.scrollTop ?? 0; lastVideo.current = selected.id; setVideo(selected);
    }} />)}</div>}
  </dialog>;
}
