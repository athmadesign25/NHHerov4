"use client";

import React from "react";
import Image from "next/image";
import { Download, Calendar, FileText } from "lucide-react";
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

              {/* Atmospheric Gradient Scrim (Exact Figma "Image fade") */}
              <div className={styles.cardGradient} />

              {/* Content Overlaid on Scrim */}
              <div className={styles.cardContent}>
                <div className={styles.cardTextGroup}>
                  <div className={styles.cardEyebrow}>
                    {item.category}
                  </div>

                  <h3 className={styles.cardTitle} title={item.title}>
                    {item.title}
                  </h3>

                  <p className={styles.cardDesc}>
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom Slot: Resting Meta vs Hover Download CTA */}
                <div className={styles.cardBottomSlot}>
                  <div className={styles.cardRestingMeta}>
                    <span className={styles.metaBadge}>
                      <Calendar size={13} className={styles.metaIcon} />
                      <span>{item.date}</span>
                    </span>
                    <span className={styles.metaDivider} aria-hidden="true" />
                    <span className={styles.metaBadge}>
                      <FileText size={13} className={styles.metaIcon} />
                      <span>{item.fileSize} (PDF)</span>
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <a
                      href={item.downloadUrl}
                      onClick={(e) => handleDownload(e, item.title)}
                      className={styles.downloadBtn}
                      aria-label={`Download ${item.title}`}
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

