"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Minus
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getProcedureDetailData, ProcedureDetailData } from "@/data/procedureDetailGenerator";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
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
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPulseOpen, setIsPulseOpen] = useState(false);

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

  return (
    <motion.div 
      className={styles.detailPageContainer}
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ─── DETAIL HERO (FULL BACKGROUND IMAGE & ATMOSPHERIC GRADIENT) ─────── */}
      <section className={styles.detailHero} data-nav-theme="dark">
        {/* Full scale background image with gentle zoom settle */}
        <div className={styles.heroBg}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={detail.heroImage}
              alt={detail.title}
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroLeftCol}>
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

            {/* Complementary Subtitle */}
            <p className={styles.heroSubTitle}>
              {detail.heroSubtitle}
            </p>

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
                <span>24×7 Care Helpline: <strong>1800 309 0309</strong></span>
              </a>
            </div>
          </div>

          {/* Right Column: Secondary Credential Metrics matching Treatments Library */}
          <div className={styles.heroRightCol}>
            {detail.metrics.successRate && (
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>{detail.metrics.successRate}</span>
                <span className={styles.statLabel}>Success Rate</span>
              </div>
            )}
            {detail.metrics.duration && (
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>{detail.metrics.duration}</span>
                <span className={styles.statLabel}>Duration</span>
              </div>
            )}
            {detail.metrics.hospitalStay && (
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>{detail.metrics.hospitalStay}</span>
                <span className={styles.statLabel}>Typical Stay</span>
              </div>
            )}
            {detail.metrics.recoveryTime && (
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>{detail.metrics.recoveryTime}</span>
                <span className={styles.statLabel}>Recovery Period</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY ───────────────────────────────────────────── */}
      <main className={styles.mainLayoutContainer}>
        <div className={styles.twoColumnGrid}>
          {/* ─── LEFT COLUMN: STICKY TOC & SHARING ──────────────────────── */}
          <aside className={styles.stickySidebar}>
            <div className={styles.tocCard}>
              <h2 className={styles.tocHeaderTitle}>Table of Contents</h2>
              <ul className={styles.tocList}>
                {detail.toc.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
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
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Share Widget */}
            <div className={styles.shareWidget}>
              <div className={styles.shareWidgetTitle}>Share with your community!</div>
              <div className={styles.shareIconsRow}>
                <button
                  className={styles.shareBtn}
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  className={styles.shareBtn}
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button
                  className={styles.shareBtn}
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`, "_blank")}
                  title="Share on X"
                  aria-label="Share on X"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  className={styles.shareBtn}
                  onClick={handleCopyLink}
                  title="Copy Link to Clipboard"
                  aria-label="Copy Link"
                >
                  <LinkIcon size={17} />
                </button>
              </div>
              {copyToast && (
                <div style={{ fontSize: "11px", color: "#10b981", marginTop: "8px", fontWeight: 600 }}>
                  ✓ Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Medical Guidance Helpline Card */}
            <div className={styles.sidebarHelpCard}>
              <div className={styles.helpCardTitle}>Need Medical Guidance?</div>
              <p className={styles.helpCardDesc}>
                Speak directly with our clinical surgical coordinators for consultations, second opinions, and procedure scheduling.
              </p>
              <a href="tel:18003090309" className={styles.helpCardPhoneBtn}>
                <PhoneCall size={14} />
                <span>1800 309 0309 (24×7)</span>
              </a>
            </div>
          </aside>

          {/* ─── RIGHT COLUMN: ARTICLE DETAILS (UNIFIED EDITORIAL LAYOUT) ─── */}
          <article className={styles.articleContent}>
            {/* 1. Overview */}
            <section id="overview" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {detail.title}
              </h2>
              <p className={styles.leadParagraph}>
                {detail.leadParagraph}
              </p>

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

            {/* 10. Top Specialists (Matching Pulse AI Doctor Cards) */}
            <section id="specialists" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Specialist Surgeons & Consultants</h2>
              <p className={styles.bodyParagraph}>
                Our senior surgeons and clinical specialists bring decades of experience, board certifications, and high procedural success rates.
              </p>
              <div className={styles.doctorsGrid}>
                {detail.doctors.map((doc, i) => (
                  <div key={i} className={styles.refDoctorCard}>
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
                            {doc.speciality}
                          </div>
                          <div className={styles.refDocExpRow}>
                            <span>{doc.experience}</span>
                          </div>
                          <div className={styles.refDocHospital} title={doc.hospital}>
                            {doc.hospital}
                          </div>
                        </div>

                        <Link href="/doctors" className={styles.refBookBtnWhite}>
                          Book
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 11. Equipped Hospitals (Matching Unified Card Language) */}
            <section id="hospitals" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Equipped Surgical Centres</h2>
              <div className={styles.hospitalsGrid}>
                {detail.hospitals.map((hosp, i) => (
                  <div key={i} className={styles.refHospitalCard}>
                    <Image
                      src={hosp.image}
                      alt={hosp.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      className={styles.refHospFullImage}
                    />
                    <div className={styles.refHospFullGradient} />
                    <div className={styles.refHospOverlayContent}>
                      <h3 className={styles.refHospName}>{hosp.name}</h3>
                      <div className={styles.refHospCity}>{hosp.city}</div>
                      <span className={styles.refHospBedsBadge}>{hosp.beds}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 12. FAQs Accordion */}
            <section id="faqs" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Frequently Asked Questions</h2>
              <div className={styles.faqAccordionList}>
                {detail.faqs.map((faq, i) => {
                  const isOpen = openFaqIdx === i;
                  return (
                    <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                      <button
                        className={styles.faqTrigger}
                        onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <Minus size={18} color="#034EA2" /> : <Plus size={18} color="#64748b" />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <div className={styles.faqAnswer}>{faq.a}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* ─── FLOATING ACTION BOXES (FAB GROUP ON RIGHT MID-HEIGHT) ───────── */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            className={styles.floatingSideBoxes}
            initial={{ opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="region"
            aria-label="Quick clinical actions"
          >
            {/* Box 1: Book Consultation */}
            <Link
              href={`/doctors?speciality=${encodeURIComponent(detail.speciality)}`}
              className={styles.floatingBoxItem}
              title={`Book Consultation for ${detail.shortTitle}`}
              aria-label="Book Consultation"
            >
              <div className={styles.boxIconWrap}>
                <Calendar size={18} />
              </div>
              <span className={styles.boxLabel}>Book<br />Consultation</span>
            </Link>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 2: Contact Support */}
            <a
              href="tel:18003090309"
              className={styles.floatingBoxItem}
              title="Contact Support: 1800 309 0309"
              aria-label="Contact Support"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconSupport}`}>
                <PhoneCall size={17} />
              </div>
              <span className={styles.boxLabel}>Contact<br />Support</span>
            </a>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 3: Ask Pulse */}
            <button
              type="button"
              className={styles.floatingBoxItem}
              onClick={() => setIsPulseOpen(true)}
              title={`Ask Pulse AI about ${detail.shortTitle}`}
              aria-label="Ask Pulse AI"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconPulse}`}>
                <div className={styles.pulseLottieBox}>
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
              </div>
              <span className={styles.boxLabel}>Ask<br />Pulse</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PULSE AI OVERLAY ────────────────────────────────────────────── */}
      {isPulseOpen && (
        <PulseAIWorkspace
          onClose={() => setIsPulseOpen(false)}
          initialQuery={`I want to know about ${detail.title}: procedure details, eligibility, and expected recovery.`}
          backLabel={`Back to ${detail.shortTitle}`}
        />
      )}
    </motion.div>
  );
}
