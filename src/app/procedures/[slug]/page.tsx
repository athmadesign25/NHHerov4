"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroShrink } from "@/lib/useHeroShrink";
import { useCarouselPeekHint } from "@/lib/useCarouselPeekHint";
import {
  Link as LinkIcon,
  PhoneCall,
  Plus,
  Minus,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { getProcedureDetailData, ProcedureDetailData } from "@/data/procedureDetailGenerator";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import SpecialityFAQ from "@/components/ui/SpecialityFAQ";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import {
  ClinicalSummaryBanner,
  ClinicalEditorialFigures,
} from "@/components/ui/ClinicalReviewedBySection";
import MedicallyReviewedBand from "@/components/ui/MedicallyReviewedBand";
import {
  NearbySpecialistsCarousel,
  NearbyCareCentresCarousel,
} from "@/components/ui/NearbyClinicalCarousels";
import ShareWidget from "@/components/ui/ShareWidget";
import ContactCareSidebarCard from "@/components/ui/ContactCareSidebarCard";
import GuideFeedbackWidget from "@/components/ui/GuideFeedbackWidget";
import ClinicalAtAGlanceCard from "@/components/ui/ClinicalAtAGlanceCard";
import DetailStickyBreadcrumb from "@/components/ui/DetailStickyBreadcrumb";
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
  const doctorsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollDocsLeft, setCanScrollDocsLeft] = useState(false);
  const [canScrollDocsRight, setCanScrollDocsRight] = useState(true);

  const syncDoctorsScrollState = () => {
    const track = doctorsTrackRef.current;
    if (!track) return;
    setCanScrollDocsLeft(track.scrollLeft > 12);
    setCanScrollDocsRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 12);
  };

  const scrollFeaturedDoctors = (direction: -1 | 1) => {
    const track = doctorsTrackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 28 : Math.max(track.clientWidth * 0.45, 480);
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  useEffect(() => {
    syncDoctorsScrollState();
    window.addEventListener("resize", syncDoctorsScrollState, { passive: true });
    return () => window.removeEventListener("resize", syncDoctorsScrollState);
  }, [slug]);

  // CoE-style sticky hero inset over clean white reading surface
  const { containerRef: heroShrinkRef, wrapperStyle: heroWrapperStyle, heroMotionStyle, pageMotionStyle } =
    useHeroShrink("detail");

  useCarouselPeekHint(doctorsTrackRef, slug);

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
      style={pageMotionStyle}
    >
      {/* ─── DETAIL HERO (STICKY INSET SHRINK OVER WHITE READING SURFACE) ───── */}
      <div ref={heroShrinkRef} data-nav-theme="light" style={heroWrapperStyle}>
        <motion.section
          className={`${styles.detailHero} ${styles.detailHeroV2}`}
          data-nav-theme="dark"
          style={heroMotionStyle}
        >
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

              {/* Actions Row: White Primary CTA on Dark Hero (Design Token Standard, No Icon) */}
              <div className={styles.heroActionsRow}>
                <Link
                  href={`/doctors?speciality=${encodeURIComponent(detail.speciality)}`}
                  className={styles.heroPrimaryBtn}
                >
                  <span>Book Consultation</span>
                </Link>
              </div>

              <MobileRollingStats
                items={[
                  ...(detail.metrics.successRate ? [{ staticValue: detail.metrics.successRate, label: "Success Rate" }] : []),
                  ...(detail.metrics.duration ? [{ staticValue: detail.metrics.duration, label: "Duration" }] : []),
                  ...(detail.metrics.hospitalStay ? [{ staticValue: detail.metrics.hospitalStay, label: "Typical Stay" }] : []),
                  ...(detail.metrics.recoveryTime ? [{ staticValue: detail.metrics.recoveryTime, label: "Recovery Period" }] : []),
                ]}
              />
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
        </motion.section>
      </div>

      <DetailStickyBreadcrumb
        currentTitle={detail.shortTitle}
        parentLabel="Treatments & Procedures"
        motionKey={`proc-sticky-breadcrumb-${detail.slug}`}
      />

      {/* ─── MAIN CONTENT BODY ON PURE WHITE READING SURFACE ────────── */}
      <div
        className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}
        data-nav-theme="light"
      >
        <main className={styles.mainLayoutContainer}>
          {/* ─── TOP FEATURED DOCTORS SECTION (SHOWN FOR THIS PROCEDURE DIRECTLY BELOW HERO) ─── */}
          {detail.topDoctors && detail.topDoctors.length > 0 && (
            <section className={styles.topDoctorsSection} id="featured-doctors" aria-label="Featured Doctors">
              <div className={styles.topDoctorsHeader}>
                <h2 className={styles.topDoctorsTitle}>
                  <TextSweepEffect
                    words={["Featured Doctors"]}
                    sweepMs={1500}
                    sweepColor="#034EA2"
                    sweepHighlightColor="#ED1C24"
                    finalColor="var(--v2-heading, #0f172a)"
                  />
                </h2>
                <motion.p
                  className={styles.topDoctorsSubtitle}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Senior Narayana Health clinicians answering patient queries, providing second opinions, and performing advanced {detail.shortTitle.toLowerCase()} procedures.
                </motion.p>
              </div>

              <div className={styles.topDoctorsReelOuter}>
                <div
                  className={`${styles.topDoctorsEdgeFadeLeft} ${canScrollDocsLeft ? styles.topDoctorsEdgeFadeVisible : ""}`}
                  aria-hidden="true"
                />
                <div
                  className={`${styles.topDoctorsEdgeFadeRight} ${canScrollDocsRight ? styles.topDoctorsEdgeFadeVisible : ""}`}
                  aria-hidden="true"
                />

                {canScrollDocsLeft && (
                  <button
                    type="button"
                    className={`${styles.topDoctorsArrowBtn} ${styles.topDoctorsArrowLeft}`}
                    onClick={() => scrollFeaturedDoctors(-1)}
                    aria-label="Previous featured doctors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {canScrollDocsRight && (
                  <button
                    type="button"
                    className={`${styles.topDoctorsArrowBtn} ${styles.topDoctorsArrowRight}`}
                    onClick={() => scrollFeaturedDoctors(1)}
                    aria-label="Next featured doctors"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}

                <div
                  ref={doctorsTrackRef}
                  className={styles.topDoctorsGrid}
                  onScroll={syncDoctorsScrollState}
                >
                  {detail.topDoctors.map((doc, idx) => (
                    <div key={`${doc.name}-${idx}`} className={styles.doctorBlendCard}>
                      {/* Left: Framed Portrait Container inside Card (Toshib card layout; backup in FeaturedDoctorCardBackup.tsx) */}
                      <div className={styles.doctorImageBlendCol}>
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          priority={idx < 2}
                          sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 420px"
                          className={styles.doctorBlendImg}
                        />
                      </div>

                      {/* Right: Identity Text Layout */}
                      <div className={styles.doctorTextCol}>
                        <div className={styles.doctorTextTop}>
                          {doc.bio && (
                            <p className={styles.doctorCardBio}>
                              {doc.bio}
                            </p>
                          )}
                        </div>

                        <div className={styles.identityText}>
                          <h3 className={styles.name} aria-label={doc.name}>
                            <span>{doc.name}</span>
                          </h3>
                          <div className={styles.identityMeta}>
                            <div className={styles.specialityGroup}>
                              <span className={styles.speciality}>
                                {doc.speciality || doc.designation}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/doctors/${doc.profileSlug || doc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            className={styles.profileLink}
                            aria-label={`View profile of ${doc.name}`}
                          >
                            View profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Full-width Clinical Pathway Banner positioned above the Two-Column Index */}
          <ClinicalAtAGlanceCard
            bookingHref="/book-an-appointment"
            secondOpinionHref="/book-an-appointment?flow=second-opinion"
            theme="dynamic"
          />

          <div className={styles.twoColumnGrid}>
            {/* ─── LEFT COLUMN: UNBOXED SECTION SELECTOR ON GRADIENT ─────── */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
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

              {/* Mobile Persistent Share Icon Pill inside sticky header */}
              <button
                type="button"
                className={styles.mobileStickyShareBtn}
                onClick={handleShare}
                aria-label="Share this guide"
                title="Share"
              >
                <Share2 size={16} />
              </button>

              {/* Standardized Share Widget with Twitter, LinkedIn, Facebook, Copy Link */}
              <ShareWidget shareTitle={detail.title} />

              {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
              <ContactCareSidebarCard theme="dynamic" />

              {/* Compact On-Demand Feedback Widget */}
              <GuideFeedbackWidget guideType="procedure guide" theme="dynamic" />
            </aside>

            {/* ─── RIGHT COLUMN: ARTICLE DETAILS (UNIFIED EDITORIAL LAYOUT) ─── */}
            <article className={styles.articleContent}>
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
                      <ArrowUpRight size={15} className={styles.symptomTriageArrow} aria-hidden="true" />
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
                  <div className={`${styles.eligibilityCol} ${styles.eligibilityColPositive}`}>
                    <div className={styles.eligibilityHeader}>
                      <CheckCircle2
                        size={17}
                        className={styles.eligibilityIconPositive}
                        aria-hidden="true"
                      />
                      <h3 className={styles.eligibilityHeading}>General Eligibility Criteria</h3>
                    </div>
                    <ul className={styles.comparisonList}>
                      {detail.eligibility.eligiblePoints.map((pt, i) => (
                        <li key={i} className={styles.comparisonItem}>
                          <Check
                            size={15}
                            className={`${styles.comparisonItemIcon} ${styles.eligibilityIconPositive}`}
                            aria-hidden="true"
                          />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div id="who-not-eligible" className={`${styles.eligibilityCol} ${styles.eligibilityColCaution}`}>
                    <div className={styles.eligibilityHeader}>
                      <XCircle
                        size={17}
                        className={styles.eligibilityIconCaution}
                        aria-hidden="true"
                      />
                      <h3 className={styles.eligibilityHeading}>Contraindications &amp; Precautions</h3>
                    </div>
                    <ul className={styles.comparisonList}>
                      {detail.eligibility.notEligiblePoints.map((pt, i) => (
                        <li key={i} className={styles.comparisonItem}>
                          <AlertCircle
                            size={15}
                            className={`${styles.comparisonItemIcon} ${styles.eligibilityIconCaution}`}
                            aria-hidden="true"
                          />
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
                    <Link href="/doctors" className={styles.costPrimaryBtn}>
                      <span>Request Detailed Estimate</span>
                    </Link>
                  </div>

                  <div className={styles.costInclusionsTitle}>Package Inclusions:</div>
                  <ul className={styles.costInclusionsGrid}>
                    {detail.cost.inclusions.map((inc, i) => (
                      <li key={i} className={styles.costInclusionItem}>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>

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
            </article>
          </div>

          <MedicallyReviewedBand
            id="medically-reviewed-by"
            theme="light"
            fluid
            specialityName={detail.speciality}
            reviewer={{
              name: detail.doctors[0]?.name || "Dr. Devi Prasad Shetty",
              designation: "Senior Consultant & Clinical Lead",
              specialty: detail.doctors[0]?.speciality || detail.speciality,
              image: detail.doctors[0]?.image || "/doctors/doc_vivek.jpg",
              reviewDate: "November 2026",
            }}
          />
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
