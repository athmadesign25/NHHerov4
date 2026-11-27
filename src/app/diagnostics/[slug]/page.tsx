"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroShrink } from "@/lib/useHeroShrink";
import {
  Link as LinkIcon,
  PhoneCall,
  Plus,
  Minus,
  Check,
  Share2
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import { getDiagnosticDetailData, DiagnosticDetailData } from "@/data/diagnosticsData";
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
import styles from "./DiagnosticDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DiagnosticDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: DiagnosticDetailData = getDiagnosticDetailData(slug);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // CoE-style sticky hero inset over clean white reading surface
  const { containerRef: heroShrinkRef, wrapperStyle: heroWrapperStyle, heroMotionStyle, pageMotionStyle } =
    useHeroShrink("detail");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    handleScroll();
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
                    { label: "Diagnostics", href: "/diagnostics" },
                    { label: detail.shortTitle },
                  ]}
                  theme="dark"
                />
              </div>

              <div className={styles.heroEyebrow}>
                {detail.modality} &bull; {detail.speciality}
              </div>

              <h1 className={styles.heroMainTitle}>
                {detail.heroTitle}
              </h1>

              {(detail.leadParagraph || detail.heroSubtitle) && (
                <p className={styles.heroSubTitle}>
                  {detail.leadParagraph || detail.heroSubtitle}
                </p>
              )}

              <div className={styles.heroActionsRow}>
                <Link
                  href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
                  className={styles.heroPrimaryBtn}
                >
                  <span>Book Diagnostic Test</span>
                </Link>
              </div>

              <MobileRollingStats
                items={[
                  { staticValue: detail.metrics.turnaround, label: "Report Turnaround" },
                  { staticValue: detail.metrics.preparation, label: "Preparation Requirement" },
                  { staticValue: detail.metrics.sampleType, label: "Modality / Sample" },
                  { staticValue: "NABL & NABH", label: "Quality Accreditation" },
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
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.turnaround} />
                  </span>
                  <span className={styles.statLabel}>Report Turnaround</span>
                </div>
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.preparation} />
                  </span>
                  <span className={styles.statLabel}>Preparation Requirement</span>
                </div>
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value={detail.metrics.sampleType} />
                  </span>
                  <span className={styles.statLabel}>Modality / Sample</span>
                </div>
                <div className={styles.statBlock}>
                  <span className={styles.statNumber}>
                    <RollingNumber value="NABL & NABH" />
                  </span>
                  <span className={styles.statLabel}>Quality Accreditation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <DetailStickyBreadcrumb
        currentTitle={detail.shortTitle}
        parentLabel="Diagnostics & Lab Tests"
        motionKey={`diag-sticky-breadcrumb-${detail.slug}`}
      />

      {/* ─── MAIN CONTENT BODY ────────────────────────────────────────────── */}
      <div
        className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}
        data-nav-theme="light"
      >
        <main className={styles.mainLayoutContainer}>
          {/* Full-width Clinical Pathway Banner positioned above the Two-Column Index */}
          <ClinicalAtAGlanceCard
            bookingHref="/diagnostics"
            secondOpinionHref="/book-an-appointment?flow=second-opinion"
            theme="dynamic"
          />

          <div className={styles.twoColumnGrid}>
            {/* Sticky Table of Contents Sidebar */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <span>On This Investigation</span>
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

              {/* Standardized Share widget */}
              <ShareWidget shareTitle={detail.title} title="Share this test guide" />

              {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
              <ContactCareSidebarCard
                subtitle="Immediate assistance for lab test bookings, home collection & doctor consultations."
                theme="dynamic"
              />

              {/* Compact On-Demand Feedback Widget */}
              <GuideFeedbackWidget guideType="test guide" theme="dynamic" />
            </aside>

            {/* Reading Content Focus Canvas */}
            <div className={styles.contentFocusCanvas}>
              {/* SECTION: Overview & 4-5 Line Clinical Summary */}
              <section id="overview" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Investigation Overview</h2>
                <ClinicalSummaryBanner
                  eyebrow={`${detail.modality} · Diagnostic Investigation Summary`}
                  summary={`${detail.leadParagraph} ${detail.testProcedure}`}
                  reviewerName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
                  theme="dynamic"
                />
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Modality</span>
                    <span className={styles.factCardVal}>{detail.modality}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Turnaround</span>
                    <span className={styles.factCardVal}>{detail.metrics.turnaround}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Preparation</span>
                    <span className={styles.factCardVal}>{detail.metrics.preparation}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Clinical Indications */}
              <section id="why-done" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Why This Test Is Done (Indications)</h2>
                <p className={styles.sectionLeadText}>
                  Your physician or consultant may order a {detail.shortTitle} for screening, diagnosis, or post-treatment monitoring:
                </p>
                <ul className={styles.symptomsChecklist}>
                  {detail.whyItIsDone.map((reason, idx) => (
                    <li key={idx} className={styles.symptomCheckRow}>
                      <span className={styles.symptomCheckText}>{reason}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* SECTION: Preparation & Fasting */}
              <section id="preparation" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Preparation &amp; Instructions</h2>
                <p className={styles.sectionLeadText}>
                  Following standard preparation protocols ensures high diagnostic accuracy and avoids test rescheduling:
                </p>
                <div className={styles.protocolsList}>
                  {detail.preparationInstructions.map((prep, idx) => (
                    <div key={idx} className={styles.protocolRow}>
                      <span className={styles.protocolNum}>{String(idx + 1).padStart(2, "0")}</span>
                      <div className={styles.protocolContent}>
                        <p className={styles.protocolDesc} style={{ color: "#1E293B", fontWeight: 500 }}>
                          {prep}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Procedure & Experience */}
              <section id="procedure" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Procedure &amp; Patient Experience</h2>
                <p className={styles.sectionLeadText}>
                  What to expect during your test appointment at Narayana Health diagnostics centers:
                </p>
                <p className={styles.leadParagraph} style={{ marginTop: 12 }}>
                  {detail.testProcedure}
                </p>

                <ClinicalEditorialFigures
                  items={[
                    {
                      src: detail.heroImage || "/images/procedures/procedure_mri.png",
                      alt: `${detail.shortTitle} diagnostic suite`,
                      caption: `NABL & NABH Accredited Diagnostic Facility · ${detail.shortTitle}`,
                    },
                    {
                      src: "/images/procedures/procedure_mri.png",
                      alt: `${detail.shortTitle} automated analysis`,
                      caption: `Automated High-Precision Assay & Specialist Reporting (${detail.speciality})`,
                    },
                  ]}
                />
              </section>

              {/* SECTION: Accredited Centers Carousel (Multi-unit Bangalore & NH Network) */}
              <NearbyCareCentresCarousel
                id="centers"
                title="Accredited Diagnostics Centers"
                subtitle="Undergo your diagnostic evaluation across our multiple Bangalore units, state-of-the-art imaging suites, and accredited central laboratories:"
                hospitals={detail.hospitals}
              />

              {/* SECTION: Recommended Specialists Carousel (Modular & Softened Gradient) */}
              <NearbySpecialistsCarousel
                id="specialists"
                title="Consult Senior Specialists"
                subtitle={`Discuss your diagnostic findings with expert consultants in ${detail.speciality}:`}
                doctors={detail.doctors}
                specialityFilter={detail.specialitySlug}
                actionLabel="Consult"
              />

              {/* SECTION: FAQs */}
              <section id="faqs" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
                <SpecialityFAQ faqs={detail.faqs} theme="light" fluid />
              </section>
            </div>
          </div>

          <MedicallyReviewedBand
            id="medically-reviewed-by"
            theme="light"
            fluid
            specialityName={detail.speciality}
            reviewer={{
              name: detail.doctors[0]?.name || "Dr. Devi Prasad Shetty",
              designation: "Senior Consultant & Diagnostic Lead",
              specialty: detail.doctors[0]?.speciality || detail.speciality,
              image: detail.doctors[0]?.image || "/doctors/doc_vivek.jpg",
              reviewDate: "November 2026",
            }}
          />
        </main>
      </div>

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        eyebrow="NABL ACCREDITED LABORATORY NETWORK"
        title="Need Doorstep Home Sample Collection?"
        subtitle="Our trained, vaccinated phlebotomists collect blood and pathology samples directly from your home with barcode verification and automated temperature-controlled transit."
        primaryBtn={{
          href: `/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`,
          text: "Schedule Home Collection",
        }}
        secondaryBtn={{
          href: "/health-packages",
          text: "Explore Health Packages",
        }}
        phoneText="Diagnostics Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />

      {/* Unified Clinical FAB (Book Consultation, Contact Support, Ask Pulse) */}
      <ClinicalFloatingSideActions
        consultHref={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
        consultLabel={"Book\nConsultation"}
        conditionTitle={detail.shortTitle}
        pulseQuery={`I want to know about ${detail.title}: test preparation, procedure details, and how to get results.`}
        isScrolled={isScrolled}
      />
    </motion.div>
  );
}
