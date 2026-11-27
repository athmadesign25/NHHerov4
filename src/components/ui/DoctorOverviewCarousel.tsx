"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./DoctorOverviewCarousel.module.css";

export interface DoctorVideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeId: string;
  videoSrc: string;
  thumbnail: string;
  doctor: {
    name: string;
    role: string;
    hospital: string;
    experience: string;
    avatar: string;
  };
}

const DOCTOR_VIDEOS: DoctorVideoItem[] = [
  {
    id: "doc-vid-1",
    title: "Understanding Advanced Immunotherapy & Targeted Oncology",
    category: "Immunotherapy & Precision Care",
    duration: "4:32",
    youtubeId: "qL2XhH-K3m4",
    videoSrc: "/NH YT Vid 01.mp4",
    thumbnail: "/images/procedures/immunotherapy_hd.jpg",
    doctor: {
      name: "Dr. Anthony Pais",
      role: "Senior Consultant — Surgical Oncology",
      hospital: "Mazumdar Shaw Cancer Centre, Bengaluru",
      experience: "28+ Years Exp",
      avatar: "/doctors/doc_vivek.jpg",
    },
  },
  {
    id: "doc-vid-2",
    title: "Innovations in Minimally Invasive Robotic Onco-Surgery",
    category: "Robotic Surgery",
    duration: "5:18",
    youtubeId: "vB_O5q_7h2w",
    videoSrc: "/NH YT Vid 02.mp4",
    thumbnail: "/images/procedures/cyberknife_hd.jpg",
    doctor: {
      name: "Dr. Usha Lokesh",
      role: "Lead Consultant — Gynaecologic & Robotic Oncology",
      hospital: "Narayana Health City, Bengaluru",
      experience: "19+ Years Exp",
      avatar: "/doctors/doc_ananya.jpg",
    },
  },
  {
    id: "doc-vid-3",
    title: "Precision Radiosurgery: How CyberKnife S7 Protects Healthy Tissues",
    category: "Radiation Oncology",
    duration: "3:45",
    youtubeId: "S3j_6yAELXg",
    videoSrc: "/NH YT Vid 03.mp4",
    thumbnail: "/images/procedures/radiation_oncology_hd.jpg",
    doctor: {
      name: "Dr. Ramesh S. Bilimagga",
      role: "Senior Director — Radiation Oncology",
      hospital: "Narayana Institute of Oncology",
      experience: "35+ Years Exp",
      avatar: "/doctors/doc_bagirath.jpg",
    },
  },
  {
    id: "doc-vid-4",
    title: "Comprehensive Multidisciplinary Care: From Diagnosis to Complete Remission",
    category: "Clinical Excellence",
    duration: "6:10",
    youtubeId: "f8ZJ2zYv-3I",
    videoSrc: "/Doctor patient.mp4",
    thumbnail: "/images/procedures/chemotherapy_hd.jpg",
    doctor: {
      name: "Dr. Devi Prasad Shetty",
      role: "Founder & Chairman — Cardiac & Multi-Organ Care",
      hospital: "Narayana Health",
      experience: "40+ Years Exp",
      avatar: "/doctors/doc_devi_shetty.jpg",
    },
  },
];

export interface DoctorOverviewCarouselProps {
  videos?: DoctorVideoItem[];
}

