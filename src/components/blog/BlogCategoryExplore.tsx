"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, ChevronRight, ArrowUpRight, ArrowRight } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { ArticleItem } from "@/data/articlesDirectoryData";
import styles from "./BlogCategoryExplore.module.css";

interface CategoryPill {
  id: string;
  name: string;
  icon: string;
  slugMatch: string[];
}

const CATEGORIES: CategoryPill[] = [
  { id: "all", name: "All Topics", icon: "/Specialities icons/General Surgery.jpeg", slugMatch: [] },
  { id: "cardiology", name: "Cardiology", icon: "/Specialities icons/Cardiology.jpeg", slugMatch: ["cardiology"] },
  { id: "gastrology", name: "Gastrology", icon: "/Specialities icons/Gastroenterology.jpeg", slugMatch: ["gastroenterology", "gastrology"] },
  { id: "nephrology", name: "Nephrology", icon: "/Specialities icons/Nephrology.jpeg", slugMatch: ["nephrology", "renal"] },
  { id: "neurology", name: "Neurology", icon: "/Specialities icons/Neurology.jpeg", slugMatch: ["neurology", "neuro"] },
  { id: "oncology", name: "Oncology", icon: "/Specialities icons/Cancer Care.jpeg", slugMatch: ["oncology", "cancer"] },
  { id: "orthopaedics", name: "Orthopaedics", icon: "/Specialities icons/Orthopedics.jpeg", slugMatch: ["orthopaedics", "orthopedics", "rheumatology"] },
  { id: "pediatric", name: "Pediatric", icon: "/Specialities icons/Paediatrics.jpeg", slugMatch: ["paediatrics", "pediatric"] },
  { id: "urology", name: "Urology", icon: "/Specialities icons/Urology.jpeg", slugMatch: ["urology"] },
  { id: "diabetes", name: "Diabetes", icon: "/Specialities icons/Endocrinology.jpeg", slugMatch: ["endocrinology", "diabetes"] },
];

interface BlogCategoryExploreProps {
  articles: ArticleItem[];
}

export default function BlogCategoryExplore({ articles }: BlogCategoryExploreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

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

    // Sort
    if (sortBy === "popular") {
      list = list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return list;
  }, [articles, selectedCategory, searchQuery, sortBy]);

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
    <section className={styles.exploreSection} data-nav-theme="light" id="explore-categories">
      <div className={styles.container}>
        {/* Section Header (Centered with Signature Color Gradient Title) */}
        <div className={styles.sectionHeader}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.gradientTitle}>Explore By Category</span>
          </motion.h2>
          <p className={styles.sectionSubtitle}>
            Here are a few categories of blogs that you can explore
          </p>
        </div>

        {/* Search Bar Centered ABOVE Filters */}
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
        </div>

        {/* Category Circle Selector Followed Below Search Bar */}
        <div className={styles.categoryCircleTrack}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryCircleBtn} ${isSelected ? styles.categoryCircleActive : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
              >
                <div className={styles.circleImageWrap}>
                  <Image
                    src={cat.icon}
                    alt={cat.name}
                    width={56}
                    height={56}
                    className={styles.circleImg}
                  />
                  {isSelected && <div className={styles.activeRing} />}
                </div>
                <span className={styles.circleLabel}>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Metadata & Sort Row */}
        <div className={styles.toolbarRow}>
          <div className={styles.countBadge}>
            <strong>{filteredArticles.length}</strong> articles found
          </div>

          <div className={styles.sortWrapper}>
            <label htmlFor="blog-sort" className={styles.srOnly}>
              Sort articles
            </label>
            <select
              id="blog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
              className={styles.sortSelect}
            >
              <option value="latest">Sort: Latest Published</option>
              <option value="popular">Sort: Most Popular</option>
            </select>
          </div>
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
                  <Link href={`/blog/${article.slug}`} className={styles.cardLink}>
                    {/* Full Card Image Background */}
                    <Image
                      src={article.image || "/images/articles/blog_heart_health.png"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.cardBgImage}
                    />

                    {/* Gradient Scrim Overlay */}
                    <div className={styles.cardOverlay} />

                    {/* Bottom Card Content Layered On Gradient */}
                    <div className={styles.cardTextContent}>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardCategory}>{article.category}</span>
                        <span className={styles.cardMetaDot}>•</span>
                        <span className={styles.cardDate}>{article.publishedDate}</span>
                      </div>

                      <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle} title={article.title}>
                          {article.title}
                        </h3>
                        <ArrowRight size={17} strokeWidth={2.5} className={styles.cardArrow} />
                      </div>

                      {/* Author Row */}
                      <div className={styles.cardAuthorRow}>
                        <div
                          className={`${styles.authorAvatarBadge} ${
                            isNH ? styles.authorAvatarNH : styles.authorAvatarDoc
                          }`}
                        >
                          {initials}
                        </div>
                        <span className={styles.authorName}>{article.author}</span>
                      </div>
                    </div>
                  </Link>
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
