"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SERVICE_MENU_SECTIONS } from "./service-menu-data";
import MenuImageCard from "./MenuImageCard";
import ServicesMenuCollage from "./ServicesMenuCollage";
import MenuAction from "./MenuAction";
import ServicesContactBand from "./ServicesContactBand";
import patterns from "./MegaMenuPatterns.module.css";
import styles from "./ServicesMegaMenu.module.css";
import grouped from "./EditorialMegaMenu.module.css";

type Section = (typeof SERVICE_MENU_SECTIONS)[number];

function ServiceContent({ section, onNavigate, mobile = false }: { section: Section; onNavigate: () => void; mobile?: boolean }) {
  return (
    <div className={`${patterns.panel} ${styles.panel} ${mobile ? styles.mobilePanel : ""}`}>
      <MenuImageCard title={section.label} image={section.image} imageSizes={section.imageSizes} alt={section.alt} className={styles.imageCard} />
      <div className={styles.groups}>
        {mobile ? section.groups.map(group => <section key={group.title}>
          <h3 className={`section-eyebrow ${styles.eyebrow}`}>{group.title}</h3>
          <ul className={styles.links}>{group.links.map(link => <li key={link.href}><Link href={link.href} className={styles.link} onClick={onNavigate}>{link.label}</Link></li>)}</ul>
        </section>) : <ul className={styles.links} aria-label={section.label}>
          {section.groups.flatMap(group => group.links).map(link => <li key={link.href}><Link href={link.href} className={styles.link} onClick={onNavigate}>{link.label}</Link></li>)}
        </ul>}
        {section.notice && <p className={styles.notice}>{section.notice}</p>}
      </div>
      {section.footer && <div className={styles.footer}><MenuAction label={section.footer.label} href={section.footer.href} context={section.footer.label} onClick={onNavigate} /></div>}
    </div>
  );
}

export default function ServicesMegaMenu({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>("centres");
  const id = useId();

  if (mobile) return <div className={styles.mobile}>
    {SERVICE_MENU_SECTIONS.map(item => <section key={item.id} className={styles.mobileGroup}>
      <h3><button type="button" className={styles.toggle} aria-expanded={expanded === item.id} aria-controls={`${id}-${item.id}-content`} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{item.label}<ChevronDown aria-hidden="true" /></button></h3>
      <div id={`${id}-${item.id}-content`} hidden={expanded !== item.id}><ServiceContent section={item} onNavigate={onNavigate} mobile /></div>
    </section>)}
    <ServicesContactBand onNavigate={onNavigate} mobile />
  </div>;

  return (
    <div className={`${grouped.menu} ${styles.servicesMenu}`} data-service-menu>
      <div className={`${grouped.content} ${styles.servicesContent}`}>
        <ServicesMenuCollage />
        {SERVICE_MENU_SECTIONS.map(section => (
          <section key={section.id} className={`${grouped.group} ${styles.serviceGroup}`} aria-labelledby={`${id}-${section.id}-heading`}>
            <h3 id={`${id}-${section.id}-heading`} className={`section-eyebrow ${grouped.groupTitle}`}>{section.label}</h3>
            <ul className={grouped.links}>
              {section.groups.flatMap(group => group.links).map(link => (
                <li key={link.href}>
                  <Link href={link.href} onClick={onNavigate} className={grouped.link}>
                    <span className={`${grouped.label} ${styles.serviceLabel}`} title={link.label}>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {section.footer && <div className={styles.groupFooter}><MenuAction label={section.footer.label} href={section.footer.href} context={section.footer.label} onClick={onNavigate} /></div>}
          </section>
        ))}
      </div>
      <ServicesContactBand onNavigate={onNavigate} />
    </div>
  );
}