function DoctorVideoCard({
  item,
  isCenter = true,
  isPlaying = false,
  onPlay,
  onClose,
  onClick,
}: {
  item: DoctorVideoItem;
  isCenter?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onClose?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      className={`${styles.videoCard} ${isCenter ? styles.videoCardActive : styles.videoCardSide}`}
      onClick={!isCenter && onClick ? onClick : undefined}
      role={!isCenter ? "button" : undefined}
      tabIndex={!isCenter ? 0 : undefined}
      aria-label={!isCenter ? `View video: ${item.title}` : undefined}
      onKeyDown={
        !isCenter && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* 16:9 Landscape Video Container */}
      <div className={styles.videoWrapper}>
        {isCenter && isPlaying ? (
          <>
            {/* Active Video Player with YouTube / Local fallback */}
            <iframe
              className={styles.videoIframe}
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              className={styles.closePlayerBtn}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              aria-label="Close video player"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            {/* Landscape Cover Thumbnail */}
            <img
              src={item.thumbnail}
              alt={item.title}
              className={styles.thumbnailImage}
              loading="lazy"
            />

            {/* Ambient Scrim */}
            <div className={styles.bottomOverlay} />
            {!isCenter && <div className={styles.sideCardScrim} aria-hidden />}

            {/* Play Button */}
            {isCenter ? (
              <button
                type="button"
                className={styles.playButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.();
                }}
                aria-label={`Play video: ${item.title}`}
              >
                <Play size={28} fill="currentColor" strokeWidth={0} className={styles.playIcon} />
              </button>
            ) : (
              <div className={`${styles.playButton} ${styles.playButtonSide}`} aria-hidden>
                <Play size={24} fill="currentColor" strokeWidth={0} className={styles.playIcon} />
              </div>
            )}

            {/* Bottom Overlay Title on Video */}
            <div className={styles.videoBottomContent}>
              <h3 className={styles.videoTitle}>{item.title}</h3>
            </div>
          </>
        )}
      </div>

      {/* Doctor Information Bar — Positioned outside the video container */}
      <div className={styles.doctorProfileBar}>
        <div className={styles.doctorProfile}>
          <img
            src={item.doctor.avatar}
            alt={item.doctor.name}
            className={styles.doctorAvatar}
          />
          <div className={styles.doctorMeta}>
            <div className={styles.doctorNameRow}>
              <h4 className={styles.doctorName}>{item.doctor.name}</h4>
            </div>
            <p className={styles.doctorRole}>{item.doctor.role}</p>
            <p className={styles.doctorHospital}>
              <span>{item.doctor.hospital}</span>
              <span className={styles.hospitalDot} />
              <span>{item.doctor.experience}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorOverviewCarousel({ videos = DOCTOR_VIDEOS }: DoctorOverviewCarouselProps = {}) {
  const videoList = videos && videos.length > 0 ? videos : DOCTOR_VIDEOS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = videoList[currentIndex] || videoList[0];
  const totalItems = videoList.length;

  // Infinite looping navigation: side cards on left and right allow wrap-around
  const goToNext = useCallback(() => {
    setIsPlaying(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const goToPrev = useCallback(() => {
    setIsPlaying(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goToIndex = (targetIndex: number) => {
    if (targetIndex === currentIndex) return;
    setIsPlaying(false);
    const diff = (targetIndex - currentIndex + totalItems) % totalItems;
    setDirection(diff <= totalItems / 2 ? 1 : -1);
    setCurrentIndex(targetIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  const EASE_CURVE = [0.16, 1, 0.3, 1] as const;

  // Framer motion slide animation variants for mobile
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 36 : -36,
      opacity: 0,
      filter: "blur(6px)",
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.45,
        ease: EASE_CURVE,
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 36 : -36,
      opacity: 0,
      filter: "blur(6px)",
      scale: 0.98,
      transition: {
        duration: 0.35,
        ease: EASE_CURVE,
      },
    }),
  };

  const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
  const nextIndex = (currentIndex + 1) % totalItems;

  return (
    <div className={styles.carouselContainer} role="region" aria-label="Doctor's Overview Videos">
      {/* DESKTOP 3-CARD PERSPECTIVE STAGE WITH HALF-CUT SIDE CARDS (WEB ONLY) */}
      <div className={`${styles.desktopStage} ${styles.desktopOnly}`}>
        <div className={styles.edgeFadeLeft} aria-hidden />
        <div className={styles.edgeFadeRight} aria-hidden />

        {/* Navigation Arrows (Web only, matching AdvanceTestsCarousel) */}
        <button
          type="button"
          className={`${styles.arrowBtn} ${styles.arrowBtnLeft} ${styles.arrowBtnLight} ${styles.desktopOnly}`}
          onClick={goToPrev}
          aria-label="Previous video"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        <button
          type="button"
          className={`${styles.arrowBtn} ${styles.arrowBtnRight} ${styles.arrowBtnLight} ${styles.desktopOnly}`}
          onClick={goToNext}
          aria-label="Next video"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>

        <div className={styles.desktopCardFrame}>
          {/* Left Peeking Card */}
          <div className={`${styles.sideCardSlot} ${styles.leftCardSlot}`}>
            <DoctorVideoCard
              item={videoList[prevIndex]}
              isCenter={false}
              onClick={goToPrev}
            />
          </div>

          {/* Active Center Card (Natural fluid height, never vertically cropped) */}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={`desktop-card-${currentItem.id}`}
              className={styles.centerMotionCard}
              initial={{
                opacity: 0,
                filter: "blur(6px)",
                x: direction * 48,
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                x: 0,
              }}
              exit={{
                opacity: 0,
                filter: "blur(6px)",
                x: direction * -48,
              }}
              transition={{
                duration: 0.45,
                ease: EASE_CURVE,
              }}
            >
              <DoctorVideoCard
                item={currentItem}
                isCenter={true}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onClose={() => setIsPlaying(false)}
              />
            </motion.div>
          </AnimatePresence>

          {/* Right Peeking Card */}
          <div className={`${styles.sideCardSlot} ${styles.rightCardSlot}`}>
            <DoctorVideoCard
              item={videoList[nextIndex]}
              isCenter={false}
              onClick={goToNext}
            />
          </div>
        </div>
      </div>

      {/* MOBILE SINGLE CARD LAYOUT (MOBILE ONLY) */}
      <div className={`${styles.mobileContainer} ${styles.mobileOnly}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`mobile-${currentItem.id}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <DoctorVideoCard
              item={currentItem}
              isCenter={true}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onClose={() => setIsPlaying(false)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DESKTOP CAROUSEL INDICATOR (Matching AdvanceTestsCarousel) */}
      <div className={`${styles.desktopNavigator} ${styles.desktopOnly}`}>
        {videoList.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.navDot} ${styles.navDotLight} ${
              idx === currentIndex ? `${styles.navDotActive} ${styles.navDotActiveLight}` : ""
            }`}
            onClick={() => goToIndex(idx)}
            aria-label={`Go to video ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : undefined}
          />
        ))}
      </div>

      {/* MOBILE CAROUSEL INDICATOR */}
      <div className={`${styles.mobileNavigator} ${styles.mobileOnly}`}>
        {videoList.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.navDot} ${styles.navDotLight} ${
              idx === currentIndex ? `${styles.navDotActive} ${styles.navDotActiveLight}` : ""
            }`}
            onClick={() => goToIndex(idx)}
            aria-label={`Go to video ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
