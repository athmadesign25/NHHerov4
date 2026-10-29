import styles from "./loading.module.css";

export default function TreatmentsLoading() {
  return (
    <div className={styles.loadingContainer} aria-busy="true" aria-label="Loading treatments and procedures">
      {/* Quick Clinical Pulse Line */}
      <div className={styles.pulseTrack}>
        <div className={styles.pulseBar} />
      </div>

      {/* Hero Skeleton Row */}
      <div className={styles.heroSkeletonRow}>
        <div>
          <div className={styles.titleSkeleton} />
          <div className={styles.subtitleSkeleton} />
          <div className={styles.searchSkeleton} />
        </div>

        <div className={styles.statSkeletonCol}>
          <div className={styles.statSkeletonItem} />
          <div className={styles.statSkeletonItem} />
          <div className={styles.statSkeletonItem} />
        </div>
      </div>

      {/* 10 Organ Bubbles Row Skeleton */}
      <div className={styles.bubblesSkeletonRow}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={styles.bubbleSkeletonItem} />
        ))}
      </div>

      {/* Procedure Cards Grid Skeleton */}
      <div className={styles.cardsSkeletonGrid}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardImageSkeleton} />
            <div className={styles.cardBodySkeleton}>
              <div className={styles.cardLine1} />
              <div className={styles.cardLine2} />
              <div className={styles.cardLine3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
