"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from "framer-motion";
import { 
  Check, 
  CheckCircle2, 
  X, 
  Link as LinkIcon, 
  PhoneCall, 
  ArrowUpRight, 
  Calendar, 
  Activity, 
  Plus,
  Minus,
  Share2
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { getProcedureDetailData, ProcedureDetailData } from "@/data/procedureDetailGenerator";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import SpecialityFAQ from "@/components/ui/SpecialityFAQ";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalReviewedBySection, {
  ClinicalSummaryBanner,
  ClinicalEditorialFigures,
} from "@/components/ui/ClinicalReviewedBySection";
import {
  NearbySpecialistsCarousel,
  NearbyCareCentresCarousel,
} from "@/components/ui/NearbyClinicalCarousels";
import ShareWidget from "@/components/ui/ShareWidget";
import ContactCareSidebarCard from "@/components/ui/ContactCareSidebarCard";
import ClinicalAtAGlanceCard from "@/components/ui/ClinicalAtAGlanceCard";
import styles from "./ProcedureDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProcedureDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  
  // Dynamically resolve clinical procedure data tailored to this exact procedure
  const detail: ProcedureDetailData = getProcedureDetailData(slug);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // V2: Scroll-driven dynamic transition progress matching Blogs page (dark -> black -> white)
  const v4Progress = useMotionValue(0);

  useEffect(() => {
    const updateV4Transition = () => {
      // Replicating the smooth Blogs page transition:
      // At scrollY = 0..36px, keep 100% dark (#060c18).
      // From 36px to 360px as Our Doctors & reading canvas enter view, smoothly transition
      // across one unified canvas: dark (#060c18) -> black (#03060c) -> pure white (#ffffff)
      const sy = window.scrollY || 0;
      const startScroll = 36;
      const endScroll = 360;
      const raw = (sy - startScroll) / (endScroll - startScroll);
      const clamped = Math.max(0, Math.min(1, raw));
      v4Progress.set(clamped);
    };

    updateV4Transition();
    window.addEventListener("scroll", updateV4Transition, { passive: true });
    window.addEventListener("resize", updateV4Transition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateV4Transition);
      window.removeEventListener("resize", updateV4Transition);
    };
  }, [v4Progress]);

  // Smoothly crossfade stationary hero photo into the unified dynamic canvas so there is ZERO horizontal gradient seam
  const heroCanvasOpacity = useTransform(v4Progress, [0, 0.38, 0.68], [1, 0.75, 0]);

  // Hero bottom metrics dynamic color inversion as the unified canvas transitions from dark/black to white
  const heroStatNumColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]
  );
  const heroStatLabelColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.50)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]
  );
  const heroStatDividerColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]
  );

  // V2: Smooth Dark -> Deep Black -> Pure White transition (replicating Blogs page Medical Experts -> Why Choose NH)
  // Holds deep black through 0.40 then smoothly crosses through crisp alabaster to pure white (never lingering in mid-gray)
  const v2BgColor = useTransform(
    v4Progress,
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );
  const v2HeadingColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]
  );
  const v2SubtitleColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.76)", "rgba(255, 255, 255, 0.82)", "#475569", "#64748b"]
  );
  const v2BodyColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.84)", "rgba(255, 255, 255, 0.86)", "#334155", "#374151"]
  );
  const v2MutedColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.62)", "rgba(255, 255, 255, 0.68)", "#64748b", "#64748b"]
  );
  const v2TocLinkColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.82)", "#475569", "#4b5563"]
  );
  const v2TocActiveColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["#38bdf8", "#38bdf8", "#034EA2", "#034EA2"]
  );
  const v2TocActiveBg = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(56, 189, 248, 0.12)", "rgba(56, 189, 248, 0.14)", "rgba(3, 78, 162, 0.08)", "rgba(3, 78, 162, 0.08)"]
  );
  const v2BorderColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.16)", "rgba(15, 23, 42, 0.09)", "rgba(15, 23, 42, 0.08)"]
  );
  const v2CardBg = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.08)", "#f8fafc", "#ffffff"]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Scroll listener for:
  // 1. Sticky active Table of Contents
  // 2. Transforming hero Book Consultation CTA into the bottom-right floating FAB dock
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPos > 320);

      const sections = detail.toc.map((item) => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = scrollPos + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [detail.toc]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: detail.title,
          text: detail.leadParagraph,
          url: window.location.href,
        });
      } catch {
        // User dismissed
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2400);
    }
  };

  return (
    <motion.div
      className={styles.detailPageContainer}
      style={
        {
          backgroundColor: v2BgColor,
          "--v2-bg": v2BgColor,
          "--v2-heading": v2HeadingColor,
          "--v2-subtitle": v2SubtitleColor,
          "--v2-body": v2BodyColor,
          "--v2-muted": v2MutedColor,
          "--v2-toc-link": v2TocLinkColor,
          "--v2-toc-active": v2TocActiveColor,
          "--v2-toc-active-bg": v2TocActiveBg,
          "--v2-border": v2BorderColor,
          "--v2-card-bg": v2CardBg,
          "--hero-bottom-bg": v2BgColor,
          "--stat-num-color": heroStatNumColor,
          "--stat-label-color": heroStatLabelColor,
          "--stat-divider-color": heroStatDividerColor,
          "--summary-bg": "rgba(var(--slate-50-rgb), 0.85)",
          "--summary-border": "rgba(var(--slate-900-rgb), 0.08)",
          "--summary-accent": "var(--color-primary, var(--blue-brand))",
          "--summary-text": "var(--slate-800)",
          "--summary-badge-bg": "var(--white)",
          "--summary-badge-text": "var(--slate-700)",
        } as unknown as React.CSSProperties
      }
    >
      {/* ─── STATIONARY ATMOSPHERIC BACKGROUND CANVAS (FIXED IN VIEWPORT) ──── */}
      <motion.div
        className={styles.stationaryCanvas}
        aria-hidden="true"
        style={{ opacity: heroCanvasOpacity }}
      >
        <motion.div
          className={styles.stationaryMotionWrapper}
          initial={{ scale: 1.12, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={detail.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.stationaryImage}
          />
        </motion.div>
        <div className={styles.stationaryCanvasOverlay} />
      </motion.div>

      {/* ─── DETAIL HERO (FULL BACKGROUND ATMOSPHERIC GRADIENT & METRICS) ───── */}
      <section
        className={`${styles.detailHero} ${styles.detailHeroV2}`}
        data-nav-theme="dark"
      >
        {/* Hero contrast overlay (crossfades seamlessly into unified dynamic canvas on scroll) */}
        <motion.div
          className={styles.heroBgOverlay}
          style={{ opacity: heroCanvasOpacity }}
        />

        <div className={styles.heroInner}>
          <motion.div 
            className={styles.heroLeftCol}
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.breadcrumbsWrapper}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Treatments & Procedures", href: "/treatments" },
                  { label: detail.shortTitle },
                ]}
                theme="dark"
              />
            </div>

            {/* Clean Uppercase Eyebrow with proper breathing room */}
            <div className={styles.heroEyebrow}>
              {detail.speciality}
            </div>

            {/* Refined, Balanced Title */}
            <h1 className={styles.heroMainTitle}>
              {detail.heroTitle}
            </h1>

            {/* 4-Line Small Summary Subtext of Detail Page */}
            {(detail.leadParagraph || detail.heroSubtitle) && (
              <p className={styles.heroSubTitle}>
                {detail.leadParagraph || detail.heroSubtitle}
              </p>
            )}

            {/* Actions Row: Primary CTA Only */}
            <div className={styles.heroActionsRow}>
              <Link 
                href={`/doctors?speciality=${encodeURIComponent(detail.speciality)}`} 
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Book Consultation</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>
            </div>
          </motion.div>

          {/* Bottom Metrics Row (Below Title, Subtext & CTA - Matching CSR Hero) */}
          <motion.div 
            className={styles.metricsBottomWrap}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.statsGrid}>
              {detail.metrics.successRate && (
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.successRate} />
                  </span>
                  <span className={styles.statLabel}>Success Rate</span>
                </div>
              )}
              {detail.metrics.duration && (
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.duration} />
                  </span>
                  <span className={styles.statLabel}>Duration</span>
                </div>
              )}
              {detail.metrics.hospitalStay && (
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.hospitalStay} />
                  </span>
                  <span className={styles.statLabel}>Typical Stay</span>
                </div>
              )}
              {detail.metrics.recoveryTime && (
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.recoveryTime} />
                  </span>
                  <span className={styles.statLabel}>Recovery Period</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY OVER STATIONARY ATMOSPHERIC CANVAS ────────── */}
      <motion.div
        className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}
        style={{ backgroundColor: v2BgColor }}
      >
        <main className={styles.mainLayoutContainer}>
          {/* ─── TOP FEATURED DOCTORS SECTION (SHOWN FOR THIS PROCEDURE DIRECTLY BELOW HERO) ─── */}
          {detail.topDoctors && detail.topDoctors.length > 0 && (
            <section className={styles.topDoctorsSection} id="our-doctors" aria-label="Our Doctors">
              <div className={styles.topDoctorsHeader}>
                <motion.h2 
                  className={styles.topDoctorsTitle}
                  style={{
                    color: v2HeadingColor,
                    ["--sweep-final-color" as string]: v2HeadingColor,
                  }}
                >
                  <TextSweepEffect
                    words={["Our Doctors"]}
                    sweepMs={1500}
                    sweepColor="#034EA2"
                    sweepHighlightColor="#ED1C24"
                    finalColor="var(--sweep-final-color, #0f172a)"
                  />
                </motion.h2>
                <motion.p 
                  className={styles.topDoctorsSubtitle}
                  style={{
                    color: v2SubtitleColor,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Senior Narayana Health clinicians answering patient queries, providing second opinions, and performing advanced {detail.shortTitle.toLowerCase()} procedures.
                </motion.p>
              </div>

              <div className={styles.topDoctorsGrid}>
                {detail.topDoctors.slice(0, 2).map((doc, idx) => (
                  <div key={idx} className={styles.doctorBlendCard}>
                    {/* Left: Full Image Blending onto Background */}
                    <div className={styles.doctorImageBlendCol}>
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        priority
                        sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 420px"
                        className={styles.doctorBlendImg}
                      />
                      <div className={styles.doctorImageBlendOverlay} />
                    </div>

                    {/* Right: Text on that Style */}
                    <div className={styles.doctorTextCol}>
                      <div className={styles.doctorTextTop}>
                        {doc.bio && (
                          <p className={styles.doctorCardBio}>
                            {doc.bio}
                          </p>
                        )}
                      </div>

                      <div className={styles.doctorTextBottom}>
                        <h3 className={styles.doctorCardName}>
                          {doc.name}
                        </h3>
                        <div className={styles.doctorCardRole}>
                          {doc.designation}
                        </div>
                        <div className={styles.doctorMetaBlock}>
                          <span className={styles.doctorExperienceText}>
                            {doc.experience}
                          </span>
                          <span className={styles.doctorMetaDot} aria-hidden="true">•</span>
                          <span className={styles.doctorHospitalName}>
                            {doc.hospital.replace(", Bangalore", "").replace(", Bengaluru", "")}
                          </span>
                        </div>
                        <div className={styles.doctorCtaContainer}>
                          <Link
                            href={`/doctors?doctor=${encodeURIComponent(doc.name)}`}
                            className={styles.doctorProfileLink}
                          >
                            <span>View Profile</span>
                          </Link>
                          <span className={styles.doctorCtaDivider} aria-hidden="true">|</span>
                          <Link
                            href={`/doctors?speciality=${encodeURIComponent(detail.speciality)}&doctor=${encodeURIComponent(doc.name)}`}
                            className={styles.doctorConsultLink}
                          >
                            <span>Consult Now</span>
                            <ArrowUpRight size={13} className={styles.ctaArrow} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <motion.div 
                className={styles.topDoctorsDivider} 
                style={{
                  backgroundColor: v2BorderColor,
                }}
              />
            </section>
          )}

          <div className={styles.twoColumnGrid}>
            {/* ─── LEFT COLUMN: UNBOXED SECTION SELECTOR ON GRADIENT ─────── */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <Activity size={13} className={styles.tocEyebrowIcon} />
                  <span>On This Page</span>
                </div>
                <nav className={styles.tocNavRail} aria-label="Table of contents">
                  <ul className={styles.tocList}>
                    {detail.toc.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <li key={item.id} className={styles.tocListItem}>
                          <a
                            href={`#${item.id}`}
                            className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const el = document.getElementById(item.id);
                              if (el) {
                                const isMobileView = typeof window !== "undefined" && window.innerWidth <= 960;
                                const yOffset = isMobileView ? -112 : -88;
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
                                setActiveSection(item.id);
                              }
                            }}
                          >
                            <span className={styles.tocIndicatorMarker} aria-hidden="true" />
                            <span className={styles.tocLinkLabel}>{item.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Mobile Persistent Share Pill inside sticky header */}
              <button
                type="button"
                className={styles.mobileStickyShareBtn}
                onClick={handleShare}
                aria-label="Share this guide"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>

              {/* Standardized Share Widget with Twitter, LinkedIn, Facebook, Copy Link */}
              <ShareWidget shareTitle={detail.title} />

              {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
              <ContactCareSidebarCard theme="dynamic" />
            </aside>

          {/* ─── RIGHT COLUMN: ARTICLE DETAILS (UNIFIED EDITORIAL LAYOUT) ─── */}
          <article className={styles.articleContent}>
            {/* Minimal Non-Intrusive Clinical Action Pathway Strip */}
            <ClinicalAtAGlanceCard
              bookingHref="/book-an-appointment"
              secondOpinionHref="/book-an-appointment?flow=second-opinion"
              theme="dynamic"
            />

            {/* 1. Overview & Clinical Executive Summary */}
            <section id="overview" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.title}
              </h2>
              <ClinicalSummaryBanner
                summary={`${detail.leadParagraph} ${detail.whatIsIt.description}`}
                reviewerName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
                theme="dynamic"
              />

              {/* Clean Clinical Figure (No nested cards or duplicate metrics) */}
              <div className={styles.clinicalFigureContainer}>
                <Image
                  src={detail.heroImage}
                  alt={`${detail.title} clinical reference`}
                  fill
                  sizes="(max-width: 900px) 100vw, 840px"
                  className={styles.clinicalFigureImage}
                />
                <div className={styles.clinicalFigureCaption}>
                  Clinical Reference &middot; Narayana Health {detail.speciality} Care Protocol
                </div>
              </div>
            </section>

            {/* 2. What Is It? */}
            <section id="what-is-it" className={styles.sectionBlock}>
              <h3 className={styles.subSectionTitle}>
                {detail.whatIsIt.title}
              </h3>
              <p className={styles.bodyParagraph}>
                {detail.whatIsIt.description}
              </p>
              <div className={styles.keyPointsCard}>
                <ul className={styles.bulletList}>
                  {detail.whatIsIt.keyPoints.map((point, i) => (
                    <li key={i} className={styles.bulletItem}>
                      <CheckCircle2 size={16} color="#034EA2" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3. Clickable Symptoms & Warning Signs (Interactive Triage Signal List) */}
            <section id="symptoms" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.symptoms.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {detail.symptoms.description}
              </p>
              <div className={styles.symptomsTriageList}>
                {detail.symptoms.items.map((sym, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(sym.name)}`}
                    className={styles.symptomTriageItem}
                    title={`Explore clinical guidance for ${sym.name}`}
                  >
                    <div className={styles.symptomTriageIndicator}>
                      <span className={styles.triageSignalDot} />
                    </div>
                    <div className={styles.symptomTriageContent}>
                      <span className={styles.symptomTriageName}>{sym.name}</span>
                      <span className={styles.symptomTriageDesc}>&mdash; {sym.desc}</span>
                    </div>
                    <ArrowUpRight size={14} className={styles.symptomTriageArrow} />
                  </Link>
                ))}
              </div>
            </section>

            {/* 4. Indications & Who Needs Care (Structured Clinical Condition Dossier) */}
            <section id="who-needs-care" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.whoNeedsCare.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {detail.whoNeedsCare.description}
              </p>
              <div className={styles.conditionDossierContainer}>
                {detail.whoNeedsCare.conditions.map((item, i) => (
                  <div key={i} className={styles.conditionDossierRow}>
                    <div className={styles.conditionDossierIconWrap}>
                      <Activity size={15} color="#034EA2" />
                    </div>
                    <div className={styles.conditionDossierBody}>
                      <h4 className={styles.conditionDossierTitle}>{item.name}</h4>
                      <p className={styles.conditionDossierDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. When Is It Recommended? */}
            <section id="when-recommended" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.whenRecommended.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {detail.whenRecommended.description}
              </p>
              <ul className={styles.bulletList} style={{ marginTop: "16px" }}>
                {detail.whenRecommended.recommendations.map((rec, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <CheckCircle2 size={16} color="#034EA2" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 6. Eligibility vs Non-Eligibility */}
            <section id="eligibility" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.eligibility.title}
              </h2>
              <div className={styles.eligibilityRow}>
                <div className={styles.eligibilityCol}>
                  <div className={styles.eligibilityHeader}>
                    <CheckCircle2 size={17} color="#15803d" />
                    <h3 className={styles.eligibilityHeading}>General Eligibility Criteria</h3>
                  </div>
                  <ul className={styles.bulletList}>
                    {detail.eligibility.eligiblePoints.map((pt, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <Check size={14} color="#15803d" style={{ flexShrink: 0, marginTop: "3px" }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div id="who-not-eligible" className={styles.eligibilityCol}>
                  <div className={styles.eligibilityHeader}>
                    <X size={17} color="#b91c1c" />
                    <h3 className={styles.eligibilityHeading}>Contraindications &amp; Precautions</h3>
                  </div>
                  <ul className={styles.bulletList}>
                    {detail.eligibility.notEligiblePoints.map((pt, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <X size={14} color="#b91c1c" style={{ flexShrink: 0, marginTop: "3px" }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. Surgical Approach & Steps */}
            <section id="surgical-procedure" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.approach.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {detail.approach.description}
              </p>

              {/* Clean Editorial Step Sequence (No label overload) */}
              <div className={styles.approachSequence}>
                {detail.approach.steps.map((st, i) => (
                  <div key={i} className={styles.approachStepItem}>
                    <div className={styles.stepNumCol}>
                      <span className={styles.stepBadge}>0{i + 1}</span>
                    </div>
                    <div className={styles.stepInfoCol}>
                      <h3 className={styles.stepTitle}>{st.title}</h3>
                      <p className={styles.stepDesc}>{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ClinicalEditorialFigures
                items={[
                  {
                    src: "/images/procedures/procedure_surgery.png",
                    alt: `${detail.shortTitle} surgical suite`,
                    caption: `Advanced Surgical & Interventional Suite · Precision ${detail.speciality} Care at Narayana Health`,
                  },
                  {
                    src: "/images/procedures/procedure_mri.png",
                    alt: `${detail.shortTitle} pre-operative imaging`,
                    caption: "High-Resolution Pre-Procedure Diagnostic Mapping & 3D Navigation",
                  },
                ]}
              />
            </section>

            {/* 8. Recovery Care & Milestones */}
            <section id="recovery-care" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.recoveryCare.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {detail.recoveryCare.description}
              </p>

              {/* Clean Unified Recovery Milestones Track */}
              <div className={styles.recoveryTrackCard}>
                <div className={styles.recoveryTrackHeader}>
                  <h3 className={styles.recoveryTrackTitle}>Clinical Recovery Milestones</h3>
                  {detail.metrics.recoveryTime && (
                    <span className={styles.recoveryEstPill}>
                      Expected Duration: {detail.metrics.recoveryTime}
                    </span>
                  )}
                </div>

                <div className={styles.recoveryMilestonesGrid}>
                  <div className={styles.milestoneBox}>
                    <span className={styles.milestoneNum}>01</span>
                    <h4 className={styles.milestoneName}>ICU Protocol</h4>
                    <span className={styles.milestoneDays}>Days 1 - 3</span>
                    <p className={styles.milestoneText}>Continuous hemodynamic monitoring, organ perfusion, and vital stability.</p>
                  </div>

                  <div className={styles.milestoneBox}>
                    <span className={styles.milestoneNum}>02</span>
                    <h4 className={styles.milestoneName}>Step-Down Ward</h4>
                    <span className={styles.milestoneDays}>Days 4 - 10</span>
                    <p className={styles.milestoneText}>Bedside ambulation, respiratory therapy, and gradual diet reintroduction.</p>
                  </div>

                  <div className={styles.milestoneBox}>
                    <span className={styles.milestoneNum}>03</span>
                    <h4 className={styles.milestoneName}>Home Transition</h4>
                    <span className={styles.milestoneDays}>Weeks 2 - 4</span>
                    <p className={styles.milestoneText}>Discharge protocol, scheduled telehealth reviews, and progressive mobility pacing.</p>
                  </div>

                  <div className={styles.milestoneBox}>
                    <span className={styles.milestoneNum}>04</span>
                    <h4 className={styles.milestoneName}>Active Recovery</h4>
                    <span className={styles.milestoneDays}>Month 3+</span>
                    <p className={styles.milestoneText}>Resumption of daily work routines, cardiac/physical rehab, and periodic follow-up.</p>
                  </div>
                </div>
              </div>

              <ul className={styles.bulletList} style={{ marginTop: "20px" }}>
                {detail.recoveryCare.highlights.map((item, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <CheckCircle2 size={16} color="#034EA2" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 9. Cost & Insurance (Harmonious Light Theme) */}
            <section id="cost-insurance" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.cost.title}
              </h2>
              <div className={styles.costCard}>
                <div className={styles.costHeader}>
                  <div>
                    <div className={styles.costBadge}>Estimated All-Inclusive Surgery Package</div>
                    <div className={styles.costEstimateText}>{detail.cost.estimateRange}</div>
                    <div className={styles.costInternationalText}>
                      International Patients: {detail.cost.internationalRange}
                    </div>
                  </div>
                  <Link href="/doctors" className={styles.heroPrimaryBtn}>
                    <span>Request Detailed Estimate</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>

                <div className={styles.costInclusionsTitle}>Package Inclusions:</div>
                <div className={styles.costInclusionsGrid}>
                  {detail.cost.inclusions.map((inc, i) => (
                    <div key={i} className={styles.costInclusionItem}>
                      <CheckCircle2 size={15} color="#034EA2" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.costInsuranceNote}>
                  <strong>Insurance &amp; Cashless Support: </strong>
                  {detail.cost.insuranceNote}
                </div>
              </div>
            </section>

            {/* 10. Nearby Specialists Carousel (Modular & Softened Gradient Contrast) */}
            <NearbySpecialistsCarousel
              id="specialists"
              title="Specialist Surgeons & Consultants"
              subtitle="Our senior surgeons and clinical specialists bring decades of experience, board certifications, and high procedural success rates."
              doctors={detail.doctors}
              specialityFilter={detail.speciality}
              actionLabel="Book"
            />

            {/* 11. Equipped Hospitals & Care Centres Carousel (Multi-unit Bangalore & NH Network) */}
            <NearbyCareCentresCarousel
              id="hospitals"
              title="Equipped Surgical Centres & Clinics"
              subtitle="Advanced tertiary hospitals and multispeciality clinical centres across Bangalore and the Narayana Health network equipped with hybrid cath labs and 24×7 critical care."
              hospitals={detail.hospitals}
            />

            {/* 12. FAQs Accordion */}
            <section id="faqs" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Frequently Asked Questions</h2>
              <SpecialityFAQ faqs={detail.faqs} theme="light" fluid />
            </section>

            {/* 13. Dedicated Google E-E-A-T "Reviewed by Dr. ___" Section */}
            <ClinicalReviewedBySection
              doctorName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
              doctorRole="Senior Consultant & Clinical Lead"
              speciality={detail.doctors[0]?.speciality || detail.speciality}
              hospital={detail.doctors[0]?.hospital || "Narayana Health City, Bengaluru"}
              experience={detail.doctors[0]?.experience || "20+ Years Experience"}
              doctorImage={detail.doctors[0]?.image || "/doctors/doc_vivek.jpg"}
            />
          </article>
        </div>
      </main>
      </motion.div>

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        eyebrow="WORLD-CLASS SURGICAL & CLINICAL EXCELLENCE"
        title="Looking for a Surgical Second Opinion or Cost Estimate?"
        subtitle="Our senior surgical boards review complex diagnoses, imaging reports, and recommend minimally invasive surgical alternatives with transparent, all-inclusive pricing."
        primaryBtn={{
          href: `/doctors?speciality=${encodeURIComponent(detail.speciality)}`,
          text: "Book Procedure Consultation",
        }}
        secondaryBtn={{
          href: "/health-packages",
          text: "Explore Health Packages",
        }}
        phoneText="Surgical Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />

      {/* Unified Clinical FAB (Book Consultation, Contact Support, Ask Pulse) */}
      <ClinicalFloatingSideActions
        consultHref={`/doctors?speciality=${encodeURIComponent(detail.speciality)}`}
        consultLabel={"Book\nConsultation"}
        conditionTitle={detail.shortTitle}
        pulseQuery={`I want to know about ${detail.title}: procedure details, eligibility, and expected recovery.`}
        isScrolled={isScrolled}
      />
    </motion.div>
  );
}
