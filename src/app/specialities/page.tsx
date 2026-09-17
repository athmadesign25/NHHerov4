"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ALL_SPECIALITIES, SPECIALITY_CATEGORIES, type SpecialityMeta } from "@/data/specialities";
import styles from "./page.module.css";

export default function SpecialitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered: SpecialityMeta[] =
    activeCategory === "All"
      ? ALL_SPECIALITIES
      : ALL_SPECIALITIES.filter((s) => s.category === activeCategory);

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
      {/* ── HERO ── */}
      <section className={styles.hero} aria-label="Treatment & Specialities">
        <div className={styles.heroDotGrid} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Treatments & Specialities" },
            ]}
            theme="dark"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className={styles.heroEyebrow}>Treatment & Specialities</p>
            <h1 className={styles.heroTitle}>
              40+ Medical Specialities<br />Under One Roof
            </h1>
            <p className={styles.heroSubtitle}>
              From complex cardiac surgeries to advanced cancer care — Narayana Health covers every dimension of your health.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <div className={styles.filterBar} role="navigation" aria-label="Filter specialities by category">
        <div className={`container ${styles.filterInner}`}>
          {SPECIALITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase().replace(/\s+&\s+|\s+/g, "-")}`}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.filterTab} ${activeCategory === cat ? styles.filterTabActive : ""}`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── SPECIALITIES GRID ── */}
      <section className={styles.gridSection}>
        <div className="container">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.emptyState}
              >
                <Search size={40} style={{ margin: "0 auto var(--sp-2)", opacity: 0.3 }} />
                <p className={styles.emptyStateTitle}>No specialities found</p>
                <p>Try selecting a different category</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                className={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filtered.map((spec, i) => (
                  <motion.div
                    key={spec.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={`/specialities/${spec.slug}`}
                      className={styles.card}
                      id={`spec-card-${spec.slug}`}
                      aria-label={`${spec.name} — ${spec.tagline}`}
                    >
                      {/* Image */}
                      <div className={styles.cardImageWrap}>
                        <Image
                          src={spec.image}
                          alt={spec.name}
                          fill
                          className={styles.cardImage}
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading={i < 4 ? "eager" : "lazy"}
                        />
                        {/* SVG Icon badge */}
                        <div className={styles.cardIconBadge} aria-hidden="true">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={spec.icon} alt="" width={24} height={24} />
                        </div>
                      </div>

                      {/* Body */}
                      <div className={styles.cardBody}>
                        <span className={styles.cardCategory}>{spec.category}</span>
                        <span className={styles.cardName}>{spec.name}</span>
                        <span className={styles.cardStat}>
                          <span className={styles.cardStatValue}>{spec.stat.value}</span>{" "}
                          {spec.stat.label}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className={styles.cardFooter}>
                        <span className={styles.cardLink}>
                          Explore <ChevronRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner} aria-label="Find a specialist">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className={styles.ctaTitle}>Looking for a specific treatment?</h2>
            <p className={styles.ctaSubtitle}>
              Our team of 3,000+ specialists is ready to help you find the right care.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/search" className={styles.ctaBtnPrimary} id="spec-listing-find-doctor">
                <Search size={16} /> Find a Doctor
              </Link>
              <Link href="/search" className={styles.ctaBtnSecondary} id="spec-listing-search">
                Browse by Condition <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
