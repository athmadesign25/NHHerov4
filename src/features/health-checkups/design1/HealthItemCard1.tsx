"use client";

import Image from "next/image";
import { Check, Plus, FlaskConical, Clock3, HeartPulse } from "lucide-react";
import { money, type HealthItem } from "../catalog";
import styles from "./HealthItemCard1.module.css";

interface Props {
  item: HealthItem;
  selected: boolean;
  included: boolean;
  eager?: boolean;
  onAdd: () => void;
  onDetails: () => void;
}

/** Preserved image-led listing card for the original health-checkup preview. */
export default function HealthItemCard1({ item, selected, included, eager = false, onAdd, onDetails }: Props) {
  const hasTestCount = Number.isInteger(item.testCount) && item.testCount > 0;
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const reportTime = item.reportTime?.trim();
  return <article className={styles.card} data-selected={selected || undefined}>
    {item.kind === "package" && <div className={styles.art}>
      {item.image ? <Image src={item.image} alt="" fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" /> : <HeartPulse size={48} aria-hidden />}
      {item.category && <span className={styles.category}>{item.category}</span>}
    </div>}
    <div className={styles.body}>
      {item.kind === "test" && <span className={styles.testIcon}><FlaskConical size={22} aria-hidden /></span>}
      <h2>{item.name}</h2>
      {item.description?.trim() && <p className={styles.description}>{item.description}</p>}
      {(hasTestCount || reportTime) && <div className={styles.meta}>
        {hasTestCount && <span><FlaskConical size={15} aria-hidden />{item.testCount} {item.testCount === 1 ? "test" : "tests"} included</span>}
        {reportTime && <span><Clock3 size={15} aria-hidden />{reportTime}</span>}
      </div>}
      <button className={styles.details} onClick={onDetails} type="button" aria-label={`View details for ${item.name}`}>View details</button>
      <footer className={styles.footer}>
        <strong>{hasPrice ? money(item.price) : "Price not listed"}</strong>
        <button type="button" className={styles.add} data-selected={selected || undefined} disabled={included || (!hasPrice && !selected)} onClick={onAdd}
          aria-label={included ? `${item.name} is included in your package` : !hasPrice && !selected ? `Price not listed for ${item.name}` : `${selected ? "Remove" : "Add"} ${item.name}`} aria-pressed={selected}>
          {selected || included ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}{included ? "Included" : selected ? "Added" : "Add"}
        </button>
      </footer>
    </div>
  </article>;
}
