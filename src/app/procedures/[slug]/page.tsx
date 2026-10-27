"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  X, 
  Share2, 
  Link as LinkIcon, 
  PhoneCall, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Activity, 
  UserCheck, 
  Hospital, 
  HelpCircle,
  Plus,
  Minus
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import MedicallyReviewedBand from "@/components/ui/MedicallyReviewedBand";
import { TREATMENTS_PROCEDURES_DATA } from "@/data/treatmentsProceduresData";
import { HEART_TRANSPLANT_TOC, HEART_TRANSPLANT_DETAIL } from "@/data/heartTransplantDetailData";
import styles from "./ProcedureDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProcedureDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  
  // Find matching procedure or fall back to heart-transplant
  const procedure = TREATMENTS_PROCEDURES_DATA.find((p) => p.slug === slug) || TREATMENTS_PROCEDURES_DATA[0];
  const isHeartTransplant = procedure.slug === "heart-transplant" || slug === "heart-transplant";

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Set up intersection observer for active TOC highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = HEART_TRANSPLANT_TOC.map((item) => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  const heroImageSrc = isHeartTransplant
    ? "/images/procedures/heart_transplant_hero.jpg"
    : procedure.image;

  return (
    <div className={styles.detailPageContainer}>
      {/* ─── DETAIL HERO ─────────────────────────────────────────────────── */}
      <section className={styles.detailHero}>
        <div className={styles.heroInner}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Treatments & Procedures", href: "/treatments" },
                { label: procedure.title },
              ]}
              theme="dark"
            />
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroLeftContent}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                <span>{procedure.speciality}</span>
              </div>

              <h1 className={styles.heroMainTitle}>
                {isHeartTransplant ? HEART_TRANSPLANT_DETAIL.heroTitle : procedure.title}
              </h1>

              <p className={styles.heroSubTitle}>
                {isHeartTransplant ? HEART_TRANSPLANT_DETAIL.heroSubtitle : procedure.summary}
              </p>

              <div className={styles.heroActionsRow}>
                <Link href="/doctors" className={styles.primaryFindDocBtn}>
                  <span>Find a Specialist</span>
                  <ArrowUpRight size={18} />
                </Link>

                <Link href="/doctors" className={styles.secondaryBookBtn}>
                  <span>Book Consultation</span>
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className={styles.heroMetricsRow}>
                {procedure.successRate && (
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{procedure.successRate}</span>
                    <span className={styles.metricLabel}>Success Rate</span>
                  </div>
                )}
                {procedure.duration && (
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{procedure.duration}</span>
                    <span className={styles.metricLabel}>Procedure Duration</span>
                  </div>
                )}
                {procedure.hospitalStay && (
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{procedure.hospitalStay}</span>
                    <span className={styles.metricLabel}>Typical Stay</span>
                  </div>
                )}
                {procedure.recoveryTime && (
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{procedure.recoveryTime}</span>
                    <span className={styles.metricLabel}>Recovery Period</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3D Medical Illustration in Hero */}
            <div className={styles.heroImageCol}>
              <div className={styles.heroVisualFrame}>
                <Image
                  src={heroImageSrc}
                  alt={procedure.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 500px"
                  className={styles.heroVisualImg}
                />
              </div>
            </div>
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
                {HEART_TRANSPLANT_TOC.map((item) => {
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

            {/* Expert Coordinator Callback Card */}
            <div className={styles.sidebarHelpCard}>
              <div className={styles.helpCardTitle}>Need Medical Guidance?</div>
              <p className={styles.helpCardDesc}>
                Speak directly with a dedicated transplant clinical coordinator for guidance on eligibility, donor waitlists, and second opinions.
              </p>
              <a href="tel:18003090309" className={styles.helpCardPhoneBtn}>
                <PhoneCall size={15} />
                <span>1800-309-0309 (24x7)</span>
              </a>
            </div>
          </aside>

          {/* ─── RIGHT COLUMN: ARTICLE DETAILS ──────────────────────────── */}
          <article className={styles.articleContent}>
            {/* 1. Overview */}
            <section id="overview" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {HEART_TRANSPLANT_DETAIL.title}
              </h2>
              <p className={styles.leadParagraph}>
                {HEART_TRANSPLANT_DETAIL.leadParagraph}
              </p>
            </section>

            {/* 2. What Is a Heart Transplant? (Highlight Box) */}
            <section id="what-is-it" className={styles.sectionBlock}>
              <div className={styles.highlightBox}>
                <h3 className={styles.highlightBoxTitle}>
                  {HEART_TRANSPLANT_DETAIL.whatIsIt.title}
                </h3>
                <p className={styles.bodyParagraph}>
                  {HEART_TRANSPLANT_DETAIL.whatIsIt.description}
                </p>
                <ul className={styles.highlightKeyPointsList}>
                  {HEART_TRANSPLANT_DETAIL.whatIsIt.keyPoints.map((point, i) => (
                    <li key={i} className={styles.highlightKeyPoint}>
                      <span className={styles.checkIconWrapper}>
                        <Check size={16} />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3. Who Needs Heart Transplant Care? */}
            <section id="who-needs-care" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {HEART_TRANSPLANT_DETAIL.whoNeedsCare.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {HEART_TRANSPLANT_DETAIL.whoNeedsCare.description}
              </p>
              <div className={styles.conditionsGrid}>
                {HEART_TRANSPLANT_DETAIL.whoNeedsCare.conditions.map((item, i) => (
                  <div key={i} className={styles.conditionCard}>
                    <div className={styles.conditionName}>{item.name}</div>
                    <p className={styles.conditionDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. When Is It Recommended? */}
            <section id="when-recommended" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {HEART_TRANSPLANT_DETAIL.whenRecommended.title}
              </h2>
              <p className={styles.bodyParagraph}>
                {HEART_TRANSPLANT_DETAIL.whenRecommended.description}
              </p>
              <ul className={styles.bulletList} style={{ marginTop: "16px" }}>
                {HEART_TRANSPLANT_DETAIL.whenRecommended.recommendations.map((rec, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <CheckCircle2 size={16} color="#034EA2" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 5 & 6. Eligibility vs Non-Eligibility */}
            <section id="eligibility" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {HEART_TRANSPLANT_DETAIL.eligibility.title}
              </h2>
              <div className={styles.eligibilityRow}>
                <div className={`${styles.eligibilityCard} ${styles.eligibleCard}`}>
                  <h3 className={`${styles.eligibilityTitle} ${styles.eligibleTitle}`}>
                    <CheckCircle2 size={18} />
                    <span>General Eligibility Factors</span>
                  </h3>
                  <ul className={styles.bulletList}>
                    {HEART_TRANSPLANT_DETAIL.eligibility.eligiblePoints.map((pt, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <Check size={15} color="#15803d" style={{ flexShrink: 0, marginTop: "3px" }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div id="who-not-eligible" className={`${styles.eligibilityCard} ${styles.notEligibleCard}`}>
                  <h3 className={`${styles.eligibilityTitle} ${styles.notEligibleTitle}`}>
                    <X size={18} />
                    <span>Contraindications / Not Eligible</span>
                  </h3>
                  <ul className={styles.bulletList}>
                    {HEART_TRANSPLANT_DETAIL.eligibility.notEligiblePoints.map((pt, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <X size={15} color="#b91c1c" style={{ flexShrink: 0, marginTop: "3px" }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. How Donor Matching Works */}
            <section id="donor-matching" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>
                {HEART_TRANSPLANT_DETAIL.donorMatching.title}
              </h2>
              <div className={styles.matchingStepsList}>
                {HEART_TRANSPLANT_DETAIL.donorMatching.steps.map((st, i) => (
                  <div key={i} className={styles.matchingStepCard}>
                    <span className={styles.matchingStepNumber}>Step {st.step}</span>
                    <h3 className={styles.matchingStepTitle}>{st.title}</h3>
                    <p className={styles.matchingStepDesc}>{st.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. Waiting List */}
            <section id="waiting-list" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>The Heart Transplant Waiting List</h2>
              <p className={styles.bodyParagraph}>
                Once a patient is deemed medically eligible by the transplant board, they are formally registered on the state government organ sharing network (such as NOTTO in India). Allocation is strictly prioritized based on medical acuity (Status 1A, 1B, or 2), geographical proximity to the donor hospital, and waiting duration.
              </p>
            </section>

            {/* 9. Pre-Transplant Evaluation Tests */}
            <section id="pre-transplant-tests" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Pre-Transplant Evaluation Tests</h2>
              <p className={styles.bodyParagraph}>
                Before placement on the active recipient list, patients undergo an extensive multi-organ diagnostic evaluation:
              </p>
              <div className={styles.conditionsGrid}>
                {[
                  { name: "Right Heart Catheterization", desc: "Measures pulmonary vascular resistance (PVR) and cardiac output." },
                  { name: "High-Resolution Cardiac MRI & Echo", desc: "Assesses precise left and right ventricular ejection fractions." },
                  { name: "HLA Tissue Typing & PRA", desc: "Identifies antibody sensitivities to prevent post-op donor organ rejection." },
                  { name: "Pulmonary Function Tests (PFT)", desc: "Confirms lungs can tolerate prolonged bypass and ventilatory support." },
                  { name: "Renal & Hepatic Function Panels", desc: "Ensures kidneys and liver can withstand post-transplant medications." },
                  { name: "Comprehensive Infection Screening", desc: "Screens for latent CMV, EBV, Hepatitis, and TB to guide prophylaxis." },
                ].map((item, i) => (
                  <div key={i} className={styles.conditionCard}>
                    <div className={styles.conditionName}>{item.name}</div>
                    <p className={styles.conditionDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. Surgical Procedure */}
            <section id="surgical-procedure" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Surgical Procedure & Technology</h2>
              <p className={styles.bodyParagraph}>
                During orthotopic heart transplantation, the patient is placed on cardiopulmonary bypass (heart-lung machine). The diseased heart is excised, leaving behind the posterior walls of the atria. The donor heart is meticulously sewn into place (bicaval anastomosis technique), restoring physiological anatomical circulation. Narayana Health utilizes state-of-the-art TransMedics Organ Care System (OCS) warm perfusion technology for select long-distance organ transfers.
              </p>
            </section>

            {/* 11. Post-Transplant Recovery & Care */}
            <section id="recovery-care" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Post-Transplant Recovery & Care</h2>
              <p className={styles.bodyParagraph}>
                The post-surgical phase focuses on preventing rejection while protecting against infection. Regular surveillance via endomyocardial biopsies and non-invasive cell-free DNA blood assays ensures any early cellular rejection is treated promptly with adjusted immunosuppressant therapy.
              </p>
            </section>

            {/* 12. Cost & Insurance */}
            <section id="cost-insurance" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Cost & Insurance in India</h2>
              <div className={styles.costCard}>
                <div className={styles.costHeader}>
                  <div>
                    <div className={styles.costBadge}>Estimated All-Inclusive Surgery Package</div>
                    <div className={styles.costEstimateText}>{HEART_TRANSPLANT_DETAIL.costs.estimateRange}</div>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
                      International Patients: {HEART_TRANSPLANT_DETAIL.costs.internationalRange}
                    </div>
                  </div>
                  <Link href="/doctors" className={styles.trustPrimaryBtn}>
                    <span>Request Estimate</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className={styles.costInclusionsTitle}>Package Inclusions:</div>
                <div className={styles.costInclusionsGrid}>
                  {HEART_TRANSPLANT_DETAIL.costs.inclusions.map((inc, i) => (
                    <div key={i} className={styles.costInclusionItem}>
                      <CheckCircle2 size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: "1px" }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.costInsuranceNote}>
                  <strong>Insurance & Cashless Support: </strong>
                  {HEART_TRANSPLANT_DETAIL.costs.insuranceNote}
                </div>
              </div>
            </section>

            {/* 13. Top Surgeons */}
            <section id="specialists" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Top Cardiac Transplant Surgeons</h2>
              <p className={styles.bodyParagraph}>
                Our cardiac team has completed over 1,000+ organ transplants with international clinical benchmark outcomes.
              </p>
              <div className={styles.doctorsGrid}>
                {HEART_TRANSPLANT_DETAIL.doctors.map((doc, i) => (
                  <div key={i} className={styles.docCard}>
                    <div className={styles.docPhotoWrapper}>
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        className={styles.docPhoto}
                      />
                    </div>
                    <h3 className={styles.docName}>{doc.name}</h3>
                    <div className={styles.docDesignation}>{doc.designation}</div>
                    <div className={styles.docHospital}>{doc.hospital}</div>
                    <Link href="/doctors" className={styles.docBookBtn}>
                      Consult Doctor
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* 14. Equipped Hospitals */}
            <section id="hospitals" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Equipped Transplant Hospitals</h2>
              <div className={styles.hospitalsGrid}>
                {HEART_TRANSPLANT_DETAIL.hospitals.map((hosp, i) => (
                  <div key={i} className={styles.hospitalCard}>
                    <div className={styles.hospitalImgWrapper}>
                      <Image
                        src={hosp.image}
                        alt={hosp.name}
                        fill
                        className={styles.hospitalImg}
                      />
                    </div>
                    <div className={styles.hospitalBody}>
                      <h3 className={styles.hospitalName}>{hosp.name}</h3>
                      <div className={styles.hospitalCity}>{hosp.city}</div>
                      <div className={styles.hospitalBeds}>{hosp.beds}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 15. FAQs Accordion */}
            <section id="faqs" className={styles.sectionBlock}>
              <h2 className={styles.mainSectionTitle}>Frequently Asked Questions</h2>
              <div className={styles.faqAccordionList}>
                {HEART_TRANSPLANT_DETAIL.faqs.map((faq, i) => {
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

      {/* Sleek Medically Reviewed Band */}
      <MedicallyReviewedBand />
    </div>
  );
}
