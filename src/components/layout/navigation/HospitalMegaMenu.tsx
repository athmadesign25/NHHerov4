"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { HOSPITAL_LOCALITIES as HOSPITAL_CITIES } from "./hospital-data";
import styles from "./HospitalMegaMenu.module.css";

const accreditations = [
  { name: "NABL Accredited Laboratories", lines: ["NABL Accredited", "Laboratories"], logo: "/NABL accreditation board logo.png" },
  { name: "NABH Certified Nursing Services", lines: ["NABH Certified", "Nursing Services"], logo: "/NABH certified nursing services logo.png" },
  { name: "JCI Accredited", lines: ["JCI", "Accredited"], logo: "/accreditations/jci.png" },
  { name: "CAP Accredited", lines: ["CAP", "Accredited"], logo: "/College of American Pathologists accredited logo.png" },
];

const accreditationGroups = [accreditations.slice(0, 2), accreditations.slice(2)];

// Keep every city intact; balance the remaining cities across three columns.
const otherCities = HOSPITAL_CITIES.filter(city => city.slug !== "bangalore");
const cityWeight = (city: typeof HOSPITAL_CITIES[number]) => city.hospitals.length + 2;
const weightOf = (cities: typeof otherCities) => cities.reduce((total, city) => total + cityWeight(city), 0);
let cuts = [1, 2];
let bestWeight = Infinity;
for (let first = 1; first < otherCities.length - 1; first++) {
  for (let second = first + 1; second < otherCities.length; second++) {
    const weights = [otherCities.slice(0, first), otherCities.slice(first, second), otherCities.slice(second)].map(weightOf);
    const largest = Math.max(...weights);
    if (largest < bestWeight) { bestWeight = largest; cuts = [first, second]; }
  }
}
const cityColumns = [HOSPITAL_CITIES.filter(city => city.slug === "bangalore"), otherCities.slice(0, cuts[0]), otherCities.slice(cuts[0], cuts[1]), otherCities.slice(cuts[1])];

export default function HospitalMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const playing = !reduced && !interacting;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % accreditationGroups.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className={styles.menu} data-hospital-menu>
      <section className={styles.banner} aria-label="Narayana Institute of Cardiac Sciences, Bangalore"
        onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
        }}>
        <Image src="/navigation/hospitals/cardiac-sciences-banner.webp" alt="Narayana Institute of Cardiac Sciences hospital building" fill sizes="1400px" className={styles.photo} />
        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.badge}>
          <h2 className={styles.badgeTitle}>Accreditations</h2>
          <div role="img" aria-label={accreditationGroups[active].map(badge => badge.name).join("; ")} aria-live="off">
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={active} className={styles.badgeContent} aria-hidden="true"
              initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduced ? 0 : duration.slow } }}
              transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.standard }}>
              {accreditationGroups[active].map(badge => <div key={badge.name} className={styles.accreditation}>
                <span className={styles.badgeIcon}><Image src={badge.logo} alt="" width={24} height={24} sizes="24px" /></span>
                <span className={styles.badgeLabel}>{badge.lines.map(line => <span key={line}>{line}</span>)}</span>
              </div>)}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </section>
      <div className={styles.directory} aria-label="Hospitals by city">
        {cityColumns.map((column, index) => <div className={styles.column} key={index}
          aria-label={index === 0 ? "Bangalore hospitals and clinics" : `Hospitals from ${column[0].city} to ${column[column.length - 1].city}`}
          >
          {column.map(city => {
            return <section className={styles.cityGroup} key={city.slug} aria-labelledby={`hospital-city-${city.slug}`}>
              <h2 id={`hospital-city-${city.slug}`}>
                <Link className={`${styles.textButton} ${styles.cityButton}`} href={city.href} onClick={onNavigate}>{city.city}</Link>
              </h2>
              <ul>{city.hospitals.map(hospital => <li key={hospital.label}>
                <Link className={`${styles.textButton} ${styles.hospitalButton}`} href={hospital.href} onClick={onNavigate}>{hospital.label}</Link>
              </li>)}</ul>
            </section>;
          })}
        </div>)}
      </div>
      <Link className={`${styles.textButton} ${styles.viewAll}`} href="https://www.narayanahealth.org/hospitals-clinics" onClick={onNavigate}>View All Hospitals & Clinics</Link>
    </div>
  );
}
