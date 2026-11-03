"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, UserCheck } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import styles from "./BlogHero.module.css";

interface SubBlogCard {
  id: string;
  slug: string;
  category: string;
  title: string;
  author: string;
  readTime: string;
  image: string;
}

const SUB_BLOG_CARDS: SubBlogCard[] = [
  {
    id: "can-stroke-symptoms-disappear-within-minutes",
    slug: "can-stroke-symptoms-disappear-within-minutes",
    category: "Neurology",
    title: "Can Stroke Symptoms Disappear Within Minutes? TIA Warning Signs",
    author: "Dr. Gourav Goyal",
    readTime: "5 min read",
    image: "/Specialities icons/Neurology.jpeg",
  },
  {
    id: "sugar-free-sweets-for-diabetics",
    slug: "sugar-free-sweets-for-diabetics",
    category: "Diabetes",
    title: "Sugar Free Sweets for Diabetics: How to Enjoy Festivities Safely",
    author: "NH Endocrinology",
    readTime: "4 min read",
    image: "/Specialities icons/Endocrinology.jpeg",
  },
  {
    id: "chikungunya-joint-pain-why-it-lasts",
    slug: "chikungunya-joint-pain-why-it-lasts",
    category: "Rheumatology",
    title: "Chikungunya Joint Pain: Why It Lasts for Months & Specialist Care",
    author: "NH Rheumatology",
    readTime: "5 min read",
    image: "/Specialities icons/Rheumatology.jpeg",
  },
];

export default function BlogHero() {
  return (
    <section className={styles.heroSection} data-nav-theme="dark">
      {/* Background Main Image with Dark Overlays */}
      <div className={styles.heroBg}>
        <Image
          src="/images/backgrounds/leadership-bg.png"
          alt="Narayana Health medical library and clinical care"
          fill
          priority
          sizes="100vw"
          className={styles.heroBgImage}
        />
        <div className={styles.topVignette} />
        <div className={styles.bottomScrim} />
      </div>

      <div className={styles.heroInner}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Health Library", href: "/treatments" },
              { label: "Blogs & Clinical Insights" },
            ]}
            theme="dark"
          />
        </div>

        {/* Featured Main Blog Header */}
        <div className={styles.featuredMainContent}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={styles.eyebrowRow}
          >
            <span className={styles.featuredEyebrowBadge}>
              <span className={styles.pulseDot} />
              FEATURED MEDICAL GUIDE
            </span>
            <span className={styles.categoryPill}>Cardiology &amp; Cardiac Care</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroTitle}
          >
            Understanding Heart Health: 5 Critical Tips to Keep Your Heart Strong
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroSubtitle}
          >
            Essential lifestyle habits, dietary strategies, and preventive cardiovascular screening guidelines authored and peer-reviewed by Dr. Devi Prasad Shetty.
          </motion.p>

          {/* Value Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={styles.valueBadgesRow}
          >
            <div className={styles.valueBadge}>
              <UserCheck size={15} className={styles.badgeIcon} />
              <span>Dr. Devi Prasad Shetty</span>
            </div>
            <div className={styles.valueBadge}>
              <Clock size={15} className={styles.badgeIcon} />
              <span>5 Min Read</span>
            </div>
            <div className={styles.valueBadge}>
              <ShieldCheck size={15} className={styles.badgeIcon} />
              <span>100% Doctor Reviewed</span>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={styles.actionRow}
          >
            <Link
              href="/blog/understanding-heart-health-5-tips"
              className={styles.primaryReadBtn}
            >
              <span>Read Full Article</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* 3 Sub-Cards with Glassmorphism (Matching Health Packages style) */}
        <div className={styles.subBlogSection}>
          <div className={styles.subBlogHeaderRow}>
            <span className={styles.subBlogHeaderLabel}>Trending Clinical Guides</span>
            <div className={styles.subBlogHeaderLine} />
          </div>

          <div className={styles.subCardsGrid}>
            {SUB_BLOG_CARDS.map((sub, idx) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/blog/${sub.slug}`} className={styles.subCard}>
                  <div className={styles.subCardContent}>
                    <div className={styles.subCardMeta}>
                      <span className={styles.subCardCategory}>{sub.category}</span>
                      <span className={styles.subCardReadTime}>
                        <Clock size={12} />
                        {sub.readTime}
                      </span>
                    </div>

                    <h3 className={styles.subCardTitle} title={sub.title}>
                      {sub.title}
                    </h3>

                    <div className={styles.subCardFooter}>
                      <span className={styles.subCardAuthor}>{sub.author}</span>
                      <span className={styles.subCardCta}>
                        Read <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>

                  <div className={styles.subCardImageWrap}>
                    <Image
                      src={sub.image}
                      alt={sub.title}
                      fill
                      sizes="120px"
                      className={styles.subCardImage}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
