"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { HOSPITAL_CITIES, HOSPITAL_SLIDES } from "./hospital-data";
import styles from "./HospitalMegaMenu.module.css";

const cityColumns = [[0], [1, 6, 14], [2, 4, 12, 5], [3, 10, 9], [7, 8, 11, 13]];

export default function HospitalMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const playing = !reduced && !paused && !interacting;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % HOSPITAL_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className={styles.menu}>
      <section className={styles.banner} aria-label="Explore Narayana Health hospitals" aria-roledescription="carousel"
        onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
        }}>
        {HOSPITAL_SLIDES.map((slide, index) => <div key={slide.city} className={`${styles.photo} ${index === active ? styles.visible : ""}`} aria-hidden="true">
          <Image src={slide.image} alt="" fill sizes="(min-width: 1100px) 75vw, 100vw" loading="eager" />
        </div>)}
        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.caption} aria-live="off">
          <span className={styles.eyebrow}>{HOSPITAL_SLIDES[active].city}</span>
          <Link href={HOSPITAL_SLIDES[active].href} onClick={onNavigate} className={styles.featureLink}>
            {HOSPITAL_SLIDES[active].label}<ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.controls}>
          {HOSPITAL_SLIDES.map((slide, index) => <button type="button" key={slide.city} className={styles.dot}
            aria-label={`Show ${slide.label}`} aria-pressed={active === index} onClick={() => { setActive(index); setPaused(true); }} />)}
          <button type="button" className={styles.play} aria-label={paused || reduced ? "Play hospital slideshow" : "Pause hospital slideshow"}
            onClick={() => setPaused((value) => !value)} disabled={!!reduced}>
            {paused || reduced ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
        </div>
      </section>
      <div className={styles.directory} aria-label="Hospitals by city">
        {cityColumns.map((column, index) => <div className={styles.column} key={index}>
          {column.map((cityIndex) => {
            const city = HOSPITAL_CITIES[cityIndex];
            return <section key={city.slug} aria-labelledby={`hospital-city-${city.slug}`}>
              <h2 id={`hospital-city-${city.slug}`}>{city.city}</h2>
              <ul>{city.hospitals.map((hospital) => <li key={hospital.href}>
                <Link href={hospital.href} onClick={onNavigate}>{hospital.label}</Link>
              </li>)}</ul>
            </section>;
          })}
        </div>)}
      </div>
      <Link className={styles.viewAll} href="https://www.narayanahealth.org/hospitals-clinics" onClick={onNavigate}>View All Hospitals & Clinics <ArrowUpRight aria-hidden="true" /></Link>
    </div>
  );
}
