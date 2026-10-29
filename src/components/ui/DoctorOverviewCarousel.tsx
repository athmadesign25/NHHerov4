"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  ArrowLeft,
  ArrowRight,
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

export default function DoctorOverviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = DOCTOR_VIDEOS[currentIndex];
  const totalItems = DOCTOR_VIDEOS.length;
  const nextItem = currentIndex < totalItems - 1 ? DOCTOR_VIDEOS[currentIndex + 1] : null;

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === totalItems - 1;

  // Reset playing state when slide changes
  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setIsPlaying(false);
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalItems]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsPlaying(false);
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToIndex = (index: number) => {
    if (index === currentIndex) return;
    setIsPlaying(false);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
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

  // Framer motion slide animation variants
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

  return (
    <div className={styles.carouselContainer} role="region" aria-label="Doctor's Overview Videos">
      {/* Animated Single Video Slide Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentItem.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.videoCard}
        >
          {/* 16:9 Landscape Video Container */}
          <div className={styles.videoWrapper}>
            {isPlaying ? (
              <>
                {/* Active Video Player with YouTube / Local fallback */}
                <iframe
                  className={styles.videoIframe}
                  src={`https://www.youtube-nocookie.com/embed/${currentItem.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={currentItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  type="button"
                  className={styles.closePlayerBtn}
                  onClick={() => setIsPlaying(false)}
                  aria-label="Close video player"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </>
            ) : (
              <>
                {/* Landscape Cover Thumbnail */}
                <img
                  src={currentItem.thumbnail}
                  alt={currentItem.title}
                  className={styles.thumbnailImage}
                  loading="lazy"
                />

                {/* Ambient Scrim */}
                <div className={styles.bottomOverlay} />


                {/* Center Play Button */}
                <button
                  type="button"
                  className={styles.playButton}
                  onClick={() => setIsPlaying(true)}
                  aria-label={`Play video: ${currentItem.title}`}
                >
                  <Play size={28} fill="currentColor" strokeWidth={0} className={styles.playIcon} />
                </button>

                {/* Bottom Overlay Title on Video */}
                <div className={styles.videoBottomContent}>
                  <h3 className={styles.videoTitle}>{currentItem.title}</h3>
                </div>
              </>
            )}
          </div>

          {/* Doctor Information Bar — Positioned outside the video container */}
          <div className={styles.doctorProfileBar}>
            <div className={styles.doctorProfile}>
              <img
                src={currentItem.doctor.avatar}
                alt={currentItem.doctor.name}
                className={styles.doctorAvatar}
              />
              <div className={styles.doctorMeta}>
                <div className={styles.doctorNameRow}>
                  <h4 className={styles.doctorName}>{currentItem.doctor.name}</h4>
                </div>
                <p className={styles.doctorRole}>{currentItem.doctor.role}</p>
                <p className={styles.doctorHospital}>
                  <span>{currentItem.doctor.hospital}</span>
                  <span className={styles.hospitalDot} />
                  <span>{currentItem.doctor.experience}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls — Matching ModernCarousel */}
      <div className={styles.navigationWrapper}>
        <div className={styles.indicatorContainer}>
          <span className={styles.indicatorText}>
            {String(currentIndex + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
          </span>
          <div className={styles.indicatorBars}>
            {DOCTOR_VIDEOS.map((item, idx) => (
              <div
                key={item.id}
                className={`${styles.indicatorBar} ${idx === currentIndex ? styles.indicatorBarActive : ""}`}
                onClick={() => goToIndex(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        </div>



        <div className={styles.navButtons}>
          <button
            type="button"
            className={`${styles.navBtn} ${isPrevDisabled ? styles.navBtnDisabled : ""}`}
            onClick={goToPrev}
            disabled={isPrevDisabled}
            aria-label="Previous item"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${isNextDisabled ? styles.navBtnDisabled : ""}`}
            onClick={goToNext}
            disabled={isNextDisabled}
            aria-label="Next item"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
