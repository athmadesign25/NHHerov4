"use client";

import React from "react";
import styles from "./NHSearchExperience.module.css";

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
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
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
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 52, height: 52 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 130, height: 15 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 90, height: 13 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 110, height: 12 }} />
                    <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 85, height: 12, marginTop: 4 }} />
                    <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: 115, height: 26, borderRadius: 6, marginTop: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 110, height: 14, marginTop: 18 }} />

          {/* Pulse AI Nudge Skeleton */}
          <div className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: "100%", height: 42, borderRadius: 10, marginTop: 24 }} />

          {/* Specialties Skeleton Tags */}
          <div className={styles.relatedSpecialtiesSection}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 160, height: 12, marginBottom: 12 }} />
            <div className={styles.relatedTagsGroup}>
              {[80, 110, 60, 95, 120].map((w, idx) => (
                <div key={idx} className={`${styles.skeletonPill} ${styles.shimmer}`} style={{ width: w, height: 26 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className={styles.resultsRightCol}>
          <div className={styles.tertiarySectionBlock}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 12, marginBottom: 12 }} />
            <div className={styles.tertiaryListRows}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 26, height: 26, borderRadius: 6 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 130, height: 13 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 85, height: 10 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 12, height: 12 }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tertiarySectionBlock}>
            <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 110, height: 13, marginBottom: 10 }} />
            <div className={styles.tertiaryListRows}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonSecondaryCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={`${styles.skeletonCircle} ${styles.shimmer}`} style={{ width: 26, height: 26, borderRadius: 6 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 140, height: 13 }} />
                      <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 75, height: 10 }} />
                    </div>
                  </div>
                  <div className={`${styles.skeletonBar} ${styles.shimmer}`} style={{ width: 12, height: 12 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
