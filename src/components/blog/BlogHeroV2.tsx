"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import styles from "./BlogHeroV2.module.css";

export interface ImmersiveBlogStory {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtext: string;
  date: string;
  image: string;
}

export const IMMERSIVE_BLOG_STORIES: ImmersiveBlogStory[] = [
  {
    id: "sugar-free-sweets-for-diabetics",
    slug: "sugar-free-sweets-for-diabetics",
    category: "Diabetes",
    title: "Sugar Free Sweets for Diabetics: How to Enjoy Diwali Without Blood Sugar Spikes?",
    subtext: "Doctor-backed festive dietary guide on natural low-glycemic sweeteners, portion control, and fiber pairing to prevent acute glucose spikes.",
    date: "Nov 2, 2026",
    image: "/images/articles/sugar_free_sweets_diwali.jpg",
  },
  {
    id: "can-stroke-symptoms-disappear-within-minutes",
    slug: "can-stroke-symptoms-disappear-within-minutes",
    category: "Neurology",
    title: "Can Stroke Symptoms Disappear Within Minutes? TIA Warning Signs You Should Never Ignore",
    subtext: "Recognize Transient Ischemic Attacks, the critical BE-FAST screening rule, and why immediate emergency neuro-triage prevents irreversible infarction.",
    date: "Oct 30, 2026",
    image: "/images/specialities/Brain and Spine.jpg",
  },
  {
    id: "chikungunya-joint-pain-why-it-lasts",
    slug: "chikungunya-joint-pain-why-it-lasts",
    category: "Rheumatology",
    title: "Chikungunya Joint Pain: Why It Lasts for Months and When to See a Doctor",
    subtext: "Comprehensive clinical guide to post-viral chronic arthritis, inflammatory cytokines, targeted immunomodulation, and aquatic physical rehabilitation.",
    date: "Oct 30, 2026",
    image: "/images/specialities/Bone & Joint.jpg",
  },
  {
    id: "impact-of-air-pollution-on-heart-health",
    slug: "impact-of-air-pollution-on-heart-health",
    category: "Cardiology",
    title: "Impact of Air Pollution on Heart Health: Risks, Symptoms and Prevention",
    subtext: "How fine particulate matter (PM2.5) induces systemic vascular inflammation, accelerates coronary plaque instability, and protective medical precautions.",
    date: "Oct 30, 2026",
    image: "/images/specialities/Advance Heart Care.jpg",
  },
];

export default function BlogHeroV2() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeStory = IMMERSIVE_BLOG_STORIES[activeIndex];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % IMMERSIVE_BLOG_STORIES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + IMMERSIVE_BLOG_STORIES.length) % IMMERSIVE_BLOG_STORIES.length);
  }, []);

  // Simple auto-rotation every 7 seconds, pauses when hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  return (
    <section
      className={styles.heroSection}
      data-nav-theme="dark"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Blog Hero Carousel"
    >
      {/* ── FULL-BLEED BACKGROUND IMAGE IMMERSION ── */}
      <div className={styles.heroBgWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStory.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroBgMotion}
          >
            <Image
              src={activeStory.image}
              alt={activeStory.title}
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
          </motion.div>
        </AnimatePresence>

        {/* Studio scrim: dark on left for text readability, clear on right for photography */}
        <div className={styles.heroScrim} />
      </div>

      {/* ── INNER HERO CONTENT ── */}
      <div className={styles.heroInner}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" },
            ]}
            theme="dark"
          />
        </div>

        {/* Active Blog Story (Title, Subtext, CTA) */}
        <div className={styles.featuredContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={styles.storyDetails}
            >
              {/* Category & Date */}
              <div className={styles.metaRow}>
                <span className={styles.categoryLabel}>{activeStory.category}</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.publishDate}>{activeStory.date}</span>
              </div>

              {/* Headline */}
              <h1 className={styles.heroTitle}>
                {activeStory.title}
              </h1>

              {/* Subtext */}
              <p className={styles.heroSubtitle}>
                {activeStory.subtext}
              </p>

              {/* Action Row: Read CTA */}
              <div className={styles.actionRow}>
                <Link
                  href={`/blog/${activeStory.slug}`}
                  className={styles.primaryBtn}
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM CENTER CAROUSEL CONTROLS (EXACT DESIGN FROM SCREENSHOT) ── */}
      <div className={styles.bottomControlsWrap}>
        <button
          type="button"
          onClick={prevSlide}
          className={styles.navBtn}
          aria-label="Previous story"
        >
          <ChevronLeft size={20} />
        </button>

        <div className={styles.dotsWrap}>
          {IMMERSIVE_BLOG_STORIES.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`${styles.dot} ${idx === activeIndex ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className={styles.navBtn}
          aria-label="Next story"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
