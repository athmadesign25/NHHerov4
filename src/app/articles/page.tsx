"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Search, X } from "lucide-react";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import BlogHeroV3 from "@/components/blog/BlogHeroV3";
import BlogCategoryExplore, { BLOG_CATEGORY_PILLS } from "@/components/blog/BlogCategoryExplore";
import BlogMedicalExperts from "@/components/blog/BlogMedicalExperts";
import BlogBentoGrid from "@/components/blog/BlogBentoGrid";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import PinnedStickyShell from "@/components/ui/PinnedStickyShell";
import StickyBreadcrumbBar from "@/components/ui/StickyBreadcrumbBar";
import OrganSystemChipsCarousel from "@/components/ui/OrganSystemChipsCarousel";
import dockStyles from "@/components/ui/LibraryDiscoveryDock.module.css";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";

function ArticlesLibraryInner() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isStickyPinned, setIsStickyPinned] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const bentoTransitionRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);

  // Smoothly transition page canvas from dark hero -> pure white (Explore & Experts) -> dark (#060c18) when Bento enters
  const bentoDarkProgress = useMotionValue(0);
  const { progress: heroBlendProgress, pageMotionStyle } = useLibraryHeroBlendShrink();
  const combinedCanvasProgress = useTransform(
    [heroBlendProgress, bentoDarkProgress],
    ([topWhite, bottomDark]: number[]) => Math.max(0, Math.min(topWhite, 1 - bottomDark))
  );
  const dynamicPageBg = useTransform(
    combinedCanvasProgress,
    [0, 0.22, 0.65, 1],
    ["#060c18", "#0b1426", "#eef3f9", "#ffffff"]
  );

  const blogOrganOptions = useMemo(
    () =>
      BLOG_CATEGORY_PILLS.filter((c) => c.id !== "all").map((c) => ({
        label: c.name,
        shortLabel: c.name,
        value: c.id,
        image: c.icon,
      })),
    []
  );

  const activeCategoryLabel = useMemo(() => {
    if (selectedCategory === "all") return null;
    return BLOG_CATEGORY_PILLS.find((c) => c.id === selectedCategory)?.name ?? null;
  }, [selectedCategory]);

  useEffect(() => {
    const updateScroll = () => {
      const sy = window.scrollY || 0;
      setIsScrolled(sy > 300);

      const filterExitEl = document.getElementById("blog-filters-exit-sentinel");
      const filterExitTop = filterExitEl?.getBoundingClientRect().top ?? Infinity;
      const endTop = endSentinelRef.current?.getBoundingClientRect().top ?? Infinity;

      // Single clean slide-in once in-flow filters exit (consistent with LibraryDiscoveryDock)
      setIsStickyPinned(filterExitTop <= 92 && endTop > 220);

      const transitionEl = bentoTransitionRef.current;
      if (transitionEl) {
        const rect = transitionEl.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const startY = vh * 0.72;
        const endY = vh * 0.28;
        const raw = (startY - rect.top) / (startY - endY);
        bentoDarkProgress.set(Math.max(0, Math.min(1, raw)));
      } else {
        bentoDarkProgress.set(0);
      }
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [bentoDarkProgress]);

  return (
    <motion.main
      style={{
        minHeight: "100vh",
        overflowX: "clip",
        ...pageMotionStyle,
        backgroundColor: dynamicPageBg,
      }}
    >
      {/* ── SECTION 1: HERO (BLENDED DARK AT REST -> INSETS OVER WHITE ON SCROLL) ── */}
      <BlogHeroV3 />

      {/* ── PINNED TOP STICKY BAR (CONSISTENT UNIFIED DOCK SLIDE-IN) ── */}
      <PinnedStickyShell
        isPinned={isStickyPinned}
        motionKey="articles-sticky-dock"
      >
        <StickyBreadcrumbBar
          currentTitle="Health Articles & Guides"
          parentLabel="Health Library"
          activeFilterLabel={activeCategoryLabel}
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
                        placeholder="Search by topic, disease, treatment or doctor name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={dockStyles.searchInput}
                        aria-label="Search articles"
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
            options={blogOrganOptions}
            selectedOrgan={selectedCategory === "all" ? null : selectedCategory}
            onSelectOrgan={(val) => setSelectedCategory(val ?? "all")}
          />
        </div>
      </PinnedStickyShell>

      {/* ── SECTIONS 2, 3, 4 & 5: CLEAN WHITE CANVAS ── */}
      <div data-nav-theme="light">

        {/* ── SECTION 2: EXPLORE BY CATEGORY (Circle Category Select + 3-Col Cards Grid) ── */}
        <BlogCategoryExplore
          articles={ARTICLES_DIRECTORY_DATA}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
        />

        {/* ── SECTION 3: MEDICAL EXPERTS SECTION (Doctor Cards in refDoctorCard style) ── */}
        <BlogMedicalExperts scrollYProgress={bentoDarkProgress} />
      </div>

      {/* Sentinel between Medical Experts (light) and Bento Trust Grid (dark) */}
      <div ref={bentoTransitionRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

      {/* ── SECTIONS 4 & 5: DARK CANVAS STAGE WHEN BENTO ENTERS VIEWPORT ── */}
      <div data-nav-theme="dark">
        {/* ── SECTION 4: BENTO GRID SECTION (Why Trust Narayana Health Knowledge) ── */}
        <BlogBentoGrid scrollYProgress={bentoDarkProgress} />

        <div ref={endSentinelRef} style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

        {/* ── SECTION 5: CTA BANNER (Talk to a Specialist / Book Appointment) ── */}
        <BlogCtaBanner bg="transparent" />
      </div>

      {/* ── FLOATING CLINICAL SIDE ACTIONS (Book Consultation, Call, Ask Pulse AI) ── */}
      <ClinicalFloatingSideActions
        consultHref="/doctors"
        consultLabel={"Book\nConsultation"}
        conditionTitle="Health Guides"
        pulseQuery="I have questions about a recent symptom or want to know more about Narayana Health clinical guides."
        isScrolled={isScrolled}
      />
    </motion.main>
  );
}

export default function ArticlesLibraryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060c18" }} />}>
      <ArticlesLibraryInner />
    </Suspense>
  );
}
