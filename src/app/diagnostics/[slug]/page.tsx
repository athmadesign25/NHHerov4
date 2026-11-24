"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  CheckCircle2,
  Link as LinkIcon,
  PhoneCall,
  ArrowUpRight,
  Calendar,
  Activity,
  Plus,
  Minus,
  Check,
  Clock,
  FlaskConical,
  ShieldCheck,
  Share2
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import { getDiagnosticDetailData, DiagnosticDetailData } from "@/data/diagnosticsData";
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

  // V2: Scroll-driven section colour transition (#0a1128 -> #172d56 -> #e2ebf6 -> #ffffff)
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
      style={
        {
          "--v2-bg": v2BgColor,
          "--v2-heading": v2HeadingColor,
          "--v2-body": v2BodyColor,
          "--v2-muted": v2MutedColor,
          "--v2-toc-link": v2TocLinkColor,
          "--v2-toc-active": v2TocActiveColor,
          "--v2-toc-active-bg": v2TocActiveBg,
          "--v2-border": v2BorderColor,
          "--v2-card-bg": v2CardBg,
        } as any
      }
    >
      {/* ─── STATIONARY ATMOSPHERIC CANVAS ─────────────────────────────────── */}
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

      {/* ─── DETAIL HERO ──────────────────────────────────────────────────── */}
      <section className={`${styles.detailHero} ${styles.detailHeroV2}`} data-nav-theme="dark">
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

            <h1 className={styles.heroMainTitle} style={{ marginBottom: "26px" }}>
              {detail.heroTitle}
            </h1>

            <div className={styles.heroActionsRow}>
              <Link
                href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Book Diagnostic Test</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <a href="tel:18003090309" className={styles.heroPhoneText}>
                <PhoneCall size={14} className={styles.phoneIcon} />
                <span className={styles.phoneDesktopSpan}>Diagnostics Desk: <strong>1800 309 0309</strong></span>
                <span className={styles.phoneMobileSpan}>Call Diagnostics Desk</span>
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
      </section>

      {/* ─── MAIN CONTENT BODY ────────────────────────────────────────────── */}
      <div className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}>
        <main className={styles.mainLayoutContainer}>
          <div className={styles.twoColumnGrid}>
            {/* Sticky Table of Contents Sidebar */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <Activity size={13} className={styles.tocEyebrowIcon} />
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

              {/* Standardized Share widget */}
              <ShareWidget shareTitle={detail.title} title="Share this test guide" />

              {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
              <ContactCareSidebarCard
                subtitle="Immediate assistance for lab test bookings, home collection & doctor consultations."
                theme="dynamic"
              />
            </aside>

            {/* Reading Content Focus Canvas */}
            <div className={styles.contentFocusCanvas}>
              {/* Minimal Non-Intrusive Clinical Action Pathway Strip */}
              <ClinicalAtAGlanceCard
                bookingHref="/diagnostics"
                secondOpinionHref="/book-an-appointment?flow=second-opinion"
                theme="dynamic"
              />

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
                <div className={styles.symptomsChecklist}>
                  {detail.whyItIsDone.map((reason, idx) => (
                    <div key={idx} className={styles.symptomCheckRow}>
                      <CheckCircle2 size={18} className={styles.symptomCheckIcon} />
                      <span className={styles.symptomCheckText}>{reason}</span>
                    </div>
                  ))}
                </div>
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

              {/* Dedicated Google E-E-A-T "Reviewed by Dr. ___" Section */}
              <ClinicalReviewedBySection
                doctorName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
                doctorRole="Senior Consultant & Diagnostic Lead"
                speciality={detail.doctors[0]?.speciality || detail.speciality}
                hospital={detail.doctors[0]?.hospital || "Narayana Health City, Bengaluru"}
                experience={detail.doctors[0]?.experience || "18+ Years Experience"}
                doctorImage={detail.doctors[0]?.image || "/doctors/doc_vivek.jpg"}
              />
            </div>
          </div>
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
