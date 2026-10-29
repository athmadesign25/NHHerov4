"use client";

import Image from "next/image";
import Link from "next/link";
import { HOSPITAL_LOCALITIES } from "./hospital-data";
import { doctorNavUrl } from "@/features/search/navigationEntries";
import styles from "./DoctorAvailabilityMenu.module.css";

type Availability = "sunday" | "today";

export default function DoctorAvailabilityMenu({ availability, onNavigate }: { availability: Availability; onNavigate: () => void }) {
  const sunday = availability === "sunday";
  const title = sunday ? "Doctors Available on Sunday" : "Doctors Available Today";
  const href = (city?: string) => {
    const target = new URL(doctorNavUrl(availability), "https://nh.local");
    if (city) target.searchParams.set("location", city);
    return `${target.pathname}?${target.searchParams}`;
  };

  return (
    <div className={styles.menu} data-doctor-availability-menu>
      <section className={styles.banner} aria-label={title}>
        <Image src={sunday ? "/assets/doctor_1.png" : "/assets/hero_doctor.png"} alt={sunday ? "Doctor in a white coat with a stethoscope" : "Doctor standing in a hospital corridor"} fill sizes="512px" className={`${styles.photo} ${sunday ? "" : styles.todayPhoto}`} />
        <div className={styles.wash} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
      </section>
      <div className={styles.directory} aria-label={`${title} by city and locality`}>
        {HOSPITAL_LOCALITIES.map(city => <section className={styles.cityGroup} key={city.slug} aria-labelledby={`${availability}-city-${city.slug}`}>
            <h3 id={`${availability}-city-${city.slug}`}><Link href={href(city.city)} className={styles.cityButton} onClick={onNavigate}>{city.city}</Link></h3>
            <ul>{city.hospitals.map(locality => <li key={locality.label}><Link href={href(city.city)} className={styles.localityButton} onClick={onNavigate}>{locality.label}</Link></li>)}</ul>
          </section>)}
      </div>
      <Link href={href()} className={styles.viewAll} onClick={onNavigate}>View All Doctors</Link>
    </div>
  );
}
