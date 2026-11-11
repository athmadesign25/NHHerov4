"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import HorizontalMediaRail from "@/components/ui/HorizontalMediaRail";
import styles from "./EmergencyPage.module.css";

export interface EmergencyCareArea {
  slug: string;
  title: string;
  label: string;
  image: string;
  circleImage?: string;
  items: { title: string; text: string }[];
}

/** The directory's circle filters and specialty's image/detail split, in one place. */
export default function EmergencyCareExplorer({ areas, headingId, expanded = false }: { areas: EmergencyCareArea[]; headingId: string; expanded?: boolean }) {
  const [selected, setSelected] = useState(areas[0].slug);
  const id = useId();
  const area = areas.find(item => item.slug === selected) ?? areas[0];
  const paragraphs = (text: string) => text.split(/\n\n/).filter(part => !/^\s*Call\s+1800/i.test(part));
  return <>
    <div className={`${styles.container} ${styles.careCircleRail}`}>
      <HorizontalMediaRail id={`${id}-circles`} labelledBy={headingId} itemLabel={expanded ? "procedure categories" : "care areas"} heading={null} variant="circles">
        {areas.map(item => <button key={item.slug} id={`${id}-${item.slug}`} type="button" className={styles.conditionCircle} aria-label={item.title} aria-pressed={area.slug === item.slug} aria-controls={`${id}-details`} onClick={() => setSelected(item.slug)}>
          <span className={styles.conditionCircleImage}><Image src={item.circleImage ?? item.image} alt="" fill sizes="(max-width: 768px) 56px, 72px" /></span><span>{item.label}</span>
        </button>)}
      </HorizontalMediaRail>
    </div>
    <div className={`${styles.container} ${styles.conditionPanel}`}>
      <div className={styles.conditionVisual}>
        <Image key={area.image} src={area.image} alt={area.title} fill sizes="(max-width: 768px) 90vw, 48vw" />
        <div><h3>{area.title}</h3><a href="tel:18003090309" className={styles.conditionEmergency}><PhoneCall animateOnHover /><span>Call emergency</span><ArrowUpRight aria-hidden="true" /></a></div>
      </div>
      <div key={area.slug} id={`${id}-details`} role="region" aria-labelledby={`${id}-${area.slug}`} className={`${styles.accordion} ${styles.compactAccordion}`}>
        {area.items.map((item, index) => expanded
          ? <article key={item.title} className={styles.procedureDetail}><h3>{item.title}</h3>{paragraphs(item.text).map((part, i) => <p key={i}>{part}</p>)}</article>
          : <details key={item.title} open={index === 0 || undefined}><summary><span>{item.title}</span><Plus aria-hidden="true" /></summary><div className={styles.answer}>{paragraphs(item.text).map((part, i) => <p key={i}>{part}</p>)}</div></details>)}
      </div>
    </div>
  </>;
}
