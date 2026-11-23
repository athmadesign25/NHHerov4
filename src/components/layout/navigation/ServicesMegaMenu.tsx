"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SERVICE_MENU_SECTIONS } from "./service-menu-data";
import ServicesMenuCollage from "./ServicesMenuCollage";
import MenuAction from "./MenuAction";
import ServicesContactBand from "./ServicesContactBand";
import mobilePatterns from "./MobileMenuPatterns.module.css";
import { mobileMenuLabel } from "./mobile-menu-label";
import styles from "./ServicesMegaMenu.module.css";
import grouped from "./EditorialMegaMenu.module.css";

type Section = (typeof SERVICE_MENU_SECTIONS)[number];

function ServiceContent({ section, onNavigate, mobile = false }: {
  section: Section; onNavigate: () => void; mobile?: boolean;
}) {
  const id = useId();
  const linkList = (group: Section["groups"][number]) => <ul className={styles.textLinks} aria-label={group.title}>
    {group.links.map(link => <li key={link.href}>
      <Link href={link.href} className={styles.textLink} onClick={onNavigate}>
        {mobile ? mobileMenuLabel(link.label) : link.label}
      </Link>
    </li>)}
  </ul>;

  return <div className={styles.sectionContent}>
    {!section.brands && linkList(section.groups[0])}
    {section.brands && <ul className={styles.brandTiles} aria-label="Preventive health">
      <li><Link href={section.groups[0].links[0].href} className={`${styles.brandTile} ${styles.checkupTile}`} onClick={onNavigate}>
        <span className={styles.checkupLabel}>{mobile
          ? mobileMenuLabel(section.groups[0].links[0].label)
          : (section.groups[0].links[0].lines ?? [section.groups[0].links[0].label]).map(line => <span key={line}>{line}</span>)}</span>
      </Link></li>
      {section.brands.map(brand => <li key={brand.href}>
        <Link href={brand.href} className={styles.brandTile} onClick={onNavigate} aria-label={`${brand.label} clinic`}>
          <span className={`${styles.brandLogo} ${brand.logoShape === "portrait" ? styles.portraitLogo : ""}`} aria-hidden="true">
            <Image src={brand.logo} alt="" aria-hidden="true" fill sizes="160px" />
          </span>
          {brand.tag && <span className={styles.brandTag}>{brand.tag}</span>}
        </Link>
      </li>)}
    </ul>}
    {section.groups.slice(1).map((group, index) => <section key={group.title} className={styles.insuranceGroup} aria-labelledby={`${id}-${index}`}>
      <h4 id={`${id}-${index}`} className={styles.subheading}>{group.title}</h4>
      {linkList(group)}
    </section>)}
    {section.footer && <div className={styles.groupFooter}>
      <MenuAction label={section.footer.label} href={section.footer.href} context="View all centres of excellence" onClick={onNavigate} />
    </div>}
  </div>;
}

export default function ServicesMegaMenu({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>("preventive");
  const id = useId();

  if (mobile) return <div className={styles.mobile} data-service-menu>
    {SERVICE_MENU_SECTIONS.map(section => <section key={section.id} className={styles.mobileGroup}>
      <h3 className={mobilePatterns.heading}>
        <button type="button" className={mobilePatterns.toggle} aria-expanded={expanded === section.id} aria-controls={`${id}-${section.id}-content`}
          onClick={() => setExpanded(expanded === section.id ? null : section.id)}>
          {mobileMenuLabel(section.label)}<ChevronDown aria-hidden="true" />
        </button>
      </h3>
      <div id={`${id}-${section.id}-content`} className={mobilePatterns.surface} hidden={expanded !== section.id}>
        <ServiceContent section={section} onNavigate={onNavigate} mobile />
      </div>
    </section>)}
    <div className={styles.mobileFeature}><ServicesMenuCollage /></div>
  </div>;

  const renderSection = (section: Section) => <section key={section.id} className={styles.serviceGroup} aria-labelledby={`${id}-${section.id}-heading`}>
    <h3 id={`${id}-${section.id}-heading`} className={`section-eyebrow ${grouped.groupTitle}`}>{section.label}</h3>
    <ServiceContent section={section} onNavigate={onNavigate} />
  </section>;

  return <div className={`${grouped.menu} ${styles.servicesMenu}`} data-service-menu>
    <div className={`${grouped.content} ${styles.servicesContent}`}>
      <ServicesMenuCollage />
      <div className={styles.column}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "preventive").map(renderSection)}</div>
      <div className={styles.column}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "insurance" || section.id === "services").map(renderSection)}</div>
      <div className={styles.column}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "centres").map(renderSection)}</div>
    </div>
    <ServicesContactBand onNavigate={onNavigate} />
  </div>;
}
