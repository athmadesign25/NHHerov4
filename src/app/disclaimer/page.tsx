"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Scale,
  Stethoscope,
  PhoneCall,
  Building2,
  CheckCircle2,
  FileText,
  ExternalLink,
  Info,
  Lock,
  Clock,
  RefreshCw
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareWidget from "@/components/ui/ShareWidget";
import ContactCareSidebarCard from "@/components/ui/ContactCareSidebarCard";
import SpecialityFAQ from "@/components/ui/SpecialityFAQ";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import styles from "./Disclaimer.module.css";

// ─── AUTHENTIC NARAYANA HEALTH DISCLAIMER TABLE OF CONTENTS ──────────────────
const TOC_ITEMS = [
  { id: "medical-disclaimer", label: "1. Medical Information Notice" },
  { id: "emergency-protocol", label: "2. Medical Emergency Directive" },
  { id: "as-is-basis", label: "3. 'As Is' & Warranty Waiver" },
  { id: "accuracy-revisions", label: "4. Accuracy, Errata & Revisions" },
  { id: "doctor-patient", label: "5. No Doctor-Patient Relationship" },
  { id: "external-links", label: "6. External & Linked Websites" },
  { id: "intellectual-property", label: "7. Intellectual Property Rights" },
  { id: "terms-modifications", label: "8. Terms of Use Modifications" },
  { id: "governing-law", label: "9. Governing Law & Jurisdiction" },
  { id: "contact-office", label: "10. Registered Office & Contact" },
  { id: "faqs", label: "11. Frequently Asked Questions" },
];

