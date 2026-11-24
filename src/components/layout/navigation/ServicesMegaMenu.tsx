"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SERVICE_MENU_SECTIONS } from "./service-menu-data";
import MenuAction from "./MenuAction";
import ServicesContactBand from "./ServicesContactBand";
import ServicesMenuCollage from "./ServicesMenuCollage";
import mobilePatterns from "./MobileMenuPatterns.module.css";
import { mobileMenuLabel } from "./mobile-menu-label";
import styles from "./ServicesMegaMenu.module.css";
import grouped from "./EditorialMegaMenu.module.css";

type Section = (typeof SERVICE_MENU_SECTIONS)[number];
type ServiceLink = Section["groups"][number]["links"][number];

function ServiceTile({ link, onNavigate, mobile }: {
  link: ServiceLink; onNavigate: () => void; mobile: boolean;
}) {
  const Icon = link.icon;
  return <Link href={link.href} className={`${styles.serviceTile} ${link.imageTreatment === "portrait" ? styles.insuranceTile : ""} ${link.imageTreatment === "ambulance" ? styles.ambulanceTile : ""} ${link.imageTreatment === "diagnostics" ? styles.diagnosticsTile : ""}`} onClick={onNavigate} aria-label={link.label}>
    {link.image && <span className={styles.tileImage} aria-hidden="true">
      <Image src={link.image} alt="" fill sizes="(min-width: 1100px) 180px, 40vw" />
    </span>}
    <span className={`${grouped.itemCopy} ${styles.tileCopy}`}>
      {Icon && <Icon className={`${grouped.itemIcon} ${styles.menuIcon}`} aria-hidden="true" />}
      <span className={styles.tileLabel}>{(link.lines ?? [link.label]).map((line, index) => <span key={line}>
        {mobile ? (index === 0 ? mobileMenuLabel(line) : line.toLowerCase()) : line}
      </span>)}</span>
    </span>
    {link.tag && <span className={styles.brandTag}>{link.tag}</span>}
  </Link>;
}

function ServiceContent({ section, onNavigate, mobile = false }: {
  section: Section; onNavigate: () => void; mobile?: boolean;
}) {
  const id = useId();
  const tiled = section.id !== "centres";
  const linkList = (group: Section["groups"][number]) => <ul className={tiled ? styles.tileList : styles.textLinks} aria-label={group.title}>
    {group.links.map(link => {
      const Icon = link.icon;
      return <li key={link.href}>
        {tiled ? <ServiceTile link={link} onNavigate={onNavigate} mobile={mobile} /> : <Link href={link.href} className={styles.textLink} onClick={onNavigate}>
          {Icon && <Icon className={`${grouped.itemIcon} ${styles.menuIcon}`} aria-hidden="true" />}
          <span>{mobile ? mobileMenuLabel(link.label) : link.label}</span>
        </Link>}
      </li>;
    })}
  </ul>;

  return <div className={styles.sectionContent}>
    {!section.brands && linkList(section.groups[0])}
    {section.brands && <ul className={styles.brandTiles} aria-label="Preventive health">
      <li><ServiceTile link={section.groups[0].links[0]} onNavigate={onNavigate} mobile={mobile} /></li>
      {section.brands.map(brand => <li key={brand.href}>
        <Link href={brand.href} className={`${styles.serviceTile} ${styles.brandTile}`} onClick={onNavigate} aria-label={`${brand.label} clinic`}>
          <span className={styles.brandBackground} aria-hidden="true"><Image src={brand.background} alt="" fill sizes="(min-width: 1100px) 180px, 90vw" /></span>
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
  </div>;

  const renderSection = (section: Section) => <section key={section.id} className={styles.serviceGroup} aria-labelledby={`${id}-${section.id}-heading`}>
    <h3 id={`${id}-${section.id}-heading`} className={`section-eyebrow ${grouped.groupTitle}`}>{section.label}</h3>
    <ServiceContent section={section} onNavigate={onNavigate} />
  </section>;

  return <div className={`${grouped.menu} ${styles.servicesMenu}`} data-service-menu>
    <div className={`${grouped.content} ${styles.servicesContent}`}>
      <ServicesMenuCollage />
      <div className={styles.column}>
        {SERVICE_MENU_SECTIONS.filter(section => section.id === "preventive").map(renderSection)}
        <div className={styles.insuranceTiles}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "insurance").map(section => <ServiceContent key={section.id} section={section} onNavigate={onNavigate} />)}</div>
      </div>
      <div className={styles.column}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "services").map(renderSection)}</div>
      <div className={styles.column}>{SERVICE_MENU_SECTIONS.filter(section => section.id === "centres").map(renderSection)}</div>
    </div>
    <ServicesContactBand onNavigate={onNavigate} />
  </div>;
}
