"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICE_CENTRES as centres, SERVICE_TILES as services } from "./service-menu-data";
import styles from "./ServicesMegaMenu.module.css";

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
