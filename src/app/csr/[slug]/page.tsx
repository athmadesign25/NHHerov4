"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  GraduationCap,
  School,
  Radio,
  Smartphone,
  Heart,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  PhoneCall,
  Calendar,
  Share2,
  Check,
  Activity,
  FileText,
  Users
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getCsrProgramBySlug, CSR_PROGRAMS_DATA, CsrProgramItem } from "@/data/csrData";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import styles from "./CsrDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CsrDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const program: CsrProgramItem = getCsrProgramBySlug(slug);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);

  // Other flagship programs for exploration below
  const otherPrograms = CSR_PROGRAMS_DATA.filter((p) => p.id !== program.id);

  const tocItems = [
    { id: "overview", label: "Overview & Mission" },
    { id: "pillars", label: "Core Program Pillars" },
    { id: "impact", label: "Verified Social Impact" },
    { id: "methodology", label: "Clinical Referral Network" },
    { id: "initiatives", label: "Related Flagship Programs" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const sections = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = scrollPos + 220;

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
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2400);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: program.title,
          text: program.description,
          url: window.location.href,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "camps":
        return <Stethoscope size={20} />;
      case "education":
        return <GraduationCap size={20} />;
      case "school":
        return <School size={20} />;
      case "radio":
        return <Radio size={20} />;
      case "mobile":
        return <Smartphone size={20} />;
      case "heart":
        return <Heart size={20} />;
      case "partnership":
        return <Building2 size={20} />;
      case "scholarship":
        return <GraduationCap size={20} />;
      default:
        return <CheckCircle2 size={20} />;
    }
  };

  return (
    <div className={styles.detailPageContainer}>
      {/* ─── STATIONARY ATMOSPHERIC BACKGROUND CANVAS (EXPANDING IMMERSION) ─── */}
      <div className={styles.stationaryCanvas} aria-hidden="true">
        <motion.div
          className={styles.stationaryMotionWrapper}
          initial={{ scale: 1.12, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={program.image}
            alt={program.imageAlt}
            fill
            priority
            sizes="100vw"
            className={styles.stationaryImage}
          />
        </motion.div>
        <div className={styles.stationaryCanvasOverlay} />
      </div>

      {/* ─── DETAIL HERO (SWEET SPOT ATMOSPHERIC SCRIM & CREDENTIAL METRICS) ─── */}
      <section className={styles.detailHero} data-nav-theme="dark">
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
                  { label: "CSR Overview", href: "/csr" },
                  { label: program.title },
                ]}
                theme="dark"
              />
            </div>

            <div className={styles.heroEyebrow}>
              <ShieldCheck size={14} />
              <span>{program.eyebrow}</span>
            </div>

            <h1 className={styles.heroMainTitle}>{program.title}</h1>

            <p className={styles.heroSubTitle}>{program.description}</p>

            <div className={styles.heroActionsRow}>
              <Link href="/doctors" className={styles.heroPrimaryBtn}>
                <Calendar size={15} />
                <span>Support This Initiative</span>
                <ArrowRight size={14} />
              </Link>

              <a href="tel:18003090309" className={styles.heroPhoneText}>
                <PhoneCall size={14} />
                <span>Narayana Foundation Helpline: <strong>1800 309 0309</strong></span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Sweet Spot Floating Credential Metrics */}
          <motion.div
            className={styles.heroRightCol}
            initial={{ opacity: 0, scale: 0.97, x: 14 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {program.statBadge && (
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>{program.statBadge.number}</span>
                <span className={styles.statLabel}>{program.statBadge.label}</span>
              </div>
            )}
            {program.modalContent.metrics.slice(0, 3).map((m, idx) => (
              <div key={idx} className={styles.statBlock}>
                <span className={styles.statNumber}>{m.value}</span>
                <span className={styles.statLabel}>{m.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── READING EXPERIENCE SHEET (PURE WHITE EDITORIAL CONTAINER) ─────── */}
      <div className={styles.readingExperienceWrapper}>
        <main className={styles.mainLayoutContainer}>
          <div className={styles.twoColumnGrid}>
            {/* ─── LEFT STICKY SIDEBAR (TOC & CSR DESK ACTIONS) ─────────────── */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <Activity size={13} />
                  <span>On This Initiative</span>
                </div>
                <nav className={styles.tocNavRail} aria-label="Table of contents">
                  <ul className={styles.tocList}>
                    {tocItems.map((item) => {
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
                                const yOffset = -96;
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
                                setActiveSection(item.id);
                              }
                            }}
                          >
                            <span className={styles.tocIndicatorMarker} aria-hidden="true" />
                            <span>{item.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Sidebar CSR Partnership Box */}
              <div className={styles.sidebarPartnerBox}>
                <h4 className={styles.sidebarPartnerTitle}>Partner with Narayana CSR</h4>
                <p className={styles.sidebarPartnerDesc}>
                  Collaborate under Schedule VII for audited corporate grants, school health drives, and institutional medical sponsorships.
                </p>
                <a href="mailto:csr@narayanahealth.org" className={styles.sidebarPartnerBtn}>
                  <span>Connect with CSR Desk</span>
                  <ArrowRight size={13} />
                </a>
              </div>

              {/* Share / Copy Link Button */}
              <button
                type="button"
                onClick={handleShare}
                className={styles.sidebarShareBtn}
                aria-label="Share initiative"
              >
                <Share2 size={14} />
                <span>Share Initiative</span>
              </button>
            </aside>

            {/* ─── RIGHT CONTENT COLUMN ───────────────────────────────────── */}
            <div className={styles.contentColumn}>
              {/* SECTION 1: OVERVIEW & MISSION */}
              <section id="overview" className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Overview & Community Mission</h2>
                <p className={styles.leadText}>{program.modalContent.lead}</p>
                {program.modalContent.paragraphs.map((p, idx) => (
                  <p key={idx} className={styles.bodyParagraph}>{p}</p>
                ))}
              </section>

              {/* SECTION 2: CORE PROGRAM PILLARS */}
              <section id="pillars" className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Core Strategic Pillars</h2>
                <p className={styles.bodyParagraph}>
                  Designed for scalable, long-term grassroots resilience, this initiative executes across three specialized clinical and social tracks:
                </p>
                <div className={styles.pillarsGrid}>
                  {program.points.map((pt, idx) => (
                    <div key={idx} className={styles.pillarCard}>
                      <div className={styles.pillarIconBox}>
                        {renderIcon(pt.iconName)}
                      </div>
                      <h3 className={styles.pillarTitle}>{pt.title}</h3>
                      <p className={styles.pillarDesc}>{pt.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 3: VERIFIED SOCIAL IMPACT */}
              <section id="impact" className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Measurable Social Impact & Audited SROI</h2>
                <p className={styles.bodyParagraph}>
                  Every rupee deployed through the Narayana Hrudayalaya Foundation is tracked under rigorous social return on investment (SROI) frameworks, ensuring verifiable patient outcomes and statutory transparency.
                </p>

                <div className={styles.metricsGrid}>
                  {program.modalContent.metrics.map((m, idx) => (
                    <div key={idx} className={styles.metricCard}>
                      <span className={styles.metricNumber}>{m.value}</span>
                      <span className={styles.metricText}>{m.label}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.governanceBox}>
                  <h4 className={styles.governanceTitle}>
                    Schedule VII Companies Act & Independent Clinical Governance
                  </h4>
                  <p className={styles.governanceText}>
                    Program expenditures are independently audited and certified under Schedule VII of the Companies Act, 2013. Clinical protocols follow standardized quaternary hospital guidelines vetted by senior Narayana Health medical boards.
                  </p>
                </div>
              </section>

              {/* SECTION 4: CLINICAL REFERRAL NETWORK */}
              <section id="methodology" className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Integrated Clinical Referral & Continuity of Care</h2>
                <p className={styles.bodyParagraph}>
                  Unlike isolated screening camps, our community interventions are fully integrated into Narayana Health's national hospital network. Beneficiaries diagnosed with cardiac defects, oncology lesions, or complex surgical conditions receive streamlined admission, sponsored travel assistance, and complete hospital coverage at zero cost to their families.
                </p>
                <p className={styles.bodyParagraph}>
                  Continuous digital health records and post-discharge follow-up ensure that patients transition from critical intervention back into long-term vitality and productive livelihood.
                </p>
              </section>

              {/* SECTION 5: RELATED FLAGSHIP CSR PROGRAMS */}
              <section id="initiatives" className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Explore Other Flagship CSR Initiatives</h2>
                <p className={styles.bodyParagraph}>
                  Discover our interconnected programs delivering healthcare equity, education, and community dialogue across India:
                </p>

                <div className={styles.relatedGrid}>
                  {otherPrograms.map((other) => (
                    <article key={other.id} className={styles.relatedCard}>
                      <div className={styles.relatedImgWrapper}>
                        <Image
                          src={other.image}
                          alt={other.imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 360px"
                          className={styles.relatedImg}
                        />
                      </div>
                      <div className={styles.relatedBody}>
                        <span className={styles.relatedEyebrow}>{other.eyebrow}</span>
                        <h3 className={styles.relatedCardTitle}>{other.title}</h3>
                        <p className={styles.relatedCardDesc}>{other.description}</p>
                        <Link href={`/csr/${other.id}`} className={styles.relatedCardCta}>
                          <span>Explore Initiative</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ─── MANDATORY UNIVERSAL PRE-FOOTER BANNER ─────────────────────────── */}
      <BlogCtaBanner bg="dark" />

      {/* ─── UNIFIED CLINICAL SIDE ACTIONS ─────────────────────────────────── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nOPD"}
        conditionTitle={program.title}
        pulseQuery={`Tell me more about Narayana Health's ${program.title} initiative and free charitable care.`}
      />

      {/* ─── LINK COPIED TOAST NOTIFICATION ───────────────────────────────── */}
      {copyToast && (
        <div className={styles.toastNotification}>
          <span>Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

