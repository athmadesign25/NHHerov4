"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen,
  CheckCircle2, 
  Link as LinkIcon, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Check,
  UserCheck,
  Share2,
  BookmarkCheck,
  Sparkles,
  PhoneCall,
  Video,
  ShieldCheck,
  HeartPulse
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getArticleDetailData, ArticleDetailData } from "@/data/articlesDirectoryData";
import styles from "./ArticleDetail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const detail: ArticleDetailData = getArticleDetailData(slug);

  const [activeSection, setActiveSection] = useState<string>("overview");
  const [copyToast, setCopyToast] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPos > 320);

      const sections = detail.toc.map((item) => document.getElementById(item.id)).filter(Boolean);
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
                  { label: "Health Articles", href: "/articles" },
                  { label: detail.title },
                ]}
                theme="dark"
              />
            </div>

            <div className={styles.heroEyebrow}>
              {detail.category} &bull; {detail.publishedDate} &bull; {detail.readTime}
            </div>

            <h1 className={styles.heroMainTitle}>
              {detail.title}
            </h1>

            <p className={styles.heroSubTitle}>
              {detail.summary}
            </p>

            {/* Author Attribution pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.4)" }}>
                <Image
                  src={detail.authorAvatar}
                  alt={detail.author}
                  fill
                  sizes="42px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{detail.author}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{detail.authorRole}</span>
              </div>
            </div>

            <div className={styles.heroActionsRow}>
              <Link 
                href={`/doctors?speciality=${encodeURIComponent(detail.categorySlug)}`} 
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Consult Specialist</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <button
                type="button"
                onClick={handleCopyLink}
                className={styles.heroPhoneText}
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <Share2 size={14} className={styles.phoneIcon} />
                <span>{copyToast ? "Link Copied!" : "Share this Clinical Article"}</span>
              </button>
            </div>
          </div>

          {/* Right Hero Analytics */}
          <div className={styles.heroRightCol}>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Doctor Authored</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>Peer Reviewed</span>
              <span className={styles.statLabel}>Medical Advisory</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.readTime}</span>
              <span className={styles.statLabel}>Estimated Reading</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statNumber}>{detail.publishedDate}</span>
              <span className={styles.statLabel}>Last Medical Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY (SOLID WHITE READING SHEET) ──────────────────── */}
      <div className={styles.readingExperienceWrapper}>
        <main className={styles.mainLayoutContainer}>
          <div className={styles.twoColumnGrid}>
            {/* Sticky Table of Contents Sidebar */}
            <aside className={styles.stickySidebar}>
              <div className={styles.tocSectionSelector}>
                <div className={styles.tocEyebrow}>
                  <BookOpen size={13} className={styles.tocEyebrowIcon} />
                  <span>Article Contents</span>
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
                <span className={styles.shareTitle}>Share this Article</span>
                <div className={styles.shareRow}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={styles.shareBtn}
                    aria-label="Copy article link"
                    title="Copy Link"
                  >
                    {copyToast ? <Check size={14} className={styles.copySuccessIcon} /> : <LinkIcon size={14} />}
                  </button>
                </div>
                {copyToast && <span className={styles.copyToastText}>Link copied to clipboard</span>}
              </div>

              {/* Help & Support Callout */}
              <div className={styles.sidebarHelpCallout}>
                <span className={styles.helpCardTitle}>Need Medical Guidance?</span>
                <p className={styles.helpCardDesc}>
                  Connect directly with our senior clinical specialists for a dedicated consultation.
                </p>
                <Link
                  href={`/doctors?speciality=${encodeURIComponent(detail.categorySlug)}`}
                  className={styles.helpCardPhoneBtn}
                >
                  <span>Book Consultation &rarr;</span>
                </Link>
              </div>
            </aside>

            {/* Reading Content Focus Canvas */}
            <div className={styles.contentFocusCanvas}>
              {/* SECTION: Overview */}
              <section id="overview" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Overview &amp; Clinical Background</h2>
                <p className={styles.leadParagraph}>{detail.overview}</p>
                
                <div className={styles.quickFactsGrid}>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Speciality Domain</span>
                    <span className={styles.factCardVal}>{detail.category}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Lead Specialist</span>
                    <span className={styles.factCardVal}>{detail.author}</span>
                  </div>
                  <div className={styles.factCard}>
                    <span className={styles.factCardLabel}>Reading Duration</span>
                    <span className={styles.factCardVal}>{detail.readTime}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Key Takeaways */}
              <section id="key-takeaways" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Doctor&apos;s Key Takeaways</h2>
                <p className={styles.sectionLeadText}>
                  Essential medical advice summarized by our clinical panel for everyday health management:
                </p>
                <div className={styles.checklistContainer}>
                  {detail.keyTakeaways.map((point, idx) => (
                    <div key={idx} className={styles.checklistItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span className={styles.checkText}><strong>{point}</strong></span>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: In-Depth Sections */}
              {detail.sections.map((sec, idx) => (
                <section key={idx} id={`section-${idx + 1}`} className={styles.contentSection}>
                  <h2 className={styles.sectionHeading}>{sec.heading}</h2>
                  <div className={styles.causeCard} style={{ background: "#FFFFFF", padding: "24px" }}>
                    <p className={styles.causeDesc} style={{ fontSize: "15px", lineHeight: "1.75", color: "#334155" }}>
                      {sec.body}
                    </p>
                  </div>
                </section>
              ))}

              {/* SECTION: Author Review Board Callout */}
              <section className={styles.contentSection}>
                <div className={styles.stepCard} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #034EA2" }}>
                    <Image
                      src={detail.authorAvatar}
                      alt={detail.author}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className={styles.stepContent}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <UserCheck size={16} style={{ color: "#034EA2" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#034EA2" }}>
                        Reviewed by Narayana Medical Board
                      </span>
                    </div>
                    <h3 className={styles.stepTitle} style={{ fontSize: "17px", margin: "0 0 4px 0" }}>
                      {detail.author}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 8px 0" }}>
                      {detail.authorRole} &bull; Narayana Health
                    </p>
                    <p className={styles.stepDesc} style={{ fontSize: "13.5px" }}>
                      This content is reviewed periodically by certified physicians to reflect recent clinical trial data, ICMR protocols, and WHO healthcare benchmarks.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION: Consult Specialists */}
              <section id="specialists" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Consult Leading {detail.category} Specialists</h2>
                <p className={styles.sectionLeadText}>
                  Connect in-person or via video consultation with Narayana Health senior consultants:
                </p>
                <div className={styles.doctorsGrid}>
                  {detail.doctors.map((doc, idx) => (
                    <div key={idx} className={styles.doctorCard}>
                      <div className={styles.docAvatarWrap}>
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          sizes="72px"
                          className={styles.docAvatar}
                        />
                      </div>
                      <div className={styles.docInfo}>
                        <h4 className={styles.docName}>{doc.name}</h4>
                        <span className={styles.docDesig}>{doc.designation}</span>
                        <span className={styles.docExp}>{doc.experience} &bull; {doc.hospital}</span>
                        <Link 
                          href={`/doctors?search=${encodeURIComponent(doc.name)}`} 
                          className={styles.docBookBtn}
                        >
                          Book Appointment &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Related Articles */}
              <section id="related" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Related Health Articles</h2>
                <p className={styles.sectionLeadText}>
                  Explore more doctor-curated guides and clinical wellness insights:
                </p>
                <div className={styles.cardsStack}>
                  {detail.relatedArticles.map((rel) => (
                    <Link 
                      key={rel.id} 
                      href={`/articles/${rel.slug}`} 
                      className={styles.causeCard}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div className={styles.causeCardHeader}>
                        <h4 className={styles.causeTitle}>{rel.title}</h4>
                        <span className={styles.causeTag}>{rel.readTime}</span>
                      </div>
                      <p className={styles.causeDesc}>{rel.summary}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", color: "#034EA2", fontSize: "13px", fontWeight: 600 }}>
                        <span>Read full article</span>
                        <ArrowUpRight size={13} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ─── FLOATING ACTION BOXES (STICKY QUICK ACCESS) ──────────────────── */}
      <div className={styles.floatingSideBoxes} aria-label="Quick Actions">
        <Link 
          href={`/doctors?speciality=${encodeURIComponent(detail.categorySlug)}`}
          className={styles.floatingBoxItem}
          title="Book Doctor Appointment"
        >
          <div className={styles.boxIconWrap}>
            <Calendar size={18} />
          </div>
          <span className={styles.boxLabel}>Book OPD</span>
        </Link>

        <div className={styles.boxDivider} />

        <Link 
          href="/doctors"
          className={styles.floatingBoxItem}
          title="Video Consultation"
        >
          <div className={`${styles.boxIconWrap} ${styles.boxIconSupport}`}>
            <Video size={18} />
          </div>
          <span className={styles.boxLabel}>Video Call</span>
        </Link>

        <div className={styles.boxDivider} />

        <a 
          href="tel:08067506800"
          className={styles.floatingBoxItem}
          title="Emergency 24x7 Helpline"
        >
          <div className={`${styles.boxIconWrap} ${styles.boxIconPulse}`}>
            <HeartPulse size={18} />
          </div>
          <span className={styles.boxLabel}>Emergency</span>
        </a>
      </div>
    </div>
  );
}
