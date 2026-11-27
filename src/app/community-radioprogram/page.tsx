"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryHeroBlendShrink, LIBRARY_WHITE_PAGE_VARS } from "@/lib/useHeroShrink";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  RotateCcw,
  Play,
  Pause,
  Clock,
  Radio,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Volume2,
  PhoneCall,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CardTitleText, buildCardHoverReading } from "@/components/ui/CardTitleText";
import OrganSystemChipsCarousel from "@/components/ui/OrganSystemChipsCarousel";
import PinnedStickyShell from "@/components/ui/PinnedStickyShell";
import RewriteHeadingText from "@/components/ui/RewriteHeadingText";
import StickyBreadcrumbBar, { HEALTH_LIBRARY_SIBLING_PAGES } from "@/components/ui/StickyBreadcrumbBar";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import dockStyles from "@/components/ui/LibraryDiscoveryDock.module.css";
import {
  COMMUNITY_RADIO_HERO,
  RADIO_CATEGORIES,
  RADIO_EPISODES,
  RadioEpisode,
  RADIO_BROADCASTERS,
} from "@/data/communityRadioData";
import styles from "./CommunityRadio.module.css";

const RADIO_SIBLING_PAGES = [
  {
    label: "CSR Overview",
    href: "/csr",
    description: "Narayana Health Foundation impact",
  },
  {
    label: "Community Radio Program",
    href: "/community-radioprogram",
    description: "Namma Naadi 90.4 FM broadcasts",
  },
  ...HEALTH_LIBRARY_SIBLING_PAGES,
];

