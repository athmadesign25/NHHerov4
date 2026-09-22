"use client";

import React from "react";
import Link from "next/link";
import { 
  Heart, Activity, ChevronRight, BookOpen, AlertCircle, Shield 
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
  // Icon renderer for treatments (mono with subtle opacity)
  const renderTreatmentIcon = (type: TreatmentItemData["iconType"]) => {
    switch (type) {
      case "heart":
        return <Heart size={16} className={styles.editorialIconMono} />;
      case "activity":
        return <Activity size={16} className={styles.editorialIconMono} />;
      case "angiography":
        return <Heart size={16} className={styles.editorialIconMono} />;
      default:
        return <Heart size={16} className={styles.editorialIconMono} />;
    }
  };

  // Icon renderer for articles (matching Figma: BookOpen, AlertCircle, Shield)
  const renderArticleIcon = (type: ArticleItemData["iconType"], index: number) => {
    if (index === 0) {
      return <BookOpen size={15} className={styles.editorialIconMono} />;
    }
    if (index === 1) {
      return <AlertCircle size={15} className={styles.editorialIconMono} />;
    }
    return <Shield size={15} className={styles.editorialIconMono} />;
  };

  return (
    <div className={styles.resultsRightCol} aria-label="Supporting discovery and editorial care">
      {/* 1. Treatments & Procedures Section */}
      <div className={styles.editorialSection}>
        <div className={styles.editorialHeadingRow}>
          <span className={styles.sectionEyebrowTitle}>TREATMENTS & PROCEDURES</span>
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

        {/* View all link matching design */}
        <Link
          href="/treatments"
          className={styles.editorialViewMoreLink}
        >
          <span>View all →</span>
        </Link>
      </div>

      {/* 2. Related Articles Section */}
      <div className={styles.editorialSection}>
        <div className={styles.editorialHeadingRow}>
          <span className={styles.sectionEyebrowTitle}>RELATED ARTICLES</span>
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
                    {art.readTime} • {art.category}
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className={styles.editorialChevron} />
            </Link>
          ))}
        </div>

        {/* View all link matching design */}
        <Link
          href="/articles"
          className={styles.editorialViewMoreLink}
        >
          <span>View all →</span>
        </Link>
      </div>

      {/* 3. Related Specialties & Care Section */}
      {relatedSpecialties.length > 0 && (
        <div className={styles.editorialSection}>
          <div className={styles.editorialHeadingRow}>
            <span className={styles.sectionEyebrowTitle}>RELATED SPECIALTIES & CARE</span>
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
