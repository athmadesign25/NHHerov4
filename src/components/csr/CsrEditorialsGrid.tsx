"use client";

import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { CsrEditorialItem } from "@/data/csrData";
import styles from "./CsrEditorialsGrid.module.css";

interface CsrEditorialsGridProps {
  items: CsrEditorialItem[];
}

export default function CsrEditorialsGrid({ items }: CsrEditorialsGridProps) {
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, title: string) => {
    // Graceful download trigger for PDF / Advisory
    e.preventDefault();
    alert(`Downloading ${title} (PDF)...`);
  };

  return (
    <section className={styles.sectionWrapper} data-nav-theme="light">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerBlock}>
          <span className={styles.eyebrow}>PUBLICATIONS &amp; IMPACT BULLETINS</span>
          <h2 className={styles.sectionTitle}>Downloadable CSR Editorials</h2>
          <p className={styles.sectionSubtitle}>
            Access our quarterly community impact newsletters, pandemic clinical advisories, and certified statutory governance charters.
          </p>
        </div>

        {/* 3-Column Editorial Cards Grid */}
        <div className={styles.editorialsGrid}>
          {items.map((item) => (
            <article key={item.id} className={styles.editorialCard}>
              {/* Full Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                className={styles.cardBgImage}
              />

              {/* Subtle Top Gradient Scrim for effortless readability without a bulky pill */}
              <div className={styles.cardTopScrim} />

              {/* Pure Editorial Category Text (No bulky pill container, no visual noise) */}
              <span className={styles.cardTopCategoryText}>
                {item.category}
              </span>

              {/* Luminous Photography Bottom Gradient Scrim */}
              <div className={styles.cardScrim} />

              {/* Content Overlaid on Scrim */}
              <div className={styles.cardContent}>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardDate}>{item.date}</span>
                </div>

                <h3 className={styles.cardTitle} title={item.title}>
                  {item.title}
                </h3>

                <p className={styles.cardDesc}>
                  {item.description}
                </p>

                {/* Secondary Level Download CTA */}
                <div className={styles.ctaRow}>
                  <a
                    href={item.downloadUrl}
                    onClick={(e) => handleDownload(e, item.title)}
                    className={styles.downloadBtn}
                    aria-label={`Download ${item.title}`}
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </a>

                  <span className={styles.fileSizeTag}>{item.fileSize}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
