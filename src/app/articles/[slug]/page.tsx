"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { specialityBookingEntry } from "@/features/search/specialityBookingEntry";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { 
  BookOpen,
  CheckCircle2, 
  Link as LinkIcon, 
  ArrowUpRight, 
  Calendar, 
  Check,
  UserCheck,
  Share2,
  Video,
  HeartPulse
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import { getArticleDetailData, ArticleDetailData, ArticleItem, ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import MoreFromOurBlogCarousel from "@/components/blog/MoreFromOurBlogCarousel";
import BlogLanguageChanger from "@/components/blog/BlogLanguageChanger";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalReviewedBySection, {
  ClinicalSummaryBanner,
  ClinicalEditorialFigures,
} from "@/components/ui/ClinicalReviewedBySection";
import { NearbySpecialistsCarousel } from "@/components/ui/NearbyClinicalCarousels";
import ShareWidget from "@/components/ui/ShareWidget";
import ContactCareSidebarCard from "@/components/ui/ContactCareSidebarCard";
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

  // V2: Scroll-driven section colour transition (#060c18 -> #020408 -> #f4f7fb -> #ffffff)
  const v4Progress = useMotionValue(0);

  useEffect(() => {
    const updateV4Transition = () => {
      const sy = window.scrollY || 0;
      const startScroll = 36;
      const endScroll = 360;
      const raw = (sy - startScroll) / (endScroll - startScroll);
      const clamped = Math.max(0, Math.min(1, raw));
      v4Progress.set(clamped);
      setIsScrolled(sy > 300);
    };

    updateV4Transition();
    window.addEventListener("scroll", updateV4Transition, { passive: true });
    window.addEventListener("resize", updateV4Transition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateV4Transition);
      window.removeEventListener("resize", updateV4Transition);
    };
  }, [v4Progress]);

  const heroCanvasOpacity = useTransform(v4Progress, [0, 0.38, 0.68], [1, 0.75, 0]);
  const heroStatNumColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]
  );
  const heroStatLabelColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.50)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]
  );
  const heroStatDividerColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]
  );

  const v2BgColor = useTransform(
    v4Progress,
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );
  const v2HeadingColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["#ffffff", "#ffffff", "#0f172a", "#0f172a"]
  );
  const v2SubtitleColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.76)", "rgba(255, 255, 255, 0.82)", "#475569", "#64748b"]
  );
  const v2BodyColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.84)", "rgba(255, 255, 255, 0.86)", "#334155", "#374151"]
  );
  const v2MutedColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.62)", "rgba(255, 255, 255, 0.68)", "#64748b", "#64748b"]
  );
  const v2TocLinkColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.78)", "rgba(255, 255, 255, 0.82)", "#475569", "#4b5563"]
  );
  const v2TocActiveColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["#38bdf8", "#38bdf8", "#034EA2", "#034EA2"]
  );
  const v2TocActiveBg = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.16)", "rgba(3, 78, 162, 0.08)", "rgba(3, 78, 162, 0.08)"]
  );
  const v2BorderColor = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.16)", "rgba(15, 23, 42, 0.09)", "rgba(15, 23, 42, 0.08)"]
  );
  const v2CardBg = useTransform(
    v4Progress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.10)", "#f8fafc", "#f8fafc"]
  );

  // Exact 3 in-article cards matching Screenshot 3
  const inArticleMorePosts = React.useMemo(() => {
    const preferredSlugs = [
      "cough-syrup-for-kids-parents-guide",
      "what-indias-nfhs-6-survey-reveals",
      "sugar-free-sweets-for-diabetics",
    ];

    const matched = preferredSlugs
      .filter((s) => s !== detail.slug)
      .map((s) => ARTICLES_DIRECTORY_DATA.find((a) => a.slug === s))
      .filter(Boolean) as ArticleItem[];

    if (matched.length < 3) {
      const remaining = ARTICLES_DIRECTORY_DATA.filter(
        (a) => a.slug !== detail.slug && !matched.some((m) => m.slug === a.slug)
      );
      return [...matched, ...remaining].slice(0, 3);
    }

    return matched.slice(0, 3);
  }, [detail.slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

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

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: detail.title,
          text: detail.summary,
          url: window.location.href,
        });
      } catch {
        // User dismissed
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2400);
    }
  };

  return (
    <motion.div
      className={styles.detailPageContainer}
      style={
        {
          backgroundColor: v2BgColor,
          "--v2-bg": v2BgColor,
          "--v2-heading": v2HeadingColor,
          "--v2-subtitle": v2SubtitleColor,
          "--v2-body": v2BodyColor,
          "--v2-muted": v2MutedColor,
          "--v2-toc-link": v2TocLinkColor,
          "--v2-toc-active": v2TocActiveColor,
          "--v2-toc-active-bg": v2TocActiveBg,
          "--v2-border": v2BorderColor,
          "--v2-card-bg": v2CardBg,
          "--hero-bottom-bg": v2BgColor,
          "--stat-num-color": heroStatNumColor,
          "--stat-label-color": heroStatLabelColor,
          "--stat-divider-color": heroStatDividerColor,
        } as unknown as React.CSSProperties
      }
    >
      {/* ─── STATIONARY ATMOSPHERIC CANVAS ─────────────────────────────────── */}
      <motion.div
        className={styles.stationaryCanvas}
        aria-hidden="true"
        style={{ opacity: heroCanvasOpacity }}
      >
        <motion.div
          className={styles.stationaryMotionWrapper}
          initial={{ scale: 1.12, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
      </motion.div>

      {/* ─── DETAIL HERO ──────────────────────────────────────────────────── */}
      <section className={`${styles.detailHero} ${styles.detailHeroV2}`} data-nav-theme="dark">
        <motion.div className={styles.heroBgOverlay} style={{ opacity: heroCanvasOpacity }} />

        <div className={styles.heroInner}>
          {/* Top Utility Bar: Breadcrumbs on Left, Language Changer on Right (Matching OG Blog) */}
          <motion.div 
            className={styles.topUtilityRow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.breadcrumbsWrapper}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog", href: "/blog" },
                  { label: detail.title },
                ]}
                theme="dark"
              />
            </div>

            <BlogLanguageChanger theme="dark" />
          </motion.div>

          <motion.div 
            className={styles.heroLeftCol}
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.heroEyebrow}>
              {detail.category}
            </div>

            <h1 className={styles.heroMainTitle} style={{ marginBottom: "8px" }}>
              {detail.title}
            </h1>

            {/* Author Attribution */}
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
                href={specialityBookingEntry(detail.categorySlug)}
                className={styles.heroPrimaryBtn}
              >
                <Calendar size={15} />
                <span>Consult Specialist</span>
                <ArrowUpRight size={14} className={styles.btnArrow} />
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className={styles.heroPhoneText}
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <Share2 size={14} className={styles.phoneIcon} />
                <span>{copyToast ? "Link Copied!" : "Share Article"}</span>
              </button>
            </div>
          </motion.div>

          {/* Bottom Metrics Row (Below Title, Author & CTA - Matching CSR Hero) */}
          <motion.div 
            className={styles.metricsBottomWrap}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.statsGrid}>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="100%" />
                </span>
                <span className={styles.statLabel}>Doctor Authored</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="Peer Reviewed" />
                </span>
                <span className={styles.statLabel}>Medical Advisory</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value={detail.readTime} />
                </span>
                <span className={styles.statLabel}>Estimated Reading</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value={detail.publishedDate} />
                </span>
                <span className={styles.statLabel}>Last Medical Review</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY (V2 SCROLL-DRIVEN DYNAMIC CANVAS) ──────────────────── */}
      <motion.div
        className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}
        style={{ backgroundColor: v2BgColor }}
      >
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
                                const isMobileView = typeof window !== "undefined" && window.innerWidth <= 960;
                                const yOffset = isMobileView ? -112 : -88;
                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: "smooth" });
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

              {/* Mobile Persistent Share Pill inside sticky header */}
              <button
                type="button"
                className={styles.mobileStickyShareBtn}
                onClick={handleShare}
                aria-label="Share this article"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>

              {/* Standardized Share widget */}
              <ShareWidget shareTitle={detail.title} title="Share this Article" />

              {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
              <ContactCareSidebarCard 
                subtitle={`Have questions on ${detail.category}? Speak to our clinical coordinators for specialist consultations.`}
              />
            </aside>

            {/* Reading Content Focus Canvas */}
            <div className={styles.contentFocusCanvas}>
              {/* SECTION: Overview & 4-5 Line Clinical Summary */}
              <section id="overview" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Overview &amp; Clinical Background</h2>
                <ClinicalSummaryBanner
                  eyebrow={`${detail.category} · Article Summary`}
                  summary={`${detail.summary} ${detail.overview}`}
                  reviewerName={detail.author}
                />
              </section>

              {/* SECTION: Key Takeaways (Clean cohesive checklist box) */}
              <section id="key-takeaways" className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>Doctor&apos;s Key Takeaways</h2>
                <p className={styles.sectionLeadText}>
                  Essential medical advice summarized by our clinical panel for everyday health management:
                </p>
                <div className={styles.takeawaysBox}>
                  {detail.keyTakeaways.map((point, idx) => (
                    <div key={idx} className={styles.takeawayItem}>
                      <CheckCircle2 size={18} className={styles.takeawayIcon} />
                      <span className={styles.takeawayText}>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: In-Depth Sections (Natural reading typography + rich clinical demo images) */}
              {detail.sections.map((sec, idx) => (
                <section key={idx} id={`section-${idx + 1}`} className={styles.contentSection}>
                  <h2 className={styles.sectionHeading}>{sec.heading}</h2>
                  <p className={styles.editorialBodyParagraph}>
                    {sec.body}
                  </p>
                  {idx === 0 && (
                    <ClinicalEditorialFigures
                      items={[
                        {
                          src: detail.heroImage || "/images/procedures/procedure_surgery.png",
                          alt: `${detail.title} clinical illustration`,
                          caption: `Clinical Perspective · ${detail.category} Care at Narayana Health`,
                        },
                        {
                          src: "/images/procedures/procedure_mri.png",
                          alt: `${detail.category} diagnostic screening`,
                          caption: `Evidence-Based Screening & Early Preventive Diagnostics`,
                        },
                      ]}
                    />
                  )}
                </section>
              ))}

              {/* SECTION: Dedicated Google E-E-A-T "Reviewed by Dr. ___" Section */}
              <ClinicalReviewedBySection
                doctorName={detail.author}
                doctorRole={detail.authorRole}
                speciality={detail.category}
                hospital={detail.doctors[0]?.hospital || "Narayana Health City, Bengaluru"}
                experience={detail.doctors[0]?.experience || "18+ Years Experience"}
                doctorImage={detail.authorAvatar}
                reviewDate={detail.publishedDate}
              />

              {/* SECTION: Consult Specialists Carousel (Modular & Softened Gradient) */}
              <NearbySpecialistsCarousel
                id="specialists"
                title={`Consult Leading ${detail.category} Specialists`}
                subtitle="Connect in-person or via video consultation with Narayana Health senior consultants:"
                doctors={detail.doctors}
                specialityFilter={detail.categorySlug}
                actionLabel="Book"
              />

              {/* SECTION: More from Narayana Health (Signature NH Cards: Full Image + Scrim + Text Overlay) */}
              <section id="more-from-nh" className={styles.moreFromNhSection}>
                <h2 className={styles.moreFromNhTitle}>More from Narayana Health</h2>
                <div className={styles.moreFromNhGrid}>
                  {inArticleMorePosts.map((art) => (
                    <Link
                      key={art.id}
                      href={`/blog/${art.slug}`}
                      className={styles.moreFromNhCard}
                    >
                      <Image
                        src={art.image || "/images/articles/sugar_free_sweets_diwali.jpg"}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 960px) 45vw, 300px"
                        className={styles.moreFromNhBgImage}
                      />
                      <div className={styles.moreFromNhScrim} />
                      <div className={styles.moreFromNhTextWrap}>
                        <span className={styles.moreFromNhCategory}>{art.category}</span>
                        <div className={styles.moreFromNhTitleRow}>
                          <h3 className={styles.moreFromNhItemTitle}>{art.title}</h3>
                          <ArrowUpRight size={17} className={styles.moreFromNhArrow} />
                        </div>
                        <div className={styles.moreFromNhMetaRow}>
                          <div className={styles.moreFromNhAuthorRow}>
                            <span className={styles.moreFromNhAuthorBadge}>NH</span>
                            <span className={styles.moreFromNhAuthorName}>{art.author || "Narayana Health"}</span>
                          </div>
                          <span className={styles.moreFromNhDate}>{art.publishedDate}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* SECTION: Related Articles Anchor */}
              <div id="related" />
            </div>
          </div>
        </main>
      </motion.div>

      {/* FULL-WIDTH SECTION: More from Our Blog (Cards in Our Procedure Style + Controls) */}
      <MoreFromOurBlogCarousel
        articles={detail.relatedArticles}
        title="More from Our Blog"
        subtitle="Explore more doctor-curated guides, symptom breakthroughs, and evidence-based clinical insights"
      />

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner />

      {/* Unified Clinical FAB (Book Consultation, Contact Support, Ask Pulse) */}
      <ClinicalFloatingSideActions
        consultHref={specialityBookingEntry(detail.categorySlug)}
        consultLabel={"Book\nOPD"}
        conditionTitle={detail.title}
        pulseQuery={`I want to learn more about "${detail.title}": clinical advice, diagnosis, and treatment options.`}
        isScrolled={isScrolled}
      />
    </motion.div>
  );
}
