"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle,
  CheckCircle2, 
  Link as LinkIcon, 
  PhoneCall, 
  ArrowUpRight, 
  Calendar, 
  Activity, 
  Plus,
  Minus,
  Check,
  ShieldAlert,
  Stethoscope
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getSymptomDetailData, SymptomDetailData } from "@/data/symptomsData";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import styles from "./SymptomDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SymptomDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: SymptomDetailData = getSymptomDetailData(slug);

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
                  { label: "Symptoms", href: "/symptoms" },
                  { label: detail.shortTitle },
                ]}
                theme="dark"
              />
            </div>

            <div className={styles.heroEyebrow}>
              {detail.speciality} &bull; {detail.severity} TRIAGE
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
                <span>24×7 Emergency Helpline: <strong>1800 309 0309</strong></span>
              </a>
            </div>
          </div>

          {/* Right Hero Analytics */}
          <div className={styles.heroRightCol}>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.urgency}</span>
              <span className={styles.statLabel}>Clinical Urgency</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.specialist}</span>
              <span className={styles.statLabel}>Recommended Specialist</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.diagnosticTurnaround}</span>
              <span className={styles.statLabel}>Triaging Speed</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.hospitalNetwork}</span>
              <span className={styles.statLabel}>Emergency Centers</span>
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
                  <span>On This Guide</span>
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
                <h2 className={styles.sectionHeading}>Clinical Overview</h2>
                <p className={styles.leadParagraph}>{detail.leadParagraph}</p>
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Affected System</span>
                    <span className={styles.factCardVal}>{detail.speciality}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Clinical Priority</span>
                    <span className={styles.factCardVal}>{detail.urgencyLevel}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Consultation</span>
                    <span className={styles.factCardVal}>{detail.metrics.specialist}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Red-Flag Emergency Signs */}
              <section id="emergency-warning" className={styles.contentSection}>
                <div className={styles.emergencyAlertBanner}>
                  <div className={styles.alertHeader}>
                    <ShieldAlert size={20} className={styles.alertIcon} />
                    <h2 className={styles.alertTitle}>Red-Flag Warning Signs (Seek Immediate Emergency Care)</h2>
                  </div>
                  <p className={styles.alertSub}>
                    If you or a loved one experience any of the following critical warning signs, call 1800 309 0309 or proceed immediately to the nearest Narayana Health emergency department:
                  </p>
                  <ul className={styles.alertList}>
                    {detail.emergencySigns.map((sign, idx) => (
                      <li key={idx} className={styles.alertListItem}>
                        <AlertTriangle size={15} className={styles.alertBulletIcon} />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* SECTION: Common Causes */}
              <section id="causes" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Common Medical Causes</h2>
                <p className={styles.sectionLeadText}>
                  A symptom can result from localized organ distress or complex systemic conditions. Our consultants systematically differentiate between benign triggers and conditions requiring medical or surgical intervention:
                </p>
                <div className={styles.clinicalReadingList}>
                  {detail.causes.map((cause, idx) => (
                    <div key={idx} className={styles.clinicalReadingItem}>
                      <h3 className={styles.clinicalItemTitle}>{cause.name}</h3>
                      <p className={styles.clinicalItemDesc}>{cause.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: When to Consult */}
              <section id="when-to-consult" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>When to Consult a Specialist</h2>
                <p className={styles.sectionLeadText}>
                  Even in the absence of acute emergency red flags, early specialist consultation prevents disease progression. Schedule an outpatient appointment if:
                </p>
                <div className={styles.symptomsChecklist}>
                  {detail.whenToSeekCare.map((item, idx) => (
                    <div key={idx} className={styles.symptomCheckRow}>
                      <CheckCircle2 size={18} className={styles.symptomCheckIcon} />
                      <span className={styles.symptomCheckText}>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Diagnostic Pathway */}
              <section id="diagnostic-pathway" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Evidence-Based Diagnostic Pathway</h2>
                <p className={styles.sectionLeadText}>
                  At Narayana Health, precision diagnostics rapidly differentiate etiologies to establish targeted treatment plans without unnecessary delays:
                </p>
                <div className={styles.protocolsList}>
                  {detail.diagnosticPath.map((step, idx) => (
                    <div key={idx} className={styles.protocolRow}>
                      <span className={styles.protocolNum}>{String(idx + 1).padStart(2, "0")}</span>
                      <div className={styles.protocolContent}>
                        <h3 className={styles.protocolTitle}>{step.title}</h3>
                        <p className={styles.protocolDesc}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Recommended Specialists */}
              <section id="specialists" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Consult Senior Specialists</h2>
                <p className={styles.sectionLeadText}>
                  Meet accredited senior consultants specializing in {detail.speciality} across the Narayana Health network:
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
                            Book
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

              {/* Hospital Centers Carousel */}
              <section className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Specialised Care Centers</h2>
                <p className={styles.sectionLeadText}>
                  Receive multidisciplinary emergency and clinical care at our tertiary and quaternary centers:
                </p>
                <div className={styles.hospitalsGrid}>
                  {detail.hospitals.map((hosp, idx) => (
                    <div key={idx} className={styles.hospitalCardWrap}>
                      <HospitalCard hosp={hosp} className={carouselStyles.cardCompact} />
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
                <span className={styles.dockSub}>24×7 Rapid Care & Consultation</span>
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
