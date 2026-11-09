"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import BlogArticleCard from "@/components/blog/BlogArticleCard";
import type { DoctorProfileVideo } from "@/features/search/doctorProfileMedia";
import styles from "./DoctorProfileVideos.module.css";

export default function DoctorProfileVideoCard({ video, onPlay, layout = "stacked", description, headingLevel = "h3" }: {
  video: DoctorProfileVideo;
  onPlay: (video: DoctorProfileVideo) => void;
  layout?: "stacked" | "horizontal" | "editorial";
  description?: string;
  headingLevel?: "h3" | "h4";
}) {
  const [failed, setFailed] = useState(false);
  if (layout === "editorial") return <BlogArticleCard
    title={video.title}
    href={`https://www.youtube.com/watch?v=${video.id}`}
    image={video.thumbnail}
    date={video.year}
    author={video.speaker}
    headingLevel={headingLevel}
    mediaType="video"
    previewVideoId={video.id}
    landscape
    external
    sizes="(min-width: 1280px) 530px, (min-width: 768px) calc((100vw - 88px) / 2.25), 80vw"
    onPlay={() => onPlay(video)}
  />;
  return <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" draggable={false} className={`${styles.videoCard} ${layout === "horizontal" ? styles.horizontalVideo : ""}`} onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onPlay(video);
  }} aria-label={`Play ${video.title}`} aria-haspopup="dialog" data-video-id={video.id}>
    <span className={styles.thumbnail}>{video.thumbnail && !failed && <Image src={video.thumbnail} alt="" fill draggable={false} onError={() => setFailed(true)} sizes={layout === "horizontal" ? "(max-width: 767px) 90vw, (max-width: 1023px) 30vw, 360px" : "(max-width: 639px) 80vw, (max-width: 1023px) 42vw, 360px"} />}<span className={styles.play}><Play size={22} fill="currentColor" aria-hidden /></span></span>
    <span className={styles.cardCopy}><strong>{video.title}</strong><span>{video.speaker}{video.year ? ` · ${video.year}` : ""}</span>{video.location && <span>{video.location}</span>}{(video.description || description) && <span className={styles.videoDescription}>{video.description || description}</span>}</span>
  </a>;
}
