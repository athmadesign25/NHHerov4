"use client";

import Image from "next/image";
import { Check, Plus, FlaskConical, Clock3, HeartPulse } from "lucide-react";
import { money, type HealthItem } from "./catalog";
import styles from "./HealthItemCard.module.css";

interface Props {
  item: HealthItem;
  eager?: boolean;
  selected: boolean;
  included: boolean;
  comparing?: boolean;
  onCompare?: () => void;
  onAdd: () => void;
  onDetails: () => void;
}

export default function HealthItemCard({ item, selected, included, comparing, onCompare, eager = false, onAdd, onDetails }: Props) {
  const isPackage = item.kind === "package";
  const hasTestCount = Number.isInteger(item.testCount) && item.testCount > 0;
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const highlights = item.inclusions.slice(0, 3);
  return <article className={styles.card} data-kind={item.kind} data-selected={selected || undefined}>
    <div className={styles.body}>
      <div className={styles.identity}>
        <div className={styles.art}>{isPackage && item.image ? <Image src={item.image} alt="" fill loading={eager ? "eager" : "lazy"} sizes="80px" /> : isPackage ? <HeartPulse size={28} aria-hidden /> : <FlaskConical size={22} aria-hidden />}</div>
        <h3>{item.name}</h3>
      </div>
      {item.description?.trim() && <p className={styles.description}>{item.audience?.description || item.description}</p>}
      {isPackage && highlights.length > 0 && <div className={styles.coverage}>
        <span className={styles.label}>Coverage highlights</span>
        <ul>{highlights.map((highlight, index) => <li key={`${highlight}-${index}`}><Check size={14} aria-hidden /><span>{highlight}</span></li>)}</ul>
      </div>}
      {(hasTestCount || item.reportTime || item.preparation) && <div className={styles.meta}>
        {hasTestCount && <span><FlaskConical size={15} aria-hidden />{item.testCount} {item.testCount === 1 ? "test" : "tests"} included</span>}
        {item.reportTime && <span><Clock3 size={15} aria-hidden />{item.reportTime}</span>}
        {item.preparation && <span>{item.preparation}</span>}
      </div>}
      <div className={styles.links}>
        <button className={styles.details} onClick={onDetails} type="button" aria-label={`View details for ${item.name}`}>View details</button>
        {isPackage && onCompare && <label className={styles.compare}><input type="checkbox" checked={Boolean(comparing)} onChange={onCompare} aria-label={`Compare ${item.name}`} />Compare</label>}
      </div>
    </div>
    <footer className={styles.footer}>
      <strong>{hasPrice ? money(item.price) : "Price not listed"}</strong>
      <div className={styles.actions}>
        {selected && <span className={styles.selected}><Check size={15} aria-hidden />Selected</span>}
        <button type="button" className={selected ? styles.remove : styles.add} disabled={included || (!hasPrice && !selected)} onClick={onAdd} aria-label={included ? `${item.name} is included in your package` : `${selected ? "Remove" : "Select"} ${item.name}`}>
          {included ? <Check size={16} aria-hidden /> : !selected && <Plus size={16} aria-hidden />}{included ? "Included" : selected ? "Remove" : isPackage ? "Select package" : "Add test"}
        </button>
      </div>
    </footer>
  </article>;
}
