"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Heart, Activity, FileText, ChevronRight 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { TreatmentItemData, ArticleItemData } from "./searchData";

interface TertiaryResultsProps {
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
  relatedSpecialties?: string[];
  onSelectSpecialtyTag?: (tag: string) => void;
}

export default function TertiaryResults({
  treatments,
  articles,
  relatedSpecialties = [],
  onSelectSpecialtyTag,
}: TertiaryResultsProps) {
  // Icon renderer for treatments (neutral with restrained cyan & red accents)
  const renderTreatmentIcon = (type: TreatmentItemData["iconType"]) => {
    switch (type) {
      case "heart":
        return <Heart size={15} className={styles.editorialIconCyan} />;
      case "activity":
        return <Activity size={15} className={styles.editorialIconCyan} />;
      case "angiography":
        return <Heart size={15} className={styles.editorialIconRed} />;
      default:
        return <Heart size={15} className={styles.editorialIconCyan} />;
    }
  };

  // Icon renderer for articles (clean editorial document / heart icons)
  const renderArticleIcon = (type: ArticleItemData["iconType"], index: number) => {
    if (index === 2 || type === "article") {
      return <Heart size={15} className={styles.editorialIconCyan} />;
    }
    return <FileText size={15} className={styles.editorialIconCyan} />;
  };

  return (
    <div className={styles.resultsRightCol} aria-label="Supporting discovery and editorial care">
      {/* 1. Treatments & Procedures Section */}
      <div className={styles.editorialSection}>
        <div className={styles.editorialHeadingRow}>
          <span className={styles.editorialTitle}>Treatments & procedures</span>
          <Link href="/treatments" className={styles.editorialViewAll}>
            <span>View all</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className={styles.editorialList}>
          {treatments.map((t) => (
            <Link
              key={t.id}
              href={`/search?q=${encodeURIComponent(t.title)}`}
              className={styles.editorialItem}
            >
              <div className={styles.editorialItemLeft}>
                <span className={styles.editorialIconBox}>
                  {renderTreatmentIcon(t.iconType)}
                </span>
                <div className={styles.editorialMeta}>
                  <div className={styles.editorialItemTitle}>{t.title}</div>
                  <div className={styles.editorialItemSub}>{t.subtitle}</div>
                </div>
              </div>
              <ChevronRight size={14} className={styles.editorialChevron} />
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Related Articles Section */}
      <div className={styles.editorialSection}>
        <div className={styles.editorialHeadingRow}>
          <span className={styles.editorialTitle}>Related articles</span>
          <Link href="/search?tab=articles" className={styles.editorialViewAll}>
            <span>View all</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className={styles.editorialList}>
          {articles.map((art, idx) => (
            <Link
              key={art.id}
              href={`/search?q=${encodeURIComponent(art.title)}`}
              className={styles.editorialItem}
            >
              <div className={styles.editorialItemLeft}>
                <span className={styles.editorialIconBox}>
                  {renderArticleIcon(art.iconType, idx)}
                </span>
                <div className={styles.editorialMeta}>
                  <div className={styles.editorialItemTitle}>{art.title}</div>
                  <div className={styles.editorialItemSub}>
                    {art.readTime} · {art.category}
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className={styles.editorialChevron} />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Related Specialties & Care Section */}
      {relatedSpecialties.length > 0 && (
        <div className={styles.editorialSection}>
          <div className={styles.editorialHeadingRow}>
            <span className={styles.editorialTitle}>Related specialties & care</span>
          </div>

          <div className={styles.editorialPillsGroup}>
            {relatedSpecialties.map((spec) => (
              <button
                key={spec}
                type="button"
                className={styles.editorialPill}
                onClick={() => onSelectSpecialtyTag?.(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

