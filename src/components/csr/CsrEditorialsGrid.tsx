"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Download, Calendar, FileText } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CsrEditorialItem } from "@/data/csrData";
import styles from "./CsrEditorialsGrid.module.css";

interface CsrEditorialsGridProps {
  items: CsrEditorialItem[];
}

export default function CsrEditorialsGrid({ items }: CsrEditorialsGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ambientY = useTransform(scrollYProgress, [0, 1], [-40, 60]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.8, 0.3]);

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, title: string) => {
    // Graceful download trigger for PDF / Advisory
    e.preventDefault();
    alert(`Downloading ${title} (PDF)...`);
  };

  return (
    <section ref={sectionRef} className={styles.sectionWrapper} data-nav-theme="dark">
      {/* Dynamic Ambient Atmosphere connecting from Hero */}
      <motion.div 
        className={styles.topAtmosphere}
        style={{
          y: ambientY,
          opacity: ambientOpacity,
        }}
      />

      <div className={styles.container}>
        {/* Section Header (Centered with TextSweepEffect Settling to Dark Stage) */}
        <motion.div 
          className={styles.headerBlock}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.sectionTitle}>
            <TextSweepEffect
              words={["Downloadable CSR Editorials"]}
              sweepMs={1400}
              finalColor="#FFFFFF"
            />
          </h2>
          <p className={styles.sectionSubtitle}>
            Access our quarterly community impact newsletters, pandemic clinical advisories, and certified statutory governance charters.
          </p>
        </motion.div>

        {/* 3-Column Editorial Cards Grid with Staggered Scroll-In Reveal */}
        <div className={styles.editorialsGrid}>
          {items.map((item, index) => (
            <motion.article 
              key={item.id} 
              className={styles.editorialCard}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.12, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } 
              }}
            >
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
            </motion.article>
          ))}
        </div>
      </div>

      {/* Bottom Transition Zone: Gradient blend leading seamlessly into Flagship Programs */}
      <div className={styles.bottomTransitionGlow} />
    </section>
  );
}

