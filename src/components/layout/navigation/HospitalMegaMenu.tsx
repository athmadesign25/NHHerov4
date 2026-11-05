"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { HOSPITAL_LOCALITIES as HOSPITAL_CITIES } from "./hospital-data";
import styles from "./HospitalMegaMenu.module.css";
import MenuImageCard from "./MenuImageCard";
import patterns from "./MegaMenuPatterns.module.css";

const accreditations = [
  { name: "NABL Accredited Laboratories", lines: ["NABL Accredited", "Laboratories"], logo: "/NABL accreditation board logo.png" },
  { name: "NABH Certified Nursing Services", lines: ["NABH Certified", "Nursing Services"], logo: "/NABH certified nursing services logo.png" },
  { name: "JCI Accredited", lines: ["JCI", "Accredited"], logo: "/accreditations/jci.png" },
  { name: "CAP Accredited", lines: ["CAP", "Accredited"], logo: "/College of American Pathologists accredited logo.png" },
];

const accreditationGroups = [accreditations.slice(0, 2), accreditations.slice(2)];

export default function HospitalMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const playing = !reduced;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % accreditationGroups.length);
    }, duration.slowest * 1000 * 5);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className={`${patterns.panel} ${styles.menu}`} data-hospital-menu>
      <MenuImageCard title="Accreditations" captionPosition="top" image="/navigation/hospitals/cardiac-sciences-original.png" imageSizes="(min-width: 1100px) 1400px, 100vw" alt="Narayana Institute of Cardiac Sciences hospital building">
        <div className={styles.badge}>
          <div className={styles.badgeStage} role="img" aria-label={accreditationGroups[active].map(badge => badge.name).join("; ")} aria-live="off">
          {accreditationGroups.map((group, index) => (
            <motion.div key={index} className={styles.badgeContent} aria-hidden="true"
              initial={false} animate={{ opacity: active === index ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.standard }}>
              {group.map(badge => <div key={badge.name} className={styles.accreditation}>
                <span className={styles.badgeIcon}><Image src={badge.logo} alt="" width={24} height={24} sizes="24px" loading="eager" /></span>
                <span className={styles.badgeLabel}>{badge.lines.map(line => <span key={line}>{line}</span>)}</span>
              </div>)}
            </motion.div>
          ))}
          </div>
        </div>
      </MenuImageCard>
      <div className={styles.directory} aria-label="Hospitals by city">
        {HOSPITAL_CITIES.map(city => <section className={styles.cityGroup} key={city.slug} aria-labelledby={`hospital-city-${city.slug}`}>
          <h2 id={`hospital-city-${city.slug}`}><Link className={`${styles.textButton} ${styles.cityButton}`} href={city.href} onClick={onNavigate}>{city.city}</Link></h2>
          <ul>{city.hospitals.map(hospital => <li key={hospital.label}><Link className={`${styles.textButton} ${styles.hospitalButton}`} href={hospital.href} title={hospital.label} onClick={onNavigate}>{hospital.label}</Link></li>)}</ul>
        </section>)}
      </div>
    </div>
  );
}