export default function CommunityRadioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "listened" | "doctor">("latest");
  const [activeEpisode, setActiveEpisode] = useState<RadioEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isStickyPinned, setIsStickyPinned] = useState<boolean>(false);

  const radioFiltersExitRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

  // Carousel ref & scroll controls
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Blended dark landing above the fold -> hero shrinks over white & podcasts crossfade cleanly on scroll
  const { pageMotionStyle, heroMotionStyle, dynHeading, dynSubtitle } =
    useLibraryHeroBlendShrink();

  useEffect(() => {
    const updateScroll = () => {
      const sy = window.scrollY || 0;
      setIsScrolled(sy > 300);

      const filterExitTop = radioFiltersExitRef.current?.getBoundingClientRect().top ?? Infinity;
      const endTop = endSentinelRef.current?.getBoundingClientRect().top ?? Infinity;

      // Single clean slide-in once in-flow filters exit (consistent with LibraryDiscoveryDock)
      setIsStickyPinned(filterExitTop <= 92 && endTop > 220);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  // Featured episodes for carousel
  const featuredEpisodes = useMemo(() => {
    return RADIO_EPISODES.filter((ep) => ep.isFeatured || ep.listenCount.includes("42") || ep.listenCount.includes("38"));
  }, []);

  // Filtered episodes for category explore
  const filteredEpisodes = useMemo(() => {
    let list = [...RADIO_EPISODES];

    if (selectedCategory !== "all") {
      const catConfig = RADIO_CATEGORIES.find((c) => c.id === selectedCategory);
      if (catConfig && catConfig.slugMatch.length > 0) {
        list = list.filter((ep) => {
          const epSlug = ep.categorySlug.toLowerCase();
          const epCat = ep.category.toLowerCase();
          return catConfig.slugMatch.some(
            (match) => epSlug.includes(match) || epCat.includes(match)
          );
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((ep) => {
        return (
          ep.title.toLowerCase().includes(q) ||
          ep.doctor.toLowerCase().includes(q) ||
          ep.category.toLowerCase().includes(q) ||
          ep.summary.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "listened") {
      list.sort((a, b) => parseFloat(b.listenCount) - parseFloat(a.listenCount));
    } else if (sortBy === "doctor") {
      list.sort((a, b) => a.doctor.localeCompare(b.doctor));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const radioOrganOptions = useMemo(
    () =>
      RADIO_CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
        label: c.name,
        shortLabel: c.name,
        value: c.id,
        image: c.icon,
      })),
    []
  );

  const activeCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null;
    return RADIO_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? null;
  }, [selectedCategory]);

  const dynamicPodcastHeading = useMemo(() => {
    const base = activeCategoryName
      ? `${activeCategoryName} Podcasts & Broadcasts`
      : "All Podcasts & Broadcasts";
    if (searchQuery.trim()) {
      return `${base} Matching “${searchQuery.trim()}”`;
    }
    return base;
  }, [activeCategoryName, searchQuery]);

  const hasAnyRadioFilter = Boolean(
    selectedCategory !== "all" || searchQuery.trim() || sortBy !== "latest"
  );

  const handleResetRadioFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("latest");
  };

  // Carousel scroll functions
  const checkCarouselScroll = useCallback(() => {
    const el = carouselTrackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const handleCarouselScroll = (direction: "left" | "right") => {
    const el = carouselTrackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkCarouselScroll, 350);
  };

  // Play an episode in floating player
  const handlePlayEpisode = (episode: RadioEpisode) => {
    setActiveEpisode(episode);
    setIsPlaying(true);
  };

  return (
    <motion.main
      className={styles.pageMain}
      style={pageMotionStyle}
    >
      {/* ──────────────────────────────────────────────────────────────────
          1. HERO SECTION & FEATURED PODCASTS CAROUSEL (Blog V3 Parity)
          ────────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ position: "relative", overflowX: "clip" }}>
          <motion.section
            className={styles.heroSection}
            data-nav-theme="dark"
            style={heroMotionStyle}
          >
            <div className={styles.heroBg}>
              <Image
                src={COMMUNITY_RADIO_HERO.image}
                alt="Narayana Health Community Radio Broadcast"
                fill
                priority
                loading="eager"
                sizes="100vw"
                className={styles.heroBgImage}
              />
              <div className={styles.scrimOverlay} />
            </div>

          <div className={styles.heroInner}>
            <motion.div
              className={styles.heroLeftCol}
              initial={{ opacity: 0, scale: 0.97, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.breadcrumbsWrapper}>
                <Breadcrumbs
                  items={COMMUNITY_RADIO_HERO.breadcrumbs}
                  theme="dark"
                />
              </div>

              <h1 className={styles.heroTitle}>
                <TextSweepEffect
                  words={[COMMUNITY_RADIO_HERO.title]}
                  sweepMs={2400}
                  delayMs={80}
                  finalColor="#FFFFFF"
                />
              </h1>

              <p className={styles.heroSubtitle}>
                {COMMUNITY_RADIO_HERO.subtitle}
              </p>

              <div className={styles.actionRow}>
                <a
                  href="#featured-podcasts"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("featured-podcasts")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={styles.exploreBtn}
                >
                  <span>Explore More</span>
                </a>
              </div>

              <MobileRollingStats
                items={COMMUNITY_RADIO_HERO.stats.map((s) => ({
                  staticValue: s.value,
                  label: s.label,
                }))}
              />
            </motion.div>

            {/* Bottom Column: Horizontal Metrics Row (Matching CSR & Blog V3 Hero) */}
            <motion.div
              className={styles.metricsBottomWrap}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.statsGrid}>
                {COMMUNITY_RADIO_HERO.stats.map((stat, idx) => (
                  <div key={idx} className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      <RollingNumber value={stat.value} />
                    </span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </motion.section>
        </div>

        {/* ── SECTION 2: FEATURED & SUGGESTED PODCASTS CAROUSEL ── */}
        <div id="featured-podcasts" className={styles.featuredCarouselWrapper} data-nav-theme="light">
          <section className={styles.carouselSection}>
            <div className={styles.carouselContainer}>
              <div className={styles.carouselHeader}>
                <motion.h2
                  className={styles.carouselTitle}
                  style={{ color: dynHeading }}
                >
                  <TextSweepEffect
                    words={["Featured & Suggested Podcasts"]}
                    sweepMs={1600}
                    finalColor="var(--featured-title-color, #0f172a)"
                  />
                </motion.h2>
                <motion.p
                  className={styles.carouselSubtitle}
                  style={{ color: dynSubtitle }}
                >
                  Doctor-curated broadcasts, community pulse breakthroughs, and preventive audio insights
                </motion.p>
              </div>

              {/* Carousel Track with Universal Card Syntax */}
              <div className={styles.carouselTrackWrapper}>
                <div
                  ref={carouselTrackRef}
                  onScroll={checkCarouselScroll}
                  className={styles.carouselTrack}
                >
                  {featuredEpisodes.map((ep) => (
                    <div key={ep.id} className={styles.carouselCardItem}>
                      <article
                        className={styles.universalCard}
                        onClick={() => handlePlayEpisode(ep)}
                      >
                        <Image
                          src={ep.image}
                          alt={ep.title}
                          fill
                          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 32vw"
                          className={styles.cardBgImage}
                        />
                        <div className={styles.cardAtmosphericScrim} />
                        <span className={styles.cardCategoryEyebrow}>{ep.category}</span>
                        <span className={styles.cardMetaBadge}>
                          <Clock size={12} />
                          <span>{ep.duration}</span>
                        </span>

                        <div className={styles.cardContent}>
                          <h3 className={styles.cardTitle}>
                            <CardTitleText title={ep.title} />
                          </h3>
                          <div className={styles.cardSubReveal}>
                            <div className={styles.cardSubInner}>
                              <p className={styles.cardSub}>
                                {buildCardHoverReading([
                                  ep.summary,
                                  `Hosted by ${ep.doctor}, ${ep.doctorRole}`,
                                  `Broadcast in ${ep.language} · Duration: ${ep.duration} · Aired ${ep.airDate}`,
                                  `Over ${ep.listenCount} community listeners`,
                                ])}
                              </p>
                            </div>
                          </div>

                          {/* Dual-Slot Resting vs Hover Action Button */}
                          <div className={styles.cardBottomSlot}>
                            <div className={styles.cardRestingBottom}>
                              <div className={styles.authorGroup}>
                                <div className={styles.authorAvatar}>
                                  <Radio size={13} color="#ffffff" />
                                </div>
                                <span className={styles.authorNameText}>{ep.doctor}</span>
                              </div>
                              <ArrowUpRight size={18} className={styles.restingArrow} />
                            </div>

                            <div className={styles.cardActions}>
                              <button
                                type="button"
                                className={styles.hoverCtaButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayEpisode(ep);
                                }}
                              >
                                <Play size={13} style={{ fill: "currentColor" }} />
                                <span>Listen Now</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className={styles.carouselControlsRow}>
                <button
                  type="button"
                  onClick={() => handleCarouselScroll("left")}
                  disabled={!canScrollLeft}
                  className={styles.navArrowBtn}
                  aria-label="Previous podcasts"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCarouselScroll("right")}
                  disabled={!canScrollRight}
                  className={styles.navArrowBtn}
                  aria-label="Next podcasts"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── PINNED TOP STICKY BAR (CONSISTENT UNIFIED DOCK SLIDE-IN) ── */}
      <PinnedStickyShell
        isPinned={isStickyPinned}
        motionKey="radio-sticky-dock"
      >
        <StickyBreadcrumbBar
          currentTitle="Community Radio"
          parentLabel="About Narayana Health"
          activeFilterLabel={activeCategoryName}
          siblingPages={RADIO_SIBLING_PAGES}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <div className={dockStyles.stickyPanelInner}>
          <div className={dockStyles.filterBlockUnit}>
            <div className={dockStyles.topUnifiedBar}>
              <div className={dockStyles.searchContainer}>
                <div className={dockStyles.searchRow}>
                  <div className={dockStyles.searchBoxWrap}>
                    <div className={dockStyles.searchBox}>
                      <Search size={18} strokeWidth={2} className={dockStyles.searchIcon} />
                      <input
                        type="search"
                        placeholder="Search by topic, condition, show or doctor name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={dockStyles.searchInput}
                        aria-label="Search podcasts"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className={dockStyles.clearSearchBtn}
                          aria-label="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <OrganSystemChipsCarousel
            variant="mini-pills"
            showHeader={false}
            showAllOption
            className={dockStyles.mobileHideMiniPills}
            options={radioOrganOptions}
            selectedOrgan={selectedCategory === "all" ? null : selectedCategory}
            onSelectOrgan={(val) => setSelectedCategory(val ?? "all")}
          />
        </div>
      </PinnedStickyShell>

      {/* ── SECTIONS 2, 3, 4 & 5: DYNAMIC CONTENT CANVAS (White -> Dark for CTA Card) ── */}
      <div>
        {/* ──────────────────────────────────────────────────────────────────
            2. EXPLORE PODCASTS BY CATEGORY & LIBRARY (Universal Card Syntax)
            ────────────────────────────────────────────────────────────────── */}
        <section className={styles.exploreSection} id="explore-podcasts" style={LIBRARY_WHITE_PAGE_VARS}>
        <div className={styles.exploreContainer}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>
              <TextSweepEffect
                words={["Explore Podcasts by Category"]}
                sweepMs={1400}
                finalColor="#0f172a"
              />
            </h2>
            <p className={styles.sectionSubtitle}>
              Here are a few categories of doctor-led radio broadcasts and podcasts that you can explore
            </p>
          </div>

          {/* Centered Search Bar */}
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="search"
                placeholder="Search by topic, condition, show or doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search podcasts"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.clearSearchBtn}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Centered Unified Circular Category Selector (Same F5 Organ Style) */}
          <OrganSystemChipsCarousel
            variant="circle"
            showHeader={false}
            showAllOption
            centered
            options={radioOrganOptions}
            selectedOrgan={selectedCategory === "all" ? null : selectedCategory}
            onSelectOrgan={(val) => setSelectedCategory(val ?? "all")}
          />

          {/* Sentinel marking where in-flow category filters exit header (for sticky search+pills handoff) */}
          <div ref={radioFiltersExitRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

          {/* Centered Sort Chips Row */}
          <div className={styles.centeredSortRow} role="tablist" aria-label="Sort podcasts">
            <button
              type="button"
              role="tab"
              aria-selected={sortBy === "latest"}
              className={`${styles.sortChipBtn} ${sortBy === "latest" ? styles.sortChipBtnActive : ""}`}
              onClick={() => setSortBy("latest")}
            >
              Latest
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sortBy === "listened"}
              className={`${styles.sortChipBtn} ${sortBy === "listened" ? styles.sortChipBtnActive : ""}`}
              onClick={() => setSortBy("listened")}
            >
              Most Listened
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sortBy === "doctor"}
              className={`${styles.sortChipBtn} ${sortBy === "doctor" ? styles.sortChipBtnActive : ""}`}
              onClick={() => setSortBy("doctor")}
            >
              Doctor Talks
            </button>
          </div>

          {/* Animated Dynamic Header + Reset Filters CTA on the Right */}
          <div className={styles.dynamicHeadingRow}>
            <h3 className={styles.dynamicResultsTitle}>
              <RewriteHeadingText text={dynamicPodcastHeading} />{" "}
              <span className={styles.dynamicResultsCount}>({filteredEpisodes.length})</span>
            </h3>

            <AnimatePresence>
              {hasAnyRadioFilter && (
                <motion.button
                  key="radio-reset-filters-cta"
                  type="button"
                  className={styles.resetHeaderBtn}
                  onClick={handleResetRadioFilters}
                  initial={{ opacity: 0, scale: 0.94, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.94, x: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>Reset filters</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* 3-Column Episodes Grid (Universal Library Card Syntax) */}
          <div className={styles.episodesGrid}>
            {filteredEpisodes.map((ep) => (
              <article
                key={ep.id}
                className={styles.universalCard}
                onClick={() => handlePlayEpisode(ep)}
              >
                <Image
                  src={ep.image}
                  alt={ep.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.cardBgImage}
                />
                <div className={styles.cardAtmosphericScrim} />
                <span className={styles.cardCategoryEyebrow}>{ep.category}</span>
                <span className={styles.cardMetaBadge}>
                  <Clock size={11} />
                  <span>{ep.duration}</span>
                </span>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    <CardTitleText title={ep.title} />
                  </h3>
                  <div className={styles.cardSubReveal}>
                    <div className={styles.cardSubInner}>
                      <p className={styles.cardSub}>
                        {buildCardHoverReading([
                          ep.summary,
                          `Hosted by ${ep.doctor}, ${ep.doctorRole}`,
                          `Broadcast in ${ep.language} · Duration: ${ep.duration} · Aired ${ep.airDate}`,
                          `Over ${ep.listenCount} community listeners`,
                        ])}
                      </p>
                    </div>
                  </div>

                  {/* Dual-Slot Resting vs Hover Action Button */}
                  <div className={styles.cardBottomSlot}>
                    <div className={styles.cardRestingBottom}>
                      <div className={styles.authorGroup}>
                        <div className={styles.authorAvatar}>
                          <Radio size={13} color="#ffffff" />
                        </div>
                        <span className={styles.authorNameText}>{ep.doctor}</span>
                      </div>
                      <ArrowUpRight size={18} className={styles.restingArrow} />
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.hoverCtaButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayEpisode(ep);
                        }}
                      >
                        <Volume2 size={14} />
                        <span>Listen Episode</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. CLINICIAN BROADCASTERS (Centered Header + Exact refDoctorCard Standard)
          ────────────────────────────────────────────────────────────────── */}
      <section className={styles.expertsSection}>
        <div className={styles.expertsContainer}>
          {/* Centered Section Header */}
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>
              <TextSweepEffect
                words={["Radio Hosts & Clinician Broadcasters"]}
                sweepMs={1400}
                finalColor="#0f172a"
              />
            </h2>
            <p className={styles.sectionSubtitle}>
              Senior Narayana Health clinicians answering live patient calls and hosting weekly public health masterclasses
            </p>
          </div>

          {/* 4-Column Doctors Grid using Exact refDoctorCard Specification */}
          <div className={styles.doctorsGrid}>
            {RADIO_BROADCASTERS.map((doc, idx) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={styles.refDoctorCard}
              >
                <Image
                  src={doc.image}
                  alt={doc.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={styles.refDocFullImage}
                />
                <div className={styles.refDocFullGradient} />

                <div className={styles.refDocOverlayContent}>
                  <div className={styles.refDocBottomFlex}>
                    <div className={styles.refDocTextCol}>
                      <h3 className={styles.refDocName} title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className={styles.refDocSpecialty}>{doc.role}</div>
                      <div className={styles.refDocExpRow}>
                        <Award size={12} className={styles.refDocExpIcon} />
                        <span>{doc.experience}</span>
                      </div>
                      <div className={styles.refDocHospital} title={doc.hospital}>
                        {doc.hospital}
                      </div>
                    </div>

                    <Link href="/doctors" className={styles.refBookBtnWhite}>
                      Consult
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Centered Clickable Text CTA (Clean Text Only, No Button Frame) */}
          <div className={styles.centerActionWrap}>
            <Link href="/doctors" className={styles.viewAllTextLink}>
              <span>View All NH Doctors</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. WHY TUNE IN BENTO GRID (Centered Header + BlogBentoGrid Parity)
          ────────────────────────────────────────────────────────────────── */}
      <section className={styles.bentoSection}>
        <div className={styles.bentoContainer}>
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>
              <TextSweepEffect
                words={["Why Tune In to Namma Naadi 90.4 FM"]}
                sweepMs={1600}
                finalColor="#0f172a"
              />
            </h2>
            <p className={styles.sectionSubtitle}>
              World-class clinical expertise, verified healthcare protocols, and grassroots audio accessibility
            </p>
          </div>

          <div className={styles.bentoGrid}>
            {/* Large Card: 14 Hours Daily Airtime & Live Studio */}
            <div className={styles.bentoLargeCard}>
              <Image
                src="/images/csr/csr-community-radio.jpg"
                alt="Broadcast studio"
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                className={styles.bentoLargeBgImage}
              />
              <div className={styles.bentoLargeContent}>
                <span className={styles.bentoTag}>90.4 FM COMMUNITY FREQUENCY</span>
                <h3 className={styles.bentoLargeHeading}>
                  14 Hours of Daily Public Health Transmission across 400K+ Homes
                </h3>
                <p className={styles.bentoLargeDesc}>
                  Established in January 2017, Namma Naadi (&lsquo;Our Pulse&rsquo;) operates from NH Health City, broadcasting verified clinical knowledge, agrarian updates, and civic advisories across a 10–12 km radius in Anekal Taluk.
                </p>
              </div>
              <div className={styles.bentoLargeFooter}>
                <div>
                  <strong style={{ fontSize: "22px", color: "var(--white)", display: "block" }}>100%</strong>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Free-to-Air Public Radio</span>
                </div>
                <div>
                  <strong style={{ fontSize: "22px", color: "var(--white)", display: "block" }}>8,500+</strong>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Episodes Broadcasted</span>
                </div>
              </div>
            </div>

            {/* Small Card 1: 100% Doctor-Led Verification */}
            <div className={styles.bentoSmallCard}>
              <div className={styles.bentoSmallIcon}>
                <ShieldCheck size={22} />
              </div>
              <h3 className={styles.bentoSmallHeading}>100% Doctor-Led Clinical Advice</h3>
              <p className={styles.bentoSmallDesc}>
                Every broadcast is authored or co-hosted by board-certified Narayana Health clinicians, dispelling dangerous medical myths and superstitions.
              </p>
            </div>

            {/* Small Card 2: Free Call-in Telephone Consultations */}
            <div className={styles.bentoSmallCard}>
              <div className={styles.bentoSmallIcon}>
                <PhoneCall size={22} />
              </div>
              <h3 className={styles.bentoSmallHeading}>Live Call-In Patient Hotline</h3>
              <p className={styles.bentoSmallDesc}>
                Listeners dial in toll-free during live shows to ask specialist doctors about pediatric fevers, blood pressure, and emergency first aid.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div ref={endSentinelRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

      {/* ──────────────────────────────────────────────────────────────────
          5. PRE-FOOTER CTA BANNER (Universal Narayana Health Banner)
          ────────────────────────────────────────────────────────────────── */}
      <BlogCtaBanner bg="transparent" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          6. FLOATING MINI AUDIO PLAYER (Docked when active)
          ────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={styles.floatingPlayerBar}
          >
            <div className={styles.floatingPlayerLeft}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={styles.floatingPlayBtn}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
              </button>
              <div className={styles.floatingTrackInfo}>
                <p className={styles.floatingTrackTitle}>{activeEpisode.title}</p>
                <p className={styles.floatingTrackDoctor}>{activeEpisode.doctor} • {activeEpisode.duration}</p>
              </div>
            </div>

            <div className={styles.floatingPlayerRight}>
              <div className={styles.floatingWave}>
                <span className={styles.floatingWaveBar} />
                <span className={styles.floatingWaveBar} />
                <span className={styles.floatingWaveBar} />
                <span className={styles.floatingWaveBar} />
              </div>
              <a
                href={activeEpisode.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotifyBadgeLink}
                title="Open in Spotify"
              >
                <ExternalLink size={16} />
              </a>
              <button
                type="button"
                onClick={() => setActiveEpisode(null)}
                className={styles.closePlayerBtn}
                aria-label="Close player"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────
          7. CLINICAL FLOATING SIDE ACTIONS
          ────────────────────────────────────────────────────────────────── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Tune In\nOPD"}
        conditionTitle="Community Radio"
        pulseQuery="I have questions about Narayana Health's Namma Naadi 90.4 FM broadcasts, doctor podcast schedule, and preventive care programs."
        isScrolled={isScrolled && !activeEpisode}
      />
    </motion.main>
  );
}
