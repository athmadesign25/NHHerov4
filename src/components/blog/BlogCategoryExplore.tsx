"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight, ArrowDownAZ, RotateCcw, Calendar } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CardTitleText, buildCardHoverReading } from "@/components/ui/CardTitleText";
import OrganSystemChipsCarousel from "@/components/ui/OrganSystemChipsCarousel";
import RewriteHeadingText from "@/components/ui/RewriteHeadingText";
import { LIBRARY_WHITE_PAGE_VARS } from "@/lib/useHeroShrink";
import { ArticleItem } from "@/data/articlesDirectoryData";
import styles from "./BlogCategoryExplore.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface CategoryPill {
  id: string;
  name: string;
  icon: string;
  slugMatch: string[];
}

export const BLOG_CATEGORY_PILLS: CategoryPill[] = [
  { id: "all", name: "All", icon: "/Specialities icons/General Surgery.svg", slugMatch: [] },
  { id: "cardiology", name: "Cardiology", icon: "/Specialities icons/Cardiology.svg", slugMatch: ["cardiology"] },
  { id: "gastrology", name: "Gastrology", icon: "/Specialities icons/Gastro.svg", slugMatch: ["gastroenterology", "gastrology"] },
  { id: "nephrology", name: "Nephrology", icon: "/Specialities icons/Nephrology.svg", slugMatch: ["nephrology", "renal"] },
  { id: "neurology", name: "Neurology", icon: "/Specialities icons/Neurology.svg", slugMatch: ["neurology", "neuro"] },
  { id: "oncology", name: "Oncology", icon: "/Specialities icons/Cancercare.svg", slugMatch: ["oncology", "cancer"] },
  { id: "orthopaedics", name: "Orthopaedics", icon: "/Specialities icons/Orthopaedics.svg", slugMatch: ["orthopaedics", "orthopedics", "rheumatology"] },
  { id: "pediatric", name: "Pediatric", icon: "/Specialities icons/Paedratic.svg", slugMatch: ["paediatrics", "pediatric"] },
  { id: "urology", name: "Urology", icon: "/Specialities icons/Urology.svg", slugMatch: ["urology"] },
  { id: "diabetes", name: "Diabetes", icon: "/Specialities icons/Diabetology.svg", slugMatch: ["endocrinology", "diabetes"] },
];

const CATEGORIES: CategoryPill[] = BLOG_CATEGORY_PILLS;

