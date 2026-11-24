"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  const [blendVersion, setBlendVersion] = useState<1 | 2 | 3 | 4>(2);

  // V2: Scroll-driven section colour transition (matching Speciality page: #0a1128 -> #172d56 -> #e2ebf6 -> #ffffff)
  const { scrollY } = useScroll();
  const v2BgColor = useTransform(scrollY, [0, 110, 220, 320], ["#0a1128", "#172d56", "#e2ebf6", "#ffffff"]);
  const v2HeadingColor = useTransform(scrollY, [0, 140, 260], ["#ffffff", "#f1f5f9", "#111827"]);
  const v2BodyColor = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.84)", "rgba(241, 245, 249, 0.90)", "#374151"]
  );
  const v2MutedColor = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.62)", "rgba(203, 213, 225, 0.85)", "#64748b"]
  );
  const v2TocLinkColor = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.78)", "rgba(226, 232, 240, 0.88)", "#4b5563"]
  );
  const v2TocActiveColor = useTransform(scrollY, [0, 140, 260], ["#38bdf8", "#7dd3fc", "#034EA2"]);
  const v2TocActiveBg = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.16)", "rgba(3, 78, 162, 0.08)"]
  );
  const v2BorderColor = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.20)", "rgba(15, 23, 42, 0.10)"]
  );
  const v2CardBg = useTransform(
    scrollY,
    [0, 140, 260],
    ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.12)", "#f8fafc"]
  );

  // V4: Refined Dynamic BG Change from #060c18 -> #0d2142 -> #eef4fb -> #ffffff
  const v4BgColor = useTransform(
    scrollY,
    [0, 24, 145, 245, 320],
    ["#060c18", "#060c18", "#0d2142", "#eef4fb", "#ffffff"]
  );
  const v4HeadingColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["#ffffff", "#ffffff", "#1e293b", "#0f172a"]
  );
  const v4EyebrowColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.72)", "rgba(255, 255, 255, 0.72)", "#0284c7", "#034EA2"]
  );
  const v4BodyColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.86)", "rgba(255, 255, 255, 0.86)", "#334155", "#1e293b"]
  );
  const v4MutedColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.64)", "rgba(255, 255, 255, 0.64)", "#64748b", "#64748b"]
  );
  const v4TocLinkColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.82)", "rgba(255, 255, 255, 0.82)", "#475569", "#4b5563"]
  );
  const v4TocActiveColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["#38bdf8", "#38bdf8", "#0284c7", "#034EA2"]
  );
  const v4TocActiveBg = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.12)", "rgba(3, 78, 162, 0.08)", "rgba(3, 78, 162, 0.08)"]
  );
  const v4BorderColor = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.14)", "rgba(15, 23, 42, 0.10)", "rgba(15, 23, 42, 0.08)"]
  );
  const v4SummaryBg = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.06)", "rgba(248, 250, 252, 0.88)", "rgba(248, 250, 252, 0.92)"]
  );
  const v4BadgeBg = useTransform(
    scrollY,
    [0, 24, 175, 290],
    ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.12)", "#ffffff", "#ffffff"]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qv = params.get("v") || params.get("design");
      if (qv === "4") {
        setBlendVersion(4);
        return;
      } else if (qv === "3") {
        setBlendVersion(3);
        return;
      } else if (qv === "2") {
        setBlendVersion(2);
        return;
      } else if (qv === "1") {
        setBlendVersion(1);
        return;
      }
      try {
        const saved = localStorage.getItem("nh_procedure_detail_blend");
        if (saved === "4") setBlendVersion(4);
        else if (saved === "3") setBlendVersion(3);
        else if (saved === "2") setBlendVersion(2);
        else if (saved === "1") setBlendVersion(1);
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const handleBlendChange = (v: 1 | 2 | 3 | 4) => {
    setBlendVersion(v);
    try {
      localStorage.setItem("nh_procedure_detail_blend", String(v));
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(v));
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "1") handleBlendChange(1);
      else if (e.key === "2") handleBlendChange(2);
      else if (e.key === "3") handleBlendChange(3);
      else if (e.key === "4") handleBlendChange(4);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        blendVersion === 2
          ? ({
              "--v2-bg": v2BgColor,
              "--v2-heading": v2HeadingColor,
              "--v2-body": v2BodyColor,
              "--v2-muted": v2MutedColor,
              "--v2-toc-link": v2TocLinkColor,
              "--v2-toc-active": v2TocActiveColor,
              "--v2-toc-active-bg": v2TocActiveBg,
              "--v2-border": v2BorderColor,
              "--v2-card-bg": v2CardBg,
              "--summary-bg": "rgba(var(--slate-50-rgb), 0.85)",
              "--summary-border": "rgba(var(--slate-900-rgb), 0.08)",
              "--summary-accent": "var(--color-primary, var(--blue-brand))",
              "--summary-text": "var(--slate-800)",
              "--summary-badge-bg": "var(--white)",
              "--summary-badge-text": "var(--slate-700)",
            } as React.CSSProperties)
          : blendVersion === 4
          ? ({
              "--v4-bg": v4BgColor,
              "--v4-heading": v4HeadingColor,
              "--v4-eyebrow": v4EyebrowColor,
              "--v4-body": v4BodyColor,
              "--v4-muted": v4MutedColor,
              "--v4-toc-link": v4TocLinkColor,
              "--v4-toc-active": v4TocActiveColor,
              "--v4-toc-active-bg": v4TocActiveBg,
              "--v4-border": v4BorderColor,
              "--summary-bg": v4SummaryBg,
              "--summary-border": v4BorderColor,
              "--summary-accent": v4TocActiveColor,
              "--summary-text": v4BodyColor,
              "--summary-badge-bg": v4BadgeBg,
              "--summary-badge-text": v4BodyColor,
            } as React.CSSProperties)
          : ({
              "--summary-bg": "rgba(var(--slate-50-rgb), 0.85)",
              "--summary-border": "rgba(var(--slate-900-rgb), 0.08)",
              "--summary-accent": "var(--color-primary, var(--blue-brand))",
              "--summary-text": "var(--slate-800)",
              "--summary-badge-bg": "var(--white)",
              "--summary-badge-text": "var(--slate-700)",
            } as React.CSSProperties)
      }
    >
      {/* ─── STATIONARY ATMOSPHERIC BACKGROUND CANVAS (FIXED IN VIEWPORT) ──── */}
      <div className={styles.stationaryCanvas} aria-hidden="true">
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
      </div>

      {/* ─── DETAIL HERO (FULL BACKGROUND ATMOSPHERIC GRADIENT & METRICS) ───── */}
      <section
        className={`${styles.detailHero} ${
          blendVersion === 2
            ? styles.detailHeroV2
            : blendVersion === 3
            ? styles.detailHeroV3
            : blendVersion === 4
            ? styles.detailHeroV4
            : ""
        }`}
        data-nav-theme="dark"
      >
        {/* Hero contrast overlay (ensures left-column typography is crisp) */}
        <div className={styles.heroBgOverlay} />

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

            {/* Refined, Balanced Title (Subtext removed per stakeholder feedback) */}
            <h1 className={styles.heroMainTitle} style={{ marginBottom: "26px" }}>
              {detail.heroTitle}
            </h1>

            {/* Actions Row: Primary CTA (NH Blue) + Call Helpline Text */}
            <div className={styles.heroActionsRow}>
              <Link 
                href={`/doctors?speciality=${encodeURIComponent(detail.speciality)}`} 
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Book Consultation</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <a href="tel:18003090309" className={styles.heroPhoneText}>
                <PhoneCall size={14} className={styles.phoneIcon} />
                <span className={styles.phoneDesktopSpan}>24×7 Care Helpline: <strong>1800 309 0309</strong></span>
                <span className={styles.phoneMobileSpan}>Call 24×7 Helpline</span>
              </a>
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
      <div
        className={`${styles.readingExperienceWrapper} ${
          blendVersion === 2
            ? styles.readingExperienceWrapperV2
            : blendVersion === 3
            ? styles.readingExperienceWrapperV3
            : blendVersion === 4
            ? styles.readingExperienceWrapperV4
            : ""
        }`}
      >
        <main className={styles.mainLayoutContainer}>
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
              <ContactCareSidebarCard theme={blendVersion === 2 || blendVersion === 4 ? "dynamic" : "white"} />
            </aside>

          {/* ─── RIGHT COLUMN: ARTICLE DETAILS (UNIFIED EDITORIAL LAYOUT) ─── */}
          <article className={styles.articleContent}>
            {/* Minimal Non-Intrusive Clinical Action Pathway Strip */}
            <ClinicalAtAGlanceCard
              bookingHref="/book-an-appointment"
              secondOpinionHref="/book-an-appointment?flow=second-opinion"
              theme={blendVersion === 2 || blendVersion === 4 ? "dynamic" : "white"}
            />

            {/* 1. Overview & Clinical Executive Summary */}
            <section id="overview" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.title}
              </h2>
              <ClinicalSummaryBanner
                summary={`${detail.leadParagraph} ${detail.whatIsIt.description}`}
                reviewerName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
                theme={blendVersion === 2 || blendVersion === 4 ? "dynamic" : "white"}
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
      </div>

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

      {/* Small V1 / V2 / V3 Blend Variation Toggle for Stakeholder Review */}
      <div className={styles.blendVersionToggle} role="group" aria-label="Hero to Content Blend Variation">
        <span className={styles.blendToggleLabel}>
          <span className={styles.blendToggleDot} />
          <span>Blend</span>
        </span>
        <div className={styles.blendToggleButtons}>
          <button
            type="button"
            className={`${styles.blendToggleBtn} ${blendVersion === 1 ? styles.blendToggleBtnActive : ""}`}
            onClick={() => handleBlendChange(1)}
            title="V1: Elevated Curved Reading Sheet"
          >
            V1
          </button>
          <button
            type="button"
            className={`${styles.blendToggleBtn} ${blendVersion === 2 ? styles.blendToggleBtnActive : ""}`}
            onClick={() => handleBlendChange(2)}
            title="V2: Scroll-Driven Section Colour Change"
          >
            V2
          </button>
          <button
            type="button"
            className={`${styles.blendToggleBtn} ${blendVersion === 3 ? styles.blendToggleBtnActive : ""}`}
            onClick={() => handleBlendChange(3)}
            title="V3: Soft Atmospheric Blur Mist Band"
          >
            V3
          </button>
          <button
            type="button"
            className={`${styles.blendToggleBtn} ${blendVersion === 4 ? styles.blendToggleBtnActive : ""}`}
            onClick={() => handleBlendChange(4)}
            title="V4: Dynamic BG Change + TextSweepEffect Blend (Like Blog V3)"
          >
            V4
          </button>
        </div>
      </div>

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
