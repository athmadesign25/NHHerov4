"use client";

import React from "react";
import styles from "./NHSearchExperience.module.css";
import floatingStyles from "../../layout/FloatingQuickActions.module.css";

interface SkeletonResultsCanvasProps {
  query: string;
}

export default function SkeletonResultsCanvas({ query }: SkeletonResultsCanvasProps) {
  return (
    <div className={styles.resultsContainer} aria-busy="true" aria-label="Loading search results">
      {/* Top Header Row Skeleton */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          <div className={`${styles.skeletonPill} ${styles.shimmer}`} />
          <div className={styles.pulseBadge}>
            <span className={floatingStyles.pulseBars} style={{ transform: "scale(0.70)" }} aria-hidden>
              <span className={floatingStyles.pulseBar1} />
              <span className={floatingStyles.pulseBar2} />
              <span className={floatingStyles.pulseBar3} />
            </span>
            <span className={styles.pulseText}>Pulse AI</span>
          </div>
        </div>
        <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 32, height: 32, borderRadius: 8 }} />
      </div>

      {/* Query Bar with subtle Pulse AI finding care status */}
      <div className={styles.resultsQueryBar}>
        <div className={styles.resultsQueryLeft}>
          <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 22, height: 22 }} />
          <span className={styles.resultsQueryText}>{query || "Finding the right care for you…"}</span>
        </div>
        <div className={styles.skeletonLoadingStatus}>
          <span className={styles.skeletonPulseDot} />
          <span>Finding the right care for you…</span>
        </div>
      </div>

      {/* Red Horizon Divider */}
      <div className={styles.redDivider} />

      {/* Main Search Result Heading Skeleton */}
      <div className={styles.resultsCategoryHeader}>
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 240, height: 22 }} />
        <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 14, marginTop: 4 }} />
      </div>

      {/* Two Column Skeleton Grid */}
      <div className={styles.resultsSplitLayout}>
        {/* Left Column Skeleton */}
        <div className={styles.resultsLeftCol}>
          <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 130, height: 12, marginBottom: 12 }} />

          {/* 4 Doctor Skeletons */}
          <div className={styles.doctorsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonDoctorCard}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 48, height: 48, flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "70%", height: 18 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "45%", height: 14, marginTop: 2 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: "60%", height: 13, marginTop: 2 }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 85, height: 13 }} />
                  <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: 48, height: 22, borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 100, height: 12, marginTop: 12 }} />

          {/* Pulse AI Nudge Skeleton */}
          <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: "100%", height: 32, borderRadius: 6, marginTop: 16 }} />

          {/* Specialties Skeleton Tags */}
          <div className={styles.relatedSpecialtiesSection}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 11, marginBottom: 8 }} />
            <div className={styles.relatedTagsGroup}>
              {[70, 95, 55, 85, 105].map((w, idx) => (
                <div key={idx} className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: w, height: 22 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className={styles.resultsRightCol}>
          <div className={styles.tertiarySectionBlock}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 120, height: 11, marginBottom: 8 }} />
            <div className={styles.tertiaryListRows}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 20, height: 20, borderRadius: 4 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 115, height: 12 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 75, height: 10 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 10, height: 10 }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tertiarySectionBlock}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 95, height: 11, marginBottom: 8 }} />
            <div className={styles.tertiaryListRows}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 20, height: 20, borderRadius: 4 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 120, height: 12 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 65, height: 10 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 10, height: 10 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