interface BlogCategoryExploreProps {
  articles: ArticleItem[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedLetter?: string | null;
  onSelectLetter?: (letter: string | null) => void;
}

export default function BlogCategoryExplore({
  articles,
  selectedCategory: controlledCategory,
  onSelectCategory,
  searchQuery: controlledSearchQuery,
  onSearchChange,
  selectedLetter: controlledLetter,
  onSelectLetter,
}: BlogCategoryExploreProps) {
  const [internalCategory, setInternalCategory] = useState<string>("all");
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "visited" | "relevant">("latest");
  const [internalLetter, setInternalLetter] = useState<string | null>(null);
  const [isAlphaOpen, setIsAlphaOpen] = useState<boolean>(false);

  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const setSelectedCategory = onSelectCategory ?? setInternalCategory;
  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange ?? setInternalSearchQuery;
  const selectedLetter = controlledLetter !== undefined ? controlledLetter : internalLetter;
  const setSelectedLetter = onSelectLetter ?? setInternalLetter;

  const blogOrganOptions = useMemo(
    () =>
      CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
        label: c.name,
        shortLabel: c.name,
        value: c.id,
        image: c.icon,
      })),
    []
  );

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    // Filter by Category
    if (selectedCategory !== "all") {
      const catConfig = CATEGORIES.find((c) => c.id === selectedCategory);
      if (catConfig && catConfig.slugMatch.length > 0) {
        list = list.filter((art) => {
          const artSlug = art.categorySlug.toLowerCase();
          const artCat = art.category.toLowerCase();
          return catConfig.slugMatch.some(
            (match) => artSlug.includes(match) || artCat.includes(match)
          );
        });
      }
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((art) => {
        return (
          art.title.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.author.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q)
        );
      });
    }

    // Filter by Alphabetical Letter
    if (selectedLetter) {
      list = list.filter((art) => art.title.toUpperCase().startsWith(selectedLetter));
    }

    // Sort: Latest, Most Visited, Most Relevant
    if (sortBy === "visited") {
      list = list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (sortBy === "relevant") {
      list = list.sort((a, b) => b.keyTakeaways.length - a.keyTakeaways.length);
    }

    return list;
  }, [articles, selectedCategory, searchQuery, sortBy, selectedLetter]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((art) => {
      const char = art.title[0]?.toUpperCase();
      if (char >= "A" && char <= "Z") {
        set.add(char);
      }
    });
    return set;
  }, [articles]);

  const sortTabs = [
    { id: "latest", label: "Latest" },
    { id: "visited", label: "Most Visited" },
    { id: "relevant", label: "Most Relevant" },
  ] as const;

  const activeCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null;
    return CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? null;
  }, [selectedCategory]);

  const dynamicHeadingText = useMemo(() => {
    const base = activeCategoryName ? `${activeCategoryName} Health Articles` : "All Health Articles";
    if (searchQuery.trim() && selectedLetter) {
      return `${base} Matching “${searchQuery.trim()}” (Starting with ‘${selectedLetter}’)`;
    }
    if (searchQuery.trim()) {
      return `${base} Matching “${searchQuery.trim()}”`;
    }
    if (selectedLetter) {
      return `${base} Starting with ‘${selectedLetter}’`;
    }
    return base;
  }, [activeCategoryName, searchQuery, selectedLetter]);

  const hasAnyActiveFilter = Boolean(
    selectedCategory !== "all" || searchQuery.trim() || selectedLetter || sortBy !== "latest"
  );

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedLetter(null);
    setSortBy("latest");
    setIsAlphaOpen(false);
  };

  // Generate Author badge text
  const getAuthorInitials = (author: string) => {
    if (author.toLowerCase().includes("narayana health")) return "NH";
    const parts = author.replace(/^Dr\.\s*/i, "").trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return author.slice(0, 2).toUpperCase();
  };

  return (
    <section
      className={styles.exploreSection}
      style={LIBRARY_WHITE_PAGE_VARS}
      data-nav-theme="light"
      id="explore-categories"
    >
      <div className={styles.container}>
        {/* Section Header (Centered with Dynamic TextSweepEffect) */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TextSweepEffect
              words={["Explore By Category"]}
              sweepMs={1400}
              finalColor="#0f172a"
            />
          </h2>
          <p className={styles.sectionSubtitle}>
            Here are a few categories of blogs that you can explore
          </p>
        </div>

        {/* Centered Search + Browse A–Z Pill */}
        <div className={styles.centeredDiscoveryWrap}>
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="search"
                placeholder="Search by topic, disease, treatment or doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search articles"
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

            <button
              type="button"
              className={`${styles.alphaTriggerBtn} ${
                selectedLetter || isAlphaOpen ? styles.alphaTriggerBtnActive : ""
              }`}
              onClick={() => setIsAlphaOpen((prev) => !prev)}
              aria-expanded={isAlphaOpen || Boolean(selectedLetter)}
              title="Filter articles by starting letter (A–Z)"
            >
              <span className={styles.alphaSolidBadge} aria-hidden="true">
                <ArrowDownAZ size={14} strokeWidth={2.4} />
              </span>
              <span>{selectedLetter ? `A–Z · ${selectedLetter}` : "Browse A–Z"}</span>
              {selectedLetter && (
                <X
                  size={13}
                  strokeWidth={2.3}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLetter(null);
                  }}
                />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {(isAlphaOpen || Boolean(selectedLetter)) && (
              <motion.div
                className={styles.alphaDrawerWrap}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className={styles.typoAlphaRail} role="toolbar" aria-label="A to Z alphabetical jump">
                  <button
                    type="button"
                    className={`${styles.typoAlphaBtn} ${selectedLetter === null ? styles.typoAlphaBtnActive : ""}`}
                    onClick={() => setSelectedLetter(null)}
                  >
                    All
                  </button>
                  {ALPHABET.map((char) => {
                    const isAvail = availableLetters.has(char);
                    const isSel = selectedLetter === char;
                    return (
                      <button
                        key={char}
                        type="button"
                        disabled={!isAvail}
                        className={`${styles.typoAlphaBtn} ${isSel ? styles.typoAlphaBtnActive : ""} ${
                          !isAvail ? styles.typoAlphaBtnDisabled : ""
                        }`}
                        onClick={() => setSelectedLetter(isSel ? null : char)}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Centered Unified Circular Category Filters (Red Highlight Style) */}
        <OrganSystemChipsCarousel
          variant="circle"
          showHeader={false}
          showAllOption
          centered
          options={blogOrganOptions}
          selectedOrgan={selectedCategory === "all" ? null : selectedCategory}
          onSelectOrgan={(val) => setSelectedCategory(val ?? "all")}
        />

        {/* Sentinel marking where in-flow category filters exit header (for sticky search+pills handoff) */}
        <div id="blog-filters-exit-sentinel" style={{ height: 1, width: "100%", pointerEvents: "none" }} aria-hidden="true" />

        {/* Centered Sort Chips Row */}
        <div className={styles.centeredSortRow} role="tablist" aria-label="Sort blog articles">
          {sortTabs.map((tab) => {
            const isActive = sortBy === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.sortChipBtn} ${isActive ? styles.sortChipBtnActive : ""}`}
                onClick={() => setSortBy(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Dynamic Header + Reset Filters CTA on the Right */}
        <div className={styles.dynamicHeadingRow}>
          <h3 className={styles.dynamicResultsTitle}>
            <RewriteHeadingText text={dynamicHeadingText} />{" "}
            <span className={styles.dynamicResultsCount}>({filteredArticles.length})</span>
          </h3>

          <AnimatePresence>
            {hasAnyActiveFilter && (
              <motion.button
                key="blog-reset-filters-cta"
                type="button"
                className={styles.resetHeaderBtn}
                onClick={handleResetFilters}
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

        {/* 3-Column Card Grid (Matching Our Standard Card Structure) */}
        {filteredArticles.length > 0 ? (
          <div className={styles.cardsGrid}>
            {filteredArticles.map((article, idx) => {
              const initials = getAuthorInitials(article.author);
              const isNH = initials === "NH";

              return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                  className={styles.blogCard}
                >
                  <div className={styles.cardLink}>
                    {/* Top Right Date Badge */}
                    <div className={styles.dateBadge}>
                      <span>{article.publishedDate}</span>
                    </div>

                    {/* Full Card Image Background */}
                    <Image
                      src={article.image || "/images/articles/blog_heart_health.png"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.cardBgImage}
                    />

                    {/* Atmospheric Gradient Scrim (Exact Figma "Image fade") */}
                    <div className={styles.cardGradient} />

                    {/* Bottom Card Content Layered On Gradient */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardTextGroup}>
                        <div className={styles.cardEyebrow}>
                          {article.category}
                        </div>

                        <Link href={`/blog/${article.slug}`} className={styles.cardTitleLink}>
                          <h3 className={styles.cardTitle} title={article.title}>
                            <CardTitleText title={article.title} />
                          </h3>
                        </Link>

                        <div className={styles.cardSubReveal}>
                          <div className={styles.cardSubInner}>
                            <p className={styles.cardSub}>
                              {buildCardHoverReading([
                                article.overview,
                                article.summary,
                                article.sections?.[0]?.body,
                              ])}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Slot: Resting (Author + Arrow) vs Hover Full CTA ("Read more") */}
                      <div className={styles.cardBottomSlot}>
                        <div className={styles.cardRestingBottom}>
                          <div className={styles.authorGroup}>
                            <div className={styles.authorBadge}>
                              {article.authorAvatar ? (
                                <Image
                                  src={article.authorAvatar}
                                  alt={article.author}
                                  width={24}
                                  height={24}
                                  className={styles.authorImg}
                                />
                              ) : (
                                <span className={styles.authorInitials}>{initials}</span>
                              )}
                            </div>
                            <span className={styles.authorName}>{article.author}</span>
                          </div>
                        </div>

                        <div className={styles.cardActions}>
                          <Link href={`/blog/${article.slug}`} className={styles.cardDetailBtn}>
                            <span>Read more</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className={styles.noResultsBox}>
            <p className={styles.noResultsTitle}>No matching articles found</p>
            <p className={styles.noResultsText}>
              Try adjusting your search query or selecting a different category from above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className={styles.resetBtn}
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

