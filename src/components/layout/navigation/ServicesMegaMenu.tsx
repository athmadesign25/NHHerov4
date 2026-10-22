"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./ServicesMegaMenu.module.css";

const centres = [
  { label: "Cardiac Sciences", href: "/specialities/cardiology" },
  { label: "Gastro Sciences", href: "/specialities/gastroenterology" },
  { label: "Image Guided Therapy", href: "/search?q=Image%20Guided%20Therapy" },
  { label: "Cancer Care", href: "/specialities/oncology" },
  { label: "Orthopaedics", href: "/specialities/orthopaedics" },
  { label: "Neurology", href: "/specialities/neurology" },
];
const services = [
  { label: "Ambulance Service Emergency", lines: ["Ambulance", "Service", "Emergency"], href: "/emergency", image: "/navigation/services-ambulance.webp", tone: "emergency" },
  { label: "Book Health Checkup", lines: ["Book Health", "Checkup"], href: "/#health-packages", image: "/health-packages/diabetes.png", tone: "checkup" },
  { label: "Diagnostics and tests", lines: ["Diagnostics", "and tests"], href: "/search?q=Diagnostics%20and%20tests", image: "/images/procedures/procedure_mri.png", tone: "diagnostics" },
  { label: "Aarogyam", lines: ["Aarogyam"], href: "/search?q=Aarogyam", image: "/health-checkup-consultation.jpg", tone: "wellness" },
  { label: "Clinical Specialties", lines: ["Clinical", "Specialties"], href: "/specialities", image: "/pulse_find_doctor_banner.png", tone: "clinical" },
  { label: "Health Insurance", lines: ["Health", "Insurance"], href: "https://www.narayanahealth.insurance/", image: "/doctor_patient.png", tone: "insurance" },
];

export default function ServicesMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className={styles.menu}>
      <section className={styles.centres} aria-labelledby="nav-centres-title">
        <div className={styles.centreImage}>
          <Image src="/assets/hospital_1.png" alt="Hospital campus" fill sizes="(min-width: 1600px) 24vw, 22vw" />
        </div>
        <div className={styles.centreContent}>
          <h2 id="nav-centres-title">Centres of Excellence</h2>
          <ul className={styles.centreLinks}>
            {centres.map((centre) => <li key={centre.href}><Link href={centre.href} onClick={onNavigate}>{centre.label}</Link></li>)}
          </ul>
          <Link href="/specialities" className={styles.viewAll} onClick={onNavigate}>View All</Link>
        </div>
      </section>
      <div className={styles.tiles} aria-label="Our services">
        {services.map((service) => (
          <Link key={service.label} href={service.href} className={`${styles.tile} ${styles[service.tone]}`} onClick={onNavigate}
            aria-label={service.label}>
            <Image src={service.image} alt="" fill sizes="(min-width: 1600px) 18vw, 16vw" className={styles.tileImage} />
            <span className={styles.tileWash} aria-hidden="true" />
            <span className={styles.tileTitle}>{service.lines.map((line) => <span key={line}>{line}</span>)}</span>
            <span className={styles.arrow} aria-hidden="true"><ArrowUpRight size={16} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
