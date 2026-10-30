"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building,
  CheckCircle2, 
  Link as LinkIcon, 
  PhoneCall, 
  ArrowUpRight, 
  Calendar, 
  Activity, 
  Plus, 
  Minus,
  Check,
  MapPin,
  ShieldCheck,
  Clock
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getHospitalDetailData, HospitalDetailData } from "@/data/hospitalsDirectoryData";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import styles from "./HospitalDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function HospitalDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: HospitalDetailData = getHospitalDetailData(slug);

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
                  { label: "Hospitals & Clinics", href: "/hospitals" },
                  { label: detail.name },
                ]}
                theme="dark"
              />
            </div>

            <div className={styles.heroEyebrow}>
              {detail.city}, {detail.state} &bull; {detail.type}
            </div>

            <h1 className={styles.heroMainTitle}>
              {detail.heroTitle}
            </h1>

            <p className={styles.heroSubTitle}>
              {detail.address}
            </p>

            <div className={styles.heroActionsRow}>
              <Link 
                href={`/doctors?location=${encodeURIComponent(detail.city)}`} 
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Book Hospital OPD</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <a href={`tel:${detail.emergencyPhone}`} className={styles.heroPhoneText}>
                <PhoneCall size={14} className={styles.phoneIcon} />
                <span>24×7 Emergency: <strong>{detail.emergencyPhone}</strong></span>
              </a>
            </div>
          </div>

          {/* Right Hero Analytics */}
          <div className={styles.heroRightCol}>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.beds}</span>
              <span className={styles.statLabel}>Total Bed Capacity</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.icu}</span>
              <span className={styles.statLabel}>ICU / Critical Care</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.emergency}</span>
              <span className={styles.statLabel}>Emergency Triage</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.metrics.accreditation}</span>
              <span className={styles.statLabel}>Accreditation</span>
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
                  <Building size={13} className={styles.tocEyebrowIcon} />
                  <span>On This Center</span>
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
                <span className={styles.shareTitle}>Share this hospital</span>
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
                <h2 className={styles.sectionHeading}>Hospital Overview</h2>
                <p className={styles.leadParagraph}>{detail.leadParagraph}</p>
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Location</span>
                    <span className={styles.factCardVal}>{detail.city}, {detail.state}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Total Capacity</span>
                    <span className={styles.factCardVal}>{detail.beds}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Emergency Contact</span>
                    <span className={styles.factCardVal}>{detail.emergencyPhone}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Centers of Excellence */}
              <section id="specialities" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Centers of Excellence &amp; Key Specialities</h2>
                <p className={styles.sectionLeadText}>
                  {detail.name} houses advanced medical institutes offering multidisciplinary inpatient and surgical care:
                </p>
                <div className={styles.checklistContainer}>
                  {detail.keySpecialities.map((spec, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span className={styles.checkText}><strong>{spec}</strong> &mdash; Comprehensive clinical departments and specialist suites</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Infrastructure & Amenities */}
              <section id="facilities" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Infrastructure &amp; Patient Amenities</h2>
                <p className={styles.sectionLeadText}>
                  Designed for seamless patient recovery, modern diagnostic precision, and caregiver comfort:
                </p>
                <div className={styles.cardsStack}>
                  {detail.amenities.map((amenity, idx) => (
                    <div key={idx} className={styles.causeCard}>
                      <div className={styles.causeCardHeader}>
                        <h3 className={styles.causeTitle}>{amenity}</h3>
                        <span className={styles.causeTag}>24×7 Available</span>
                      </div>
                      <p className={styles.causeDesc}>
                        Comprehensive institutional support facility adhering to rigorous safety and hygiene benchmarks.
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Senior Doctors */}
              <section id="specialists" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Senior Doctors at this Center</h2>
                <p className={styles.sectionLeadText}>
                  Book consultations with senior consultants practicing at {detail.name}:
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
                        <p className={styles.docExp}>{doc.experience} &bull; {detail.city}</p>
                        <Link 
                          href={`/doctors?location=${encodeURIComponent(detail.city)}`} 
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

              {/* SECTION: Contact & Location */}
              <section id="contact-location" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Address &amp; Emergency Location</h2>
                <div className={styles.causeCard} style={{ borderColor: "#034EA2" }}>
                  <div className={styles.causeCardHeader}>
                    <h3 className={styles.causeTitle}>{detail.name}</h3>
                    <span className={styles.causeTag}>{detail.city}</span>
                  </div>
                  <p className={styles.leadParagraph} style={{ marginBottom: "14px" }}>
                    <MapPin size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "#034EA2" }} />
                    {detail.address}
                  </p>
                  <p className={styles.causeDesc}>
                    Central Desk: <strong>{detail.phone}</strong> &bull; Emergency Dispatch: <strong>{detail.emergencyPhone}</strong>
                  </p>
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
        consultHref={`/doctors?location=${encodeURIComponent(detail.city)}`}
        consultLabel={"Book\nOPD Now"}
        conditionTitle={detail.name}
        pulseQuery={`I want to know about facilities, specialists, and appointments at ${detail.name}, ${detail.city}.`}
        isScrolled={isScrolled}
      />
    </div>
  );
}
