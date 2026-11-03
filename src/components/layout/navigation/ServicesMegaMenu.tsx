"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICE_CENTRES as centres, SERVICE_TILES as services } from "./service-menu-data";
import styles from "./ServicesMegaMenu.module.css";
import MenuAction from "./MenuAction";
import surfaces from "./DesktopMenuSurfaces.module.css";

export default function ServicesMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className={styles.menu}>
      <section className={styles.centres} aria-labelledby="nav-centres-title">
        <div className={styles.centreImage}>
          <Image src="/navigation/hospitals/cardiac-sciences-banner.webp" alt="Narayana Health hospital campus" fill sizes="1400px" loading="eager" />
        </div>
        <div className={styles.centreAction}><MenuAction label="View All Centres of Excellence" href="/specialities" context="View all centres of excellence" onClick={onNavigate} /></div>
        <div className={styles.centreContent}>
          <h2 id="nav-centres-title">Centres of Excellence</h2>
          <ul className={styles.centreLinks}>
            {centres.map((centre) => <li key={centre.href}><Link href={centre.href} onClick={onNavigate}>{centre.label}</Link></li>)}
          </ul>
        </div>
      </section>
      <div className={styles.tiles} aria-label="Our services">
        {services.map((service) => (
          <Link key={service.label} href={service.href} className={`${styles.tile} ${service.tone === "emergency" ? styles.emergency : ""}`} onClick={onNavigate}
            aria-label={service.label}>
            <Image src={service.image} alt="" fill sizes="(min-width: 1600px) 18vw, 16vw" className={styles.tileImage} />
            <span className={surfaces.linearWash} aria-hidden="true" />
            <span className={styles.tileTitle}>{service.lines.map((line) => <span key={line}>{line}</span>)}</span>
            <span className={surfaces.arrow} aria-hidden="true"><ArrowUpRight /></span>
          </Link>
        ))}
        <Link href="/search?q=One%20Health" className={`${styles.tile} ${styles.oneHealth}`} onClick={onNavigate} aria-label="One Health">
          <span className={surfaces.linearWash} aria-hidden="true" />
          <Image src="/narayana_one_health_logo_colored.svg" alt="One Health" width={160} height={96} sizes="(min-width: 1600px) 14vw, 12vw" className={styles.oneHealthLogo} />
          <span className={surfaces.arrow} aria-hidden="true"><ArrowUpRight /></span>
        </Link>
      </div>
    </div>
  );
}
