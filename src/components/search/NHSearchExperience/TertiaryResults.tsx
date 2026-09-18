"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, Heart, Activity, Stethoscope, FileText, AlertCircle, BookOpen,
  Bone, Scan 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { TreatmentItemData, ArticleItemData } from "./searchData";

interface TertiaryResultsProps {
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
}

export default function TertiaryResults({
  treatments,
  articles,
}: TertiaryResultsProps) {
  // Icon renderer for treatments (neutral with restrained accents)
  const renderTreatmentIcon = (type: TreatmentItemData["iconType"]) => {
    switch (type) {
      case "heart":
        return <Heart size={14} />;
      case "activity":
        return <Activity size={14} />;
      case "angiography":
        return <Heart size={14} color="#ED1C24" style={{ opacity: 0.85 }} />;
      case "joint":
        return <Bone size={14} />;
      case "xray":
        return <Scan size={14} />;
      case "stethoscope":
      default:
        return <Stethoscope size={14} />;
    }
  };

  // Icon renderer for articles (neutral with restrained accents)
  const renderArticleIcon = (type: ArticleItemData["iconType"]) => {
    switch (type) {
      case "emergency":
        return <AlertCircle size={14} color="#ED1C24" style={{ opacity: 0.85 }} />;
      case "article":
        return <BookOpen size={14} />;
      case "document":
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <div className={styles.resultsRightCol} aria-label="Tertiary supporting results">
      {/* Treatments & Procedures Section */}
      <div className={styles.tertiarySectionBlock}>
        <div className={styles.sectionHeadingRow}>
          <span className={styles.tertiarySectionTitle}>Treatments & procedures</span>
        </div>

        <div className={styles.tertiaryListRows}>
          {treatments.map((t) => (
            <Link
              key={t.id}
              href={`/search?q=${encodeURIComponent(t.title)}`}
              className={styles.tertiaryListRow}
            >
              <div className={styles.tertiaryRowLeft}>
                <span className={styles.tertiaryRowIcon}>
                  {renderTreatmentIcon(t.iconType)}
                </span>
                <div className={styles.tertiaryRowMeta}>
                  <div className={styles.tertiaryRowTitle}>{t.title}</div>
                  <div className={styles.tertiaryRowSubtitle}>{t.subtitle}</div>
                </div>
              </div>
              <ArrowRight size={12} className={styles.tertiaryRowArrow} />
            </Link>
          ))}
        </div>
      </div>

      {/* Related Articles Section */}
      <div className={styles.tertiarySectionBlock}>
        <div className={styles.sectionHeadingRow}>
          <span className={styles.tertiarySectionTitle}>Related articles</span>
          <Link href="/search?tab=articles" className={styles.viewAllSmallLink}>
            View all →
          </Link>
        </div>

        <div className={styles.tertiaryListRows}>
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/search?q=${encodeURIComponent(art.title)}`}
              className={styles.tertiaryListRow}
            >
              <div className={styles.tertiaryRowLeft}>
                <span className={styles.tertiaryRowIcon}>
                  {renderArticleIcon(art.iconType)}
                </span>
                <div className={styles.tertiaryRowMeta}>
                  <div className={styles.tertiaryRowTitle}>{art.title}</div>
                  <div className={styles.tertiaryRowSubtitle}>
                    {art.readTime} · {art.category}
                  </div>
                </div>
              </div>
              <ArrowRight size={12} className={styles.tertiaryRowArrow} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
