"use client";

import React from "react";
import Link from "next/link";
import { 
  Heart, Activity, ChevronRight, BookOpen, AlertCircle, Shield, ArrowRight 
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { TreatmentItemData, ArticleItemData } from "./searchData";

import PulseAIAvatar from "./PulseAIAvatar";

interface TertiaryResultsProps {
  treatments: TreatmentItemData[];
  articles: ArticleItemData[];
  relatedSpecialties?: string[];
  onSelectSpecialtyTag?: (tag: string) => void;
  onOpenPulse?: () => void;
  pulseRowRef?: React.RefObject<HTMLDivElement | null>;
  pulseRecommendationText?: string;
  query?: string;
}

export default function TertiaryResults({
  treatments,
  articles,
  relatedSpecialties = [],
  onSelectSpecialtyTag,
  query = "",
}: TertiaryResultsProps) {
  // Show 4 items per category and up to 3 rows of specialties
  const displayedTreatments = treatments.slice(0, 4);
  const displayedArticles = articles.slice(0, 4);
  const displayedSpecialties = relatedSpecialties.slice(0, 8);

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

  const hasTreatments = displayedTreatments.length > 0;
  const hasArticles = displayedArticles.length > 0;

  const defaultArticles: ArticleItemData[] = [
    {
      id: "a-guide-1",
      title: "When to seek emergency medical attention",
      readTime: "4 min read",
      category: "Emergency Care",
      iconType: "emergency",
    },
    {
      id: "a-guide-2",
      title: "Choosing the right specialist for your condition",
      readTime: "5 min read",
      category: "Patient Guide",
      iconType: "document",
    },
    {
      id: "a-guide-3",
      title: "Annual preventive health checkup packages",
      readTime: "6 min read",
      category: "Preventive Care",
      iconType: "article",
    },
  ];

  const effectiveArticles = hasArticles ? displayedArticles : defaultArticles;
  const effectiveSpecialties = displayedSpecialties.length > 0 
    ? displayedSpecialties 
    : ["Cardiology", "Orthopaedics", "Neurology", "Pediatrics", "Oncology", "Gastroenterology"];

  const treatmentsViewAllHref = `/search?tab=treatments${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const articlesViewAllHref = `/search?tab=articles${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className={styles.resultsRightCol} aria-label="Supporting discovery and editorial care">
      {/* 1. Treatments & Procedures Section (or Emergency Directory if empty) */}
      {hasTreatments ? (
        <div className={styles.editorialSection}>
          <div className={styles.editorialHeadingRow}>
            <span className={styles.sectionEyebrowTitle}>TREATMENTS &amp; PROCEDURES</span>
            <Link href={treatmentsViewAllHref} className={styles.editorialHeaderViewAll}>
              <span>View all</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          <div className={styles.editorialList}>
            {displayedTreatments.map((t) => (
              <Link
                key={t.id}
                href={`/search?tab=treatments&q=${encodeURIComponent(t.title)}`}
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
      ) : (
        <div className={styles.editorialSection}>
          <div className={styles.editorialHeadingRow}>
            <span className={styles.sectionEyebrowTitle}>24/7 CARE HELPLINE</span>
          </div>
          <div className={styles.editorialList}>
            <a href="tel:18602080208" className={styles.editorialItem}>
              <div className={styles.editorialItemLeft}>
                <span className={styles.editorialIconBox}>
                  <AlertCircle size={15} className={styles.editorialIconMono} />
                </span>
                <div className={styles.editorialMeta}>
                  <div className={styles.editorialItemTitle}>Hospital Helpline</div>
                  <div className={styles.editorialItemSub}>1860 208 0208 • 24x7 Available</div>
                </div>
              </div>
              <ChevronRight size={14} className={styles.editorialChevron} />
            </a>
            <a href="tel:1062" className={styles.editorialItem}>
              <div className={styles.editorialItemLeft}>
                <span className={styles.editorialIconBox}>
                  <Shield size={15} className={styles.editorialIconMono} />
                </span>
                <div className={styles.editorialMeta}>
                  <div className={styles.editorialItemTitle}>Ambulance Dispatch</div>
                  <div className={styles.editorialItemSub}>Dial 1062 • Emergency Response</div>
                </div>
              </div>
              <ChevronRight size={14} className={styles.editorialChevron} />
            </a>
          </div>
        </div>
      )}

      {/* 2. Related Articles Section */}
      <div className={styles.editorialSection}>
        <div className={styles.editorialHeadingRow}>
          <span className={styles.sectionEyebrowTitle}>RELATED ARTICLES &amp; GUIDANCE</span>
          <Link href={articlesViewAllHref} className={styles.editorialHeaderViewAll}>
            <span>View all</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className={styles.editorialList}>
          {effectiveArticles.map((art, idx) => (
            <Link
              key={art.id}
              href={`/search?tab=articles&q=${encodeURIComponent(art.title)}`}
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
      </div>

      {/* 3. Related Specialties & Care Section */}
      {effectiveSpecialties.length > 0 && (
        <div className={styles.editorialSection}>
          <div className={styles.editorialHeadingRow}>
            <span className={styles.sectionEyebrowTitle}>RELATED SPECIALTIES &amp; CARE</span>
            <Link href="/specialities" className={styles.editorialHeaderViewAll}>
              <span>View all</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          <div className={styles.editorialPillsGroup}>
            {effectiveSpecialties.map((spec) => (
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
