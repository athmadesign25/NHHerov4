"use client";

import { useId, useState } from "react";
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

function ServiceContent({ section, onNavigate }: { section: Section; onNavigate: () => void }) {
  return <div className={mobilePatterns.surface}>
    <ul className={mobilePatterns.list} aria-label={mobileMenuLabel(section.label)}>
      {section.groups.flatMap(group => group.links).map(link => <li key={link.href}>
        <Link href={link.href} className={mobilePatterns.link} onClick={onNavigate}>{mobileMenuLabel(link.label)}</Link>
      </li>)}
    </ul>
    {section.notice && <p className={styles.notice}>{section.notice}</p>}
    {section.footer && <Link href={section.footer.href} className={mobilePatterns.link} onClick={onNavigate}>{mobileMenuLabel(section.footer.label)}</Link>}
  </div>;
}

export default function ServicesMegaMenu({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const id = useId();

  if (mobile) return <div className={styles.mobile}>
    {SERVICE_MENU_SECTIONS.map(item => <section key={item.id} className={styles.mobileGroup}>
      <h3 className={mobilePatterns.heading}><button type="button" className={mobilePatterns.toggle} aria-expanded={expanded === item.id} aria-controls={`${id}-${item.id}-content`} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{mobileMenuLabel(item.label)}<ChevronDown aria-hidden="true" /></button></h3>
      <div id={`${id}-${item.id}-content`} hidden={expanded !== item.id}><ServiceContent section={item} onNavigate={onNavigate} /></div>
    </section>)}
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
