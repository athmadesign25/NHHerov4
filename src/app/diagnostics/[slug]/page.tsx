"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getDiagnosticDetailData, DiagnosticDetailData } from "@/data/diagnosticsData";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import styles from "./DiagnosticDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DiagnosticDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: DiagnosticDetailData = getDiagnosticDetailData(slug);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <div className={styles.detailPageContainer}>
      {/* ─── STATIONARY ATMOSPHERIC CANVAS ─────────────────────────────────── */}
      <div className={styles.stationaryCanvas} aria-hidden="true">
        <motion.div
          className={styles.stationaryMotionWrapper}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
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
      <section className={styles.detailHero} data-nav-theme="dark">
        <div className={styles.heroBgOverlay} />

        <div className={styles.heroInner}>
          <div className={styles.heroLeftCol}>
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

            <p className={styles.heroSubTitle}>
              {detail.heroSubtitle}
            </p>

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
                <span>Diagnostics Desk: <strong>1800 309 0309</strong></span>
              </a>
            </div>
          </div>

          {/* Right Hero Analytics */}
          <div className={styles.heroRightCol}>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.turnaround}</span>
              <span className={styles.statLabel}>Report Turnaround</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.preparation}</span>
              <span className={styles.statLabel}>Preparation Requirement</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.sampleType}</span>
              <span className={styles.statLabel}>Modality / Sample</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>NABL &amp; NABH</span>
              <span className={styles.statLabel}>Quality Accreditation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY ────────────────────────────────────────────── */}
      <div className={styles.readingExperienceWrapper}>
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
                                el.scrollIntoView({ behavior: "smooth" });
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

              {/* Share widget */}
              <div className={styles.shareWidgetBorderless}>
                <span className={styles.shareTitle}>Share this test guide</span>
                <div className={styles.shareRow}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={styles.shareBtn}
                    aria-label="Copy page link"
                    title="Copy Link"
                  >
                    {copyToast ? <Check size={14} className={styles.copySuccessIcon} /> : <LinkIcon size={14} />}
                  </button>
                </div>
                {copyToast && <span className={styles.copyToastText}>Link copied to clipboard</span>}
              </div>
            </aside>

            {/* Reading Content Focus Canvas */}
            <div className={styles.contentFocusCanvas}>
              {/* SECTION: Overview */}
              <section id="overview" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Investigation Overview</h2>
                <p className={styles.leadParagraph}>{detail.leadParagraph}</p>
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
              </section>

              {/* SECTION: Accredited Centers */}
              <section id="centers" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Accredited Diagnostics Centers</h2>
                <p className={styles.sectionLeadText}>
                  Undergo your diagnostic evaluation at our state-of-the-art imaging suites and accredited central laboratories:
                </p>
                <div className={styles.hospitalsGrid}>
                  {detail.hospitals.map((hosp, idx) => (
                    <div key={idx} className={styles.hospitalCardWrap}>
                      <HospitalCard hosp={hosp} className={carouselStyles.cardCompact} />
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Recommended Specialists */}
              <section id="specialists" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Consult Senior Specialists</h2>
                <p className={styles.sectionLeadText}>
                  Discuss your diagnostic findings with expert consultants in {detail.speciality}:
                </p>
                <div className={styles.doctorsGrid}>
                  {detail.doctors.map((doc, idx) => (
                    <div key={idx} className={styles.refDoctorCard}>
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className={styles.refDocFullImage}
                      />
                      <div className={styles.refDocFullGradient} />
                      <div className={styles.refDocOverlayContent}>
                        <div className={styles.refDocBottomFlex}>
                          <div className={styles.refDocTextCol}>
                            <h3 className={styles.refDocName} title={doc.name}>
                              {doc.name}
                            </h3>
                            <div className={styles.refDocSpecialty}>
                              {doc.speciality || detail.speciality}
                            </div>
                            <div className={styles.refDocExpRow}>
                              <span>{doc.experience}</span>
                            </div>
                            <div className={styles.refDocHospital} title={doc.hospital}>
                              {doc.hospital}
                            </div>
                          </div>
                          <Link 
                            href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`} 
                            className={styles.refBookBtnWhite}
                          >
                            Consult
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: FAQs */}
              <section id="faqs" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
                <div className={styles.faqAccordion}>
                  {detail.faqs.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className={styles.faqItem}>
                        <button
                          type="button"
                          className={styles.faqQuestionBtn}
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          aria-expanded={isOpen}
                        >
                          <span className={styles.faqQuestion}>{faq.q}</span>
                          <span className={styles.faqIconWrap}>
                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                          </span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className={styles.faqAnswerWrapper}
                            >
                              <p className={styles.faqAnswer}>{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Unified Clinical FAB (Book Consultation, Contact Support, Ask Pulse) */}
      <ClinicalFloatingSideActions
        consultHref={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
        consultLabel={"Book\nConsultation"}
        conditionTitle={detail.shortTitle}
        pulseQuery={`I want to know about ${detail.title}: test preparation, procedure details, and how to get results.`}
        isScrolled={isScrolled}
      />
    </div>
  );
}
