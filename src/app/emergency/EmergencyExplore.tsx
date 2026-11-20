"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, ArrowUpRight } from "lucide-react";
import styles from "./EmergencyPage.module.css";

export interface EmergencyExploreItem {
  label: string;
  title: string;
  description?: string;
  image: string;
  details?: { title: string; text: string }[];
}

/** The specialty technology pattern, adapted to emergency content and NH tokens. */
export default function EmergencyExplore({ items, label }: { items: EmergencyExploreItem[]; label: string }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = items[selected];
  return <div className={styles.featureShell}>
    <div className={styles.featureMenu}>
      <div className={styles.mobileFeatureSelect}><label className={styles.fieldLabel} htmlFor={`${id}-select`}>{label}</label><div className={styles.selectWrap}><select id={`${id}-select`} value={selected} onChange={event => setSelected(Number(event.target.value))}>{items.map((entry, index) => <option key={entry.label} value={index}>{entry.label}</option>)}</select><ChevronDown aria-hidden="true" /></div></div>
      <div role="tablist" aria-label={label} aria-orientation="vertical" className={styles.featureTabs}>{items.map((entry, index) => <button key={entry.label} ref={element => { tabs.current[index] = element; }} id={`${id}-tab-${index}`} type="button" role="tab" aria-selected={selected === index} aria-controls={`${id}-panel`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => { const next = event.key === "ArrowDown" ? (index + 1) % items.length : event.key === "ArrowUp" ? (index - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null; if (next !== null) { event.preventDefault(); setSelected(next); tabs.current[next]?.focus(); } }}><span className={styles.featureNumber}>{String(index + 1).padStart(2, "0")}</span><span>{entry.label}</span><ArrowUpRight aria-hidden="true" /></button>)}</div>
    </div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`} tabIndex={0} className={styles.featurePanel}>
      <div key={item.image} className={styles.featurePhoto}><Image src={item.image} alt="" fill sizes="(max-width: 768px) 90vw, 45vw" /></div>
      <div key={item.label} className={styles.featureCopy}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}{item.details && <div className={styles.accordion}>{item.details.map((detail, index) => <details key={detail.title} name={`${id}-details`} open={index === 0 || undefined}><summary><span>{detail.title}</span><Plus aria-hidden="true" /></summary><div className={styles.answer}><p>{detail.text}</p></div></details>)}</div>}</div>
    </div>
  </div>;
}
