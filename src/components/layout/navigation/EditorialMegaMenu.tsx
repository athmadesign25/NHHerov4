"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  EDITORIAL_FEATURES, EDITORIAL_MENU_GROUPS,
  type EditorialGroup as EditorialGroupData, type EditorialMenuKind,
} from "./editorial-menu-data";
import styles from "./EditorialMegaMenu.module.css";
import MenuImageCard from "./MenuImageCard";
import mobilePatterns from "./MobileMenuPatterns.module.css";
import { mobileMenuLabel } from "./mobile-menu-label";

function MenuGroup({ group, id, mobile, initiallyOpen, onNavigate }: {
  group: EditorialGroupData;
  id: string;
  mobile: boolean;
  initiallyOpen: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(initiallyOpen);
  const headingId = `${id}-heading`;
  const linksId = `${id}-links`;
  const tiles = group.id === "ecosystem" && !mobile;

  const links = <ul id={mobile ? undefined : linksId} className={`${styles.links} ${tiles ? styles.ecosystemLinks : ""}`}>
    {group.links.map(({ icon: Icon, ...item }) => (
      <li key={item.href}>
        <Link href={item.href} onClick={onNavigate} className={`${styles.link} ${mobile ? mobilePatterns.link : ""} ${tiles ? styles.ecosystemTile : ""}`}>
          {tiles ? (
            item.visual?.kind === "logo" ? <span className={styles.ecosystemVisual}>
              <Image src={item.visual.src} alt={item.label} fill sizes="160px" className={styles.ecosystemLogo} />
            </span> : <span className={styles.ecosystemAcademicMark}>
              <Icon aria-hidden="true" /><span>Academics &amp;<br />Research</span>
            </span>
          ) : <span className={styles.itemCopy}><Icon className={styles.itemIcon} aria-hidden="true" /><span className={styles.label}>{mobile ? mobileMenuLabel(item.label) : item.label}</span></span>}
        </Link>
      </li>
    ))}
  </ul>;

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h3 id={headingId} className={mobile ? mobilePatterns.heading : `section-eyebrow ${styles.groupTitle}`}>
        {mobile ? (
          <button type="button" className={mobilePatterns.toggle} aria-expanded={expanded} aria-controls={linksId} onClick={() => setExpanded(!expanded)}>
            {mobileMenuLabel(group.label)}<ChevronDown aria-hidden="true" />
          </button>
        ) : group.label}
      </h3>
      {mobile ? <div id={linksId} className={mobilePatterns.surface} hidden={!expanded}>{links}</div> : links}
    </section>
  );
}

export default function EditorialMegaMenu({ kind, onNavigate, mobile = false }: {
  kind: EditorialMenuKind;
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const id = useId();
  const feature = EDITORIAL_FEATURES[kind];
  const groups = EDITORIAL_MENU_GROUPS[kind].map((group, index) => (
    <MenuGroup key={group.id} group={group} id={`${id}-${group.id}`} mobile={mobile} initiallyOpen={mobile || index === 0} onNavigate={onNavigate} />
  ));
  const featuredCard = kind === "health-library" ? (
    <MenuImageCard title="Health Library" image={feature.image} imageSizes="(min-width: 1100px) 1000px, 100vw" imageLoading="eager" alt={feature.alt} portrait className={`${styles.feature} ${styles.learningFeature}`} />
  ) : (
    <MenuImageCard title={feature.title} description={feature.description} image={feature.image} alt={feature.alt} portrait className={`${styles.feature} ${styles.storyFeature}`} visualClassName={styles.storyVisual}>
      <div className={styles.founderPill}>
        <strong>Dr. Devi Prasad Shetty</strong>
        <span>Founder and Chairman</span>
      </div>
    </MenuImageCard>
  );

  return (
    <div className={`${styles.menu} ${kind === "health-library" ? styles.library : styles.about} ${mobile ? styles.mobile : ""}`} data-editorial-menu={kind}>
      <div className={`${styles.content} ${styles.editorialContent}`}>
        {!mobile && featuredCard}
        {mobile ? groups : (
          <div className={`${styles.editorialColumns} ${kind === "about-us" ? styles.aboutColumns : ""}`}>
            {groups}
          </div>
        )}
      </div>

    </div>
  );
}
