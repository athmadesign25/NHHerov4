"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import styles from "./BlogArticleCard.module.css";

export interface BlogArticleCardProps {
  title: string;
  href?: string;
  image?: string;
  category?: string;
  date?: string;
  author?: string;
  headingLevel?: "h3" | "h4";
  external?: boolean;
  sizes?: string;
  className?: string;
  mediaType?: "article" | "video";
  landscape?: boolean;
  onPlay?: () => void;
  previewVideoId?: string;
}

function authorInitials(author: string) {
  if (author.toLowerCase().includes("narayana health")) return "NH";
  const parts = author.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : author.trim().slice(0, 2).toUpperCase();
}

/** The article-library card, shared with doctor profiles without inventing metadata. */
export default function BlogArticleCard({
  title,
  href,
  image,
  category,
  date,
  author,
  headingLevel: Heading = "h3",
  external = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
  mediaType = "article",
  landscape = false,
  onPlay,
  previewVideoId,
}: BlogArticleCardProps) {
  const [previewing, setPreviewing] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPreview = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = null;
    setPreviewing(false);
  };
  const startPreview = () => {
    if (!previewVideoId || mediaType !== "video" || !/^[\w-]{11}$/.test(previewVideoId)) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    stopPreview();
    previewTimer.current = setTimeout(() => setPreviewing(true), 600);
  };
  useEffect(() => {
    const stop = () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      previewTimer.current = null;
      setPreviewing(false);
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);
  const [failedImage, setFailedImage] = useState<string>();
  const imageSrc = image?.trim();
  const hasImage = Boolean(imageSrc && failedImage !== imageSrc);
  const authorName = author?.trim();
  const initials = authorName ? authorInitials(authorName) : undefined;
  const isVideo = mediaType === "video";
  const play = isVideo ? onPlay : undefined;
  const interactive = Boolean(href || play);
  const surfaceClass = `${styles.surface}${landscape ? ` ${styles.landscape}` : ""}${isVideo ? ` ${styles.video}` : ""}${interactive ? ` ${styles.interactive}` : ""}${hasImage ? "" : ` ${styles.withoutImage}`}`;
  const actionLabel = isVideo ? `Play ${title}` : title;

  const content = (
    <>
      {hasImage && imageSrc && (
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes={sizes}
          className={styles.image}
          loading="lazy"
          draggable={false}
          onError={() => setFailedImage(imageSrc)}
        />
      )}
      {previewing && previewVideoId && (
        <iframe
          className={styles.preview}
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(previewVideoId)}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&disablekb=1`}
          title={`Preview: ${title}`}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      {hasImage && <div className={styles.overlay} aria-hidden="true" />}
      {isVideo && interactive && <span className={styles.play} aria-hidden="true"><Play fill="currentColor" /></span>}
      <div className={styles.content}>
        {(category || date) && (
          <div className={styles.meta}>
            {category && <span className={styles.category}>{category}</span>}
            {category && date && <span className={styles.dot} aria-hidden="true">•</span>}
            {date && <span className={styles.date}>{date}</span>}
          </div>
        )}
        <div className={styles.titleRow}>
          <Heading className={styles.title} title={title}>{title}</Heading>
          {href && !isVideo && <ArrowRight className={styles.arrow} strokeWidth={2.5} aria-hidden="true" />}
        </div>
        {authorName && (
          <div className={styles.authorRow}>
            <span className={`${styles.avatar} ${initials === "NH" ? styles.nhAvatar : styles.doctorAvatar}`} aria-hidden="true">
              {initials}
            </span>
            <span className={styles.authorName}>{authorName}</span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <article className={`${styles.card}${className ? ` ${className}` : ""}`} onDragStart={event => event.preventDefault()}
      onPointerEnter={startPreview}
      onPointerLeave={stopPreview}
      onPointerDown={stopPreview}
      onClickCapture={stopPreview}
    >
      {href ? (
        external ? (
          <a href={href} className={surfaceClass} target="_blank" rel="noopener noreferrer" draggable={false} aria-label={play ? actionLabel : `${actionLabel} (opens in a new tab)`} aria-haspopup={play ? "dialog" : undefined} onClick={event => {
            if (!play || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            play();
          }}>
            {content}
          </a>
        ) : (
          <Link href={href} className={surfaceClass} draggable={false} aria-label={isVideo ? actionLabel : undefined} aria-haspopup={play ? "dialog" : undefined} onClick={event => {
            if (!play || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            play();
          }}>{content}</Link>
        )
      ) : (
        <div className={surfaceClass}>
          {content}
          {play && <button type="button" className={styles.playAction} onClick={play} aria-label={actionLabel} aria-haspopup="dialog" />}
        </div>
      )}
    </article>
  );
}
