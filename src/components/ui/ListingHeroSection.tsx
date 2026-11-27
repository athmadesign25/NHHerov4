"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import RollingNumber from "@/components/ui/RollingNumber";
import { duration, ease } from "@/lib/motion";
import styles from "./ListingHeroSection.module.css";

export interface ListingHeroCta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "white" | "primary" | "secondary" | "emergency" | "outline" | "ghost";
  icon?: React.ReactNode;
  ariaLabel?: string;
  external?: boolean;
}

export interface ListingHeroStat {
  value: string | number;
  label: string;
  suffix?: string;
}

export interface ListingHeroSectionProps {
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string | string[];
  titleSweepMs?: number;
  subtext: string | React.ReactNode;
  cta?: ListingHeroCta | React.ReactNode;
  stats?: ListingHeroStat[];
  backgroundImage?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export default function ListingHeroSection({
  breadcrumbs,
  title,
  titleSweepMs = 1200,
  subtext,
  cta,
  stats,
  backgroundImage = "/doctor_patient.png",
  imageAlt = "Doctor and clinical team providing compassionate healthcare",
  imagePriority = true,
  className = "",
  children,
  id,
}: ListingHeroSectionProps) {
  // Title content helper (TextSweepEffect or plain text)
  const titleWords = Array.isArray(title) ? title : [title];

  // CTA Renderer helper
  const renderCta = () => {
    if (!cta) return null;

    if (React.isValidElement(cta)) {
      return <div className={styles.ctaWrap}>{cta}</div>;
    }

    const ctaConfig = cta as ListingHeroCta;
    const variantClass =
      ctaConfig.variant === "emergency"
        ? styles.ctaBtnEmergency
        : ctaConfig.variant === "primary"
        ? styles.ctaBtnPrimary
        : ctaConfig.variant === "secondary"
        ? styles.ctaBtnSecondary
        : ctaConfig.variant === "outline"
        ? styles.ctaBtnOutline
        : ctaConfig.variant === "ghost"
        ? styles.ctaBtnGhost
        : ""; // Default is white hero button

    const content = (
      <>
        <span>{ctaConfig.label}</span>
        {ctaConfig.icon && <span className={styles.ctaIcon}>{ctaConfig.icon}</span>}
      </>
    );

    if (ctaConfig.href) {
      if (ctaConfig.external) {
        return (
          <div className={styles.ctaWrap}>
            <a
              href={ctaConfig.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.ctaBtn} ${variantClass}`}
              aria-label={ctaConfig.ariaLabel || ctaConfig.label}
            >
              {content}
            </a>
          </div>
        );
      }

      return (
        <div className={styles.ctaWrap}>
          <Link
            href={ctaConfig.href}
            className={`${styles.ctaBtn} ${variantClass}`}
            aria-label={ctaConfig.ariaLabel || ctaConfig.label}
          >
            {content}
          </Link>
        </div>
      );
    }

    return (
      <div className={styles.ctaWrap}>
        <button
          type="button"
          onClick={ctaConfig.onClick}
          className={`${styles.ctaBtn} ${variantClass}`}
          aria-label={ctaConfig.ariaLabel || ctaConfig.label}
        >
          {content}
        </button>
      </div>
    );
  };

  return (
    <section className={`${styles.hero} ${className}`} data-nav-theme="dark" id={id}>
      {/* ── 1. BACKGROUND LAYERS & PARALLAX IMAGE ── */}
      <div className={styles.heroBg}>
        <motion.div
          className={styles.heroBgMotion}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: ease.spring }}
        >
          <Image
            src={backgroundImage}
            alt={imageAlt}
            fill
            priority={imagePriority}
            sizes="100vw"
            className={styles.heroBgImage}
          />
          {/* Targeted Glass & Gradient Scrims for text clarity */}
          <div className={styles.heroGlassOverlay} />
          <div className={styles.heroLeftScrim} />
          <div className={styles.heroBgOverlay} />
        </motion.div>
      </div>

      {/* ── 2. FOREGROUND CONTENT (265.92PX GUTTERS ON DESKTOP) ── */}
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.div
              className={styles.breadcrumbsContainer}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, delay: 0.08, ease: ease.out }}
            >
              <Breadcrumbs items={breadcrumbs} theme="dark" />
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            id={id ? `${id}-title` : "listing-hero-title"}
            tabIndex={-1}
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.14, ease: ease.spring }}
          >
            <TextSweepEffect
              words={titleWords}
              sweepMs={titleSweepMs}
              delayMs={80}
              finalColor="#FFFFFF"
            />
          </motion.h1>

          {/* Subtext */}
          {subtext && (
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.6, ease: ease.spring }}
            >
              {subtext}
            </motion.p>
          )}

          {/* Button - CTA */}
          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.72, ease: ease.spring }}
            >
              {renderCta()}
            </motion.div>
          )}

          {/* And then below it - Stats */}
          {stats && stats.length > 0 && (
            <motion.div
              className={styles.statsContainer}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.8, ease: ease.spring }}
            >
              <div className={styles.statsGrid}>
                {stats.map((stat, idx) => (
                  <div key={idx} className={styles.metricItem}>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%", overflow: "hidden" }}>
                      <div className={styles.metricValue}>
                        <RollingNumber
                          value={`${stat.value}${stat.suffix || ""}`}
                          delay={0.15 + idx * 0.08}
                          duration={1.2}
                        />
                      </div>
                      <div className={styles.metricLabel}>
                        {stat.label.split("\n").map((line, lIdx, arr) => (
                          <React.Fragment key={lIdx}>
                            {line}
                            {lIdx !== arr.length - 1 && (
                              <>
                                <br className={styles.metricBreak} />
                                <span className={styles.metricSpace}> </span>
                              </>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optional Extra Children */}
          {children}
        </div>
      </div>
    </section>
  );
}

