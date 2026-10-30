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
                <div className={styles.checklistContainer}>
                  {detail.whyItIsDone.map((reason, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span className={styles.checkText}>{reason}</span>
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
                <div className={styles.cardsStack}>
                  {detail.preparationInstructions.map((prep, idx) => (
                    <div key={idx} className={styles.causeCard}>
                      <div className={styles.causeCardHeader}>
                        <h3 className={styles.causeTitle}>Guideline 0{idx + 1}</h3>
                        <span className={styles.causeTag}>Mandatory Protocol</span>
                      </div>
                      <p className={styles.causeDesc}>{prep}</p>
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
                <div className={styles.causeCard} style={{ borderColor: "rgba(3, 78, 162, 0.3)" }}>
                  <p className={styles.leadParagraph} style={{ margin: 0 }}>
                    {detail.testProcedure}
                  </p>
                </div>
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
                      <HospitalCard hosp={hosp} />
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
                    <div key={idx} className={styles.doctorCard}>
                      <div className={styles.docAvatarWrap}>
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          sizes="80px"
                          className={styles.docAvatar}
                        />
                      </div>
                      <div className={styles.docInfo}>
                        <h3 className={styles.docName}>{doc.name}</h3>
                        <p className={styles.docDesig}>{doc.designation}</p>
                        <p className={styles.docExp}>{doc.experience} Experience &bull; {doc.hospital}</p>
                        <Link 
                          href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`} 
                          className={styles.docBookBtn}
                        >
                          <span>Consult Doctor</span>
                          <ArrowUpRight size={12} />
                        </Link>
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

      {/* Floating CTA Dock on Scroll */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            className={styles.floatingCtaDock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.dockInner}>
              <div className={styles.dockText}>
                <span className={styles.dockTitle}>{detail.shortTitle}</span>
                <span className={styles.dockSub}>NABL Accredited &bull; Same-Day Reports</span>
              </div>
              <Link 
                href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`} 
                className={styles.dockActionBtn}
              >
                <Calendar size={14} />
                <span>Book Test Now</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
