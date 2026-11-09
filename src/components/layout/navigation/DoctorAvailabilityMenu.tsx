"use client";

import Link from "next/link";
import { HOSPITAL_LOCALITIES } from "./hospital-data";
import styles from "./DoctorAvailabilityMenu.module.css";
import MenuAction from "./MenuAction";
import MenuImageCard from "./MenuImageCard";
import patterns from "./MegaMenuPatterns.module.css";

type Availability = "sunday" | "today";

export default function DoctorAvailabilityMenu({ availability, onNavigate }: { availability: Availability; onNavigate: () => void }) {
  const sunday = availability === "sunday";
  const title = sunday ? "Doctors Available on Sunday" : "Doctors Available Today";
  const query = sunday ? "Doctors available on Sunday" : "Doctors available today";
  const href = (city?: string, locality?: string) => `/search?q=${encodeURIComponent(`${query}${city ? ` in ${city}` : ""}${locality ? `, ${locality}` : ""}`)}`;

  return (
    <div className={`${patterns.panel} ${styles.menu}`} data-doctor-availability-menu>
      <MenuImageCard title={title} image={sunday ? "/navigation/portraits/sunday-doctor-v2.webp" : "/navigation/portraits/today-doctor-v2.webp"} alt={sunday ? "Doctor in a white coat in an empty hospital consultation room" : "Indian woman doctor centered in an empty hospital corridor"} portrait className={`${styles.banner} ${sunday ? styles.sunday : styles.today}`} />
      <div className={styles.directory} aria-label={`${title} by city and locality`}>
        {HOSPITAL_LOCALITIES.map(city => <section className={styles.cityGroup} key={city.slug} aria-labelledby={`${availability}-city-${city.slug}`}>
            <h3 id={`${availability}-city-${city.slug}`}><Link href={href(city.city)} title={city.city} className={styles.cityButton} onClick={onNavigate}>{city.city}</Link></h3>
            <ul>{city.hospitals.map(locality => <li key={locality.label}><Link href={href(city.city, locality.label)} title={locality.label} className={styles.localityButton} onClick={onNavigate}>{locality.label}</Link></li>)}</ul>
          </section>)}
      </div>
      <div className={styles.footer}><MenuAction label={sunday ? "View All Doctors Available on Sunday" : "View All Doctors Available Today"} href={href()} context={`View all ${query.toLowerCase()}`} onClick={onNavigate} /></div>
    </div>
  );
}