// ─── FREQUENTLY ASKED QUESTIONS (USING UNIVERSAL SPECIALITY FAQ COMPONENT) ───
const DISCLAIMER_FAQS = [
  {
    question: "Does reading clinical content on this website create a doctor-patient relationship?",
    answer: "No. Browsing website materials, reading clinical guides, or submitting online inquiry forms does not establish a doctor-patient relationship with Narayana Health or any of its clinicians. A legally recognized doctor-patient relationship is created exclusively upon registered in-person OPD consultation or an authenticated teleconsultation.",
  },
  {
    question: "Can I use website contact forms or chat channels during a medical emergency?",
    answer: "No. Website forms, online messaging, and email channels are not monitored for emergency medical care. If you or someone with you experiences acute chest pain, breathlessness, loss of consciousness, stroke symptoms, or trauma, immediately call our 24×7 emergency helpline at 1800 309 0309 or proceed directly to the nearest hospital casualty department.",
  },
  {
    question: "What does providing materials on an 'As Is' basis mean legally?",
    answer: "An 'as is' and 'as available' basis means Narayana Hrudayalaya Limited provides all website materials without express or implied warranties of any kind—including warranties of merchantability, fitness for a particular purpose, or non-infringement. Users access and utilize online materials at their own sole discretion.",
  },
  {
    question: "Are diagnostic test prices and package estimates on the website final?",
    answer: "No. Website pricing indications and health check summaries are indicative benchmarks. Final hospital billing is determined at the time of admission based on individual clinical evaluation, specialist recommendations, room categories, implants, ICU requirements, and insurance pre-authorization terms.",
  },
  {
    question: "Which court has jurisdiction in the event of a website legal dispute?",
    answer: "In accordance with Narayana Hrudayalaya Limited's official terms of use, any claim or dispute relating to the website shall be governed by the laws of Karnataka, India, and subject exclusively to the jurisdiction of the competent courts in Bengaluru, Karnataka.",
  },
];

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState<string>("medical-disclaimer");

  // Active section scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || 0;
      const scrollThreshold = scrollPos + 220;

      for (let i = TOC_ITEMS.length - 1; i >= 0; i--) {
        const item = TOC_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollThreshold) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* ─── STATIONARY ATMOSPHERIC CANVAS ─────────────────────────────────── */}
      <div className={styles.stationaryCanvas} aria-hidden="true">
        <motion.div
          className={styles.stationaryMotionWrapper}
          initial={{ scale: 1.08, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/backgrounds/why-choose-nh-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.stationaryImage}
          />
        </motion.div>
        <div className={styles.stationaryCanvasOverlay} />
      </div>

      {/* ─── DETAIL HERO (1320px UNIVERSAL ANATOMY) ────────────────────────── */}
      <section className={styles.detailHero} data-nav-theme="dark">
        <div className={styles.heroBgOverlay} />

        <div className={styles.heroInner}>
          {/* Top Utility Row */}
          <div className={styles.topUtilityRow}>
            <div className={styles.breadcrumbsWrapper}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Legal & Compliance", href: "/disclaimer" },
                  { label: "Website Disclaimer" },
                ]}
              />
            </div>
            <div className={styles.policyVersionBadge}>
              <Scale size={12} />
              <span>Narayana Hrudayalaya Limited • Legal Disclaimer</span>
            </div>
          </div>

          {/* Hero Left Column Editorial */}
          <div className={styles.heroLeftCol}>
            <div className={styles.heroEyebrow}>
              <ShieldAlert size={14} />
              <span>OFFICIAL WEBSITE &amp; HEALTHCARE DISCLAIMER</span>
            </div>

            <h1 className={styles.heroMainTitle}>
              Disclaimer &amp; Terms of Healthcare Information
            </h1>

            <p className={styles.heroSubTitle}>
              Official legal disclaimers governing the use of Narayana Health&rsquo;s website materials, clinical content, &ldquo;as is&rdquo; warranty exclusions, limitation of liability, and emergency healthcare directives.
            </p>

            <div className={styles.heroActionsRow}>
              <a href="#emergency-protocol" className={styles.heroPrimaryBtn}>
                <AlertTriangle size={15} />
                <span>Emergency Protocol</span>
              </a>
              <a href="tel:18003090309" className={styles.heroSecondaryBtn}>
                <PhoneCall size={14} />
                <span>24×7 Helpline: 1800 309 0309</span>
              </a>
            </div>
          </div>

          {/* Horizontal Hero Metrics Row (CSR Hero Pattern) */}
          <div className={styles.metricsBottomWrap}>
            <div className={styles.statsGrid}>
              <div className={styles.statBlock}>
                <div className={styles.statNumber}>24×7</div>
                <div className={styles.statLabel}>Emergency Helpline Protocol</div>
              </div>
              <div className={styles.statBlock}>
                <div className={styles.statNumber}>As Is</div>
                <div className={styles.statLabel}>Information &amp; Software Basis</div>
              </div>
              <div className={styles.statBlock}>
                <div className={styles.statNumber}>Non-OPD</div>
                <div className={styles.statLabel}>Educational Content Only</div>
              </div>
              <div className={styles.statBlock}>
                <div className={styles.statNumber}>NABH / NABL</div>
                <div className={styles.statLabel}>Hospital Network Governance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── READING EXPERIENCE WRAPPER ────────────────────────────────────── */}
      <div className={styles.readingExperienceWrapper}>
        <div className={styles.mainLayoutContainer}>
          <div className={styles.twoColumnGrid}>
            {/* ─── LEFT STICKY SIDEBAR (TOC + HELPLINE) ────────────────────── */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <FileText size={13} />
                  <span>ON THIS PAGE</span>
                </div>

                <nav className={styles.tocNavRail} aria-label="Disclaimer Table of Contents">
                  <ul className={styles.tocList}>
                    {TOC_ITEMS.map((item) => (
                      <li key={item.id} className={styles.tocListItem}>
                        <a
                          href={`#${item.id}`}
                          className={`${styles.tocLink} ${
                            activeSection === item.id ? styles.tocLinkActive : ""
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Share Widget */}
              <ShareWidget title="Narayana Health Legal & Clinical Disclaimer" />

              {/* Unboxed 24×7 Sticky Helpline Companion */}
              <ContactCareSidebarCard />
            </aside>

            {/* ─── RIGHT MAIN READING ARTICLE CANVAS ───────────────────────── */}
            <main className={styles.mainArticleCol}>
              {/* Minimal Clinical Pathway Strip (Mandatory Section 1.C Standard) */}
              <div className={styles.clinicalPathwayStrip}>
                <div className={styles.stripLeft}>
                  <AlertTriangle size={18} className={styles.stripIcon} />
                  <p className={styles.stripText}>
                    <strong>Medical Emergency Notice:</strong> If you are experiencing acute chest pain, breathlessness, or stroke symptoms, please call our 24×7 emergency helpline immediately.
                  </p>
                </div>
                <div className={styles.stripActions}>
                  <a href="tel:18003090309" className={styles.stripPrimaryBtn}>
                    <PhoneCall size={13} />
                    <span>Call 1800 309 0309</span>
                  </a>
                  <Link href="/hospitals" className={styles.stripGlassBtn}>
                    <span>Find ER Hospital</span>
                  </Link>
                </div>
              </div>

              {/* ── SECTION 1: MEDICAL INFORMATION NOTICE ── */}
              <section id="medical-disclaimer" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Stethoscope size={13} />
                    <span>GENERAL INFORMATION DISCLOSURE</span>
                  </div>
                  <h2 className={styles.sectionTitle}>1. Medical Information Disclaimer</h2>
                </div>

                <p className={styles.sectionLead}>
                  The materials and content on Narayana Hrudayalaya Limited&rsquo;s website (including clinical articles, surgical procedure descriptions, doctor profiles, diagnostic overviews, and health tips) are provided for general educational, informational, and awareness purposes only.
                </p>

                <div className={styles.warningBox}>
                  <Info size={18} className={styles.warningIcon} />
                  <div className={styles.warningContent}>
                    <strong>Not Professional Medical Advice:</strong> Website content is not intended to substitute for professional medical advice, clinical diagnosis, or medical treatment. Always consult a qualified healthcare provider regarding any personal medical condition.
                  </div>
                </div>

                <p className={styles.sectionParagraph}>
                  Never disregard professional medical advice or delay in seeking it because of something you have read on this website. Health conditions require personalized evaluation by a certified physician based on individual clinical presentations, laboratory diagnostics, and medical history.
                </p>
              </section>

              {/* ── SECTION 2: MEDICAL EMERGENCY DIRECTIVE ── */}
              <section id="emergency-protocol" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <AlertTriangle size={13} />
                    <span>CRITICAL LIFE-SAFETY DIRECTIVE</span>
                  </div>
                  <h2 className={styles.sectionTitle}>2. Medical Emergency Directive</h2>
                </div>

                <div className={styles.emergencyAlertCard}>
                  <AlertTriangle size={24} className={styles.alertIcon} />
                  <div className={styles.alertContent}>
                    <h3 className={styles.alertTitle}>DO NOT USE THIS WEBSITE FOR EMERGENCY MEDICAL CARE</h3>
                    <p className={styles.alertBody}>
                      If you think you or a family member may have a medical emergency (such as severe chest pain, shortness of breath, sudden weakness or numbness, severe bleeding, or trauma):
                    </p>
                    <a href="tel:18003090309" className={styles.alertHelplineHighlight}>
                      <PhoneCall size={16} />
                      <span>IMMEDIATELY CALL OUR 24×7 EMERGENCY HELPLINE: 1800 309 0309</span>
                    </a>
                  </div>
                </div>

                <p className={styles.sectionParagraph}>
                  Website appointment booking forms, query channels, and email inboxes are not monitored for emergency triage. For acute emergencies, call 1800 309 0309, dial 112 / 108, or proceed immediately to the nearest hospital casualty emergency department.
                </p>
              </section>

              {/* ── SECTION 3: 'AS IS' & WARRANTY WAIVER (OFFICIAL CLAUSE) ── */}
              <section id="as-is-basis" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Lock size={13} />
                    <span>OFFICIAL DISCLAIMER CLAUSE</span>
                  </div>
                  <h2 className={styles.sectionTitle}>3. &ldquo;As Is&rdquo; Basis &amp; Disclaimer of Warranties</h2>
                </div>

                <p className={styles.sectionLead}>
                  The materials on Narayana Hrudayalaya&rsquo;s website are provided on an <strong>&lsquo;as is&rsquo;</strong> and <strong>&lsquo;as available&rsquo;</strong> basis without warranties of any kind.
                </p>

                <p className={styles.sectionParagraph}>
                  Narayana Hrudayalaya makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <p className={styles.sectionParagraph}>
                  Further, Narayana Hrudayalaya does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
                </p>
              </section>

              {/* ── SECTION 4: ACCURACY, ERRATA & REVISIONS (OFFICIAL CLAUSE) ── */}
              <section id="accuracy-revisions" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <RefreshCw size={13} />
                    <span>ERRATA &amp; CONTENT REVISIONS</span>
                  </div>
                  <h2 className={styles.sectionTitle}>4. Accuracy, Errata &amp; Content Revisions</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  The materials appearing on Narayana Hrudayalaya&rsquo;s website could include technical, typographical, or photographic errors. Narayana Hrudayalaya does not warrant that any of the materials on its website are accurate, complete, or current.
                </p>

                <p className={styles.sectionParagraph}>
                  Narayana Hrudayalaya may make changes to the materials contained on its website at any time without notice. Narayana Hrudayalaya does not, however, make any commitment to update the materials.
                </p>
              </section>

              {/* ── SECTION 5: NO DOCTOR-PATIENT RELATIONSHIP ── */}
              <section id="doctor-patient" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Scale size={13} />
                    <span>CLINICAL PRIVILEGE BOUNDARY</span>
                  </div>
                  <h2 className={styles.sectionTitle}>5. No Doctor-Patient Relationship</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  Browsing this website, submitting an inquiry form, or receiving an informational reply does not establish a confidential doctor-patient relationship with Narayana Health or any of its clinicians.
                </p>

                <p className={styles.sectionParagraph}>
                  A formal doctor-patient relationship is established exclusively upon registered outpatient (OPD) consultation, inpatient admission, or an authenticated telemedicine consultation conforming to statutory National Medical Commission (NMC) guidelines.
                </p>
              </section>

              {/* ── SECTION 6: EXTERNAL & LINKED WEBSITES (OFFICIAL CLAUSE) ── */}
              <section id="external-links" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <ExternalLink size={13} />
                    <span>HYPERLINKS &amp; THIRD-PARTY WEBSITES</span>
                  </div>
                  <h2 className={styles.sectionTitle}>6. External Links &amp; Third-Party Sites</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  Narayana Hrudayalaya has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Narayana Hrudayalaya of the site.
                </p>

                <p className={styles.sectionParagraph}>
                  Use of any such linked website is at the user&rsquo;s own risk. Narayana Health encourages visitors to read the terms and privacy statements of any external site they visit.
                </p>
              </section>

              {/* ── SECTION 7: INTELLECTUAL PROPERTY RIGHTS ── */}
              <section id="intellectual-property" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Building2 size={13} />
                    <span>PROPRIETARY OWNERSHIP</span>
                  </div>
                  <h2 className={styles.sectionTitle}>7. Intellectual Property &amp; Trademarks</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  All logos, trademarks, service marks, clinical articles, illustrations, software, and visual designs published on this website are the proprietary intellectual property of Narayana Hrudayalaya Limited.
                </p>

                <p className={styles.sectionParagraph}>
                  Users are granted a limited license to view and print pages for personal, non-commercial healthcare awareness. Unauthorized reproduction, modification, scraping, or commercial distribution is strictly prohibited without prior written consent.
                </p>
              </section>

              {/* ── SECTION 8: TERMS OF USE MODIFICATIONS (OFFICIAL CLAUSE) ── */}
              <section id="terms-modifications" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Clock size={13} />
                    <span>POLICY UPDATES</span>
                  </div>
                  <h2 className={styles.sectionTitle}>8. Site Terms of Use Modifications</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  Narayana Hrudayalaya may revise these terms of use and disclaimer for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
                </p>
              </section>

              {/* ── SECTION 9: GOVERNING LAW & JURISDICTION (OFFICIAL CLAUSE) ── */}
              <section id="governing-law" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Scale size={13} />
                    <span>LEGAL JURISDICTION</span>
                  </div>
                  <h2 className={styles.sectionTitle}>9. Governing Law &amp; Judicial Venue</h2>
                </div>

                <p className={styles.sectionParagraph}>
                  Any claim relating to Narayana Hrudayalaya&rsquo;s website shall be governed by the laws of the State of Karnataka, India without regard to its conflict of law provisions.
                </p>

                <p className={styles.sectionParagraph}>
                  The civil courts located in <strong>Bengaluru, Karnataka, India</strong> shall have exclusive jurisdiction over any disputes arising from or connected with the use of this website.
                </p>
              </section>

              {/* ── SECTION 10: REGISTERED OFFICE & CONTACT ── */}
              <section id="contact-office" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Building2 size={13} />
                    <span>OFFICIAL HEADQUARTERS</span>
                  </div>
                  <h2 className={styles.sectionTitle}>10. Registered Office &amp; Contact Information</h2>
                </div>

                <div className={styles.contactDetailsGrid}>
                  <div className={styles.contactCard}>
                    <span className={styles.contactRole}>REGISTERED OFFICE</span>
                    <address className={styles.contactAddress}>
                      <strong>Narayana Hrudayalaya Limited</strong><br />
                      258/A, Bommasandra Industrial Area,<br />
                      Anekal Taluk, Bengaluru,<br />
                      Karnataka – 560099, India
                    </address>
                    <a href="tel:18003090309" className={styles.contactLink}>
                      <PhoneCall size={13} />
                      <span>Helpline: 1800 309 0309</span>
                    </a>
                  </div>

                  <div className={styles.contactCard}>
                    <span className={styles.contactRole}>LEGAL &amp; COMPLIANCE COMMUNICATIONS</span>
                    <address className={styles.contactAddress}>
                      <strong>Corporate Communications Cell</strong><br />
                      Email: <a href="mailto:info@narayanahealth.org" className={styles.contactLink}>info@narayanahealth.org</a><br />
                      Official Website: <a href="https://www.narayanahealth.org" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>narayanahealth.org</a>
                    </address>
                    <Link href="/book-an-appointment" className={styles.contactLink}>
                      <span>Book Consultation →</span>
                    </Link>
                  </div>
                </div>
              </section>

              {/* ── SECTION 11: UNIVERSAL SPECIALITY FAQ COMPONENT (EXACT REPO STYLE) ── */}
              <section id="faqs" className={styles.policySection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionBadge}>
                    <Info size={13} />
                    <span>PATIENT CLARIFICATIONS</span>
                  </div>
                  <h2 className={styles.sectionTitle}>11. Frequently Asked Questions</h2>
                </div>

                <div className={styles.faqSectionWrapper}>
                  <SpecialityFAQ faqs={DISCLAIMER_FAQS} theme="light" fluid defaultOpenIndex={0} />
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* ─── MANDATORY UNIVERSAL PRE-FOOTER CTA CARD BANNER ─────────────────── */}
      <BlogCtaBanner
        bg="white"
        eyebrow="COMMITTED TO PATIENT TRUST & CLINICAL INTEGRITY"
        title="Connect with a Narayana Health Specialist Today"
        subtitle="Whether you need an in-person clinical opinion, advanced surgical evaluation, or second opinion — our 4,500+ super-specialists are here to guide you."
        primaryBtn={{ href: "/book-an-appointment", text: "Find a Specialist" }}
        secondaryBtn={{ href: "/health-packages", text: "Explore Health Packages" }}
      />

      {/* ─── UNIVERSAL CLINICAL FLOATING SIDE ACTIONS ──────────────────────── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nOPD"}
        conditionTitle="Legal & Clinical Governance"
        pulseQuery="I have questions regarding Narayana Health's clinical policies, emergency protocols, and hospital terms."
      />
    </div>
  );
}
