"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import styles from "./BlogHero.module.css";

interface SubBlogCard {
  id: string;
  slug: string;
  category: string;
  title: string;
  date: string;
  image: string;
}

const FEATURED_MAIN_BLOG = {
  slug: "sugar-free-sweets-for-diabetics",
  category: "Diabetes",
  title: "Sugar Free Sweets for Diabetics: How to Enjoy Diwali Without Blood Sugar Spikes?",
  subtext: "Doctor-backed festive dietary guide on natural low-glycemic sweeteners, portion control, and fiber pairing to prevent acute glucose spikes.",
  date: "Nov 2, 2026",
  image: "/Specialities icons/Endocrinology.jpeg",
};

const SUB_BLOG_CARDS: SubBlogCard[] = [
  {
    id: "can-stroke-symptoms-disappear-within-minutes",
    slug: "can-stroke-symptoms-disappear-within-minutes",
    category: "Neurology",
    title: "Can Stroke Symptoms Disappear Within Minutes? TIA Warning Signs You Should Never Ignore",
    date: "Oct 30, 2026",
    image: "/Specialities icons/Neurology.jpeg",
  },
  {
    id: "chikungunya-joint-pain-why-it-lasts",
    slug: "chikungunya-joint-pain-why-it-lasts",
    category: "Rheumatology",
    title: "Chikungunya Joint Pain: Why It Lasts for Months and When to See a Doctor",
    date: "Oct 30, 2026",
    image: "/Specialities icons/Rheumatology.jpeg",
  },
  {
    id: "impact-of-air-pollution-on-heart-health",
    slug: "impact-of-air-pollution-on-heart-health",
    category: "Cardiology",
    title: "Impact of Air Pollution on Heart Health: Risks, Symptoms and Prevention",
    date: "Oct 30, 2026",
    image: "/Specialities icons/Cardiology.jpeg",
  },
];

export default function BlogHero() {
  return (
    <section className={styles.heroSection} data-nav-theme="dark">
      {/* Background Main Blog Image with Scrim */}
      <div className={styles.heroBg}>
        <Image
          src={FEATURED_MAIN_BLOG.image}
          alt={FEATURED_MAIN_BLOG.title}
          fill
          priority
          sizes="100vw"
          className={styles.heroBgImage}
        />
        <div className={styles.scrimOverlay} />
      </div>

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

        {/* Featured Main Blog Content (Title, Subtext, CTA) */}
        <div className={styles.featuredContent}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={styles.categoryLabel}
          >
            {FEATURED_MAIN_BLOG.category}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroTitle}
          >
            {FEATURED_MAIN_BLOG.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroSubtitle}
          >
            {FEATURED_MAIN_BLOG.subtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className={styles.actionRow}
          >
            <Link
              href={`/blog/${FEATURED_MAIN_BLOG.slug}`}
              className={styles.primaryBtn}
            >
              <span>Read Full Article</span>
              <ArrowRight size={16} />
            </Link>
            <span className={styles.publishDate}>{FEATURED_MAIN_BLOG.date}</span>
          </motion.div>
        </div>

        {/* 3 Sub-Cards with Glassmorphism (Only Image, Category, Title, Date) */}
        <div className={styles.subCardsGrid}>
          {SUB_BLOG_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/blog/${card.slug}`} className={styles.subCard}>
                <div className={styles.subCardBody}>
                  <span className={styles.subCardCategory}>{card.category}</span>
                  <h3 className={styles.subCardTitle} title={card.title}>
                    {card.title}
                  </h3>
                  <span className={styles.subCardDate}>{card.date}</span>
                </div>

                <div className={styles.subCardImageWrap}>
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="110px"
                    className={styles.subCardImage}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
