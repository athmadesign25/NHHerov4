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
  Stethoscope,
  Layers,
  HeartPulse
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getDiseaseDetailData, DiseaseDetailData } from "@/data/diseasesData";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import styles from "./DiseaseDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DiseaseDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: DiseaseDetailData = getDiseaseDetailData(slug);

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
                  { label: "Diseases & Conditions", href: "/diseases" },
                  { label: detail.shortTitle },
                ]}
                theme="dark"
              />
            </div>

            <div className={styles.heroEyebrow}>
              {detail.speciality} &bull; {detail.stageOrType}
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
                <span>Consult Specialist</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <a href="tel:18003090309" className={styles.heroPhoneText}>
                <PhoneCall size={14} className={styles.phoneIcon} />
                <span>24×7 Care Helpline: <strong>1800 309 0309</strong></span>
              </a>
            </div>
          </div>

          {/* Right Hero Analytics */}
          <div className={styles.heroRightCol}>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.stage}</span>
              <span className={styles.statLabel}>Clinical Staging</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.clinicalSafety}</span>
              <span className={styles.statLabel}>Clinical Safety</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.treatmentApproach}</span>
              <span className={styles.statLabel}>Care Model</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>Top Tier</span>
              <span className={styles.statLabel}>Institutional Center</span>
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
                  <span>On This Condition</span>
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
                <span className={styles.shareTitle}>Share this guide</span>
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
                <h2 className={styles.sectionHeading}>Disease Overview</h2>
                <p className={styles.leadParagraph}>{detail.leadParagraph}</p>
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Speciality</span>
                    <span className={styles.factCardVal}>{detail.speciality}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Staging / Variant</span>
                    <span className={styles.factCardVal}>{detail.stageOrType}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Care Approach</span>
                    <span className={styles.factCardVal}>{detail.metrics.treatmentApproach}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Symptoms */}
              <section id="symptoms" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Signs &amp; Symptoms</h2>
                <p className={styles.sectionLeadText}>
                  Recognizing the clinical manifestations of {detail.shortTitle} allows for early intervention and better preservation of functional health:
                </p>
                <div className={styles.checklistContainer}>
                  {detail.symptoms.map((symp, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span className={styles.checkText}>{symp}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Causes & Risk Factors */}
              <section id="risk-factors" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Causes &amp; Risk Factors</h2>
                <p className={styles.sectionLeadText}>
                  Epidemiological and genetic factors play a significant role in the onset of this condition. Our specialists evaluate patient-specific risk profiles:
                </p>
                <div className={styles.cardsStack}>
                  {detail.riskFactors.map((rf, idx) => (
                    <div key={idx} className={styles.causeCard}>
                      <div className={styles.causeCardHeader}>
                        <h3 className={styles.causeTitle}>{rf.factor}</h3>
                        <span className={styles.causeTag}>Risk Indicator</span>
                      </div>
                      <p className={styles.causeDesc}>{rf.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Diagnostic Protocols */}
              <section id="diagnostics" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Diagnostic Protocols</h2>
                <p className={styles.sectionLeadText}>
                  Narayana Health leverages cutting-edge radiology and laboratory diagnostics to stage the disease with precision:
                </p>
                <div className={styles.stepsTimeline}>
                  {detail.diagnosticSteps.map((step, idx) => (
                    <div key={idx} className={styles.stepCard}>
                      <div className={styles.stepBadge}>{step.step}</div>
                      <div className={styles.stepContent}>
                        <h3 className={styles.stepTitle}>{step.title}</h3>
                        <p className={styles.stepDesc}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Treatment Protocols */}
              <section id="treatments" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Evidence-Based Treatment Protocols</h2>
                <p className={styles.sectionLeadText}>
                  Depending on staging and patient health, our multidisciplinary teams offer advanced medical, catheter-based, and surgical options:
                </p>
                <div className={styles.cardsStack}>
                  {detail.treatmentOptions.map((treat, idx) => (
                    <div key={idx} className={styles.causeCard}>
                      <div className={styles.causeCardHeader}>
                        <h3 className={styles.causeTitle}>{treat.title}</h3>
                        <span className={styles.causeTag}>{treat.type}</span>
                      </div>
                      <p className={styles.causeDesc}>{treat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Recommended Specialists */}
              <section id="specialists" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Consult Senior Specialists</h2>
                <p className={styles.sectionLeadText}>
                  Consult with accredited consultants specializing in {detail.speciality}:
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
                          <span>Book Consultation</span>
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

              {/* Hospital Centers */}
              <section className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Specialised Care Centers</h2>
                <p className={styles.sectionLeadText}>
                  Receive multidisciplinary surgical and clinical care at our accredited centers of excellence:
                </p>
                <div className={styles.hospitalsGrid}>
                  {detail.hospitals.map((hosp, idx) => (
                    <div key={idx} className={styles.hospitalCardWrap}>
                      <HospitalCard hosp={hosp} />
                    </div>
                  ))}
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
                <span className={styles.dockSub}>Multidisciplinary Care &amp; Consultation</span>
              </div>
              <Link 
                href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`} 
                className={styles.dockActionBtn}
              >
                <Calendar size={14} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
