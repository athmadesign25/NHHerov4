"use client";

import { useId } from "react";
import Image from "next/image";
import { Check, ChevronRight, History, ShoppingCart } from "lucide-react";
import { money, type HealthItem } from "../catalog";
import { healthCardContent, healthCardTone } from "../healthCardContent";
import styles from "./HealthDiscoveryCard.module.css";

interface Props {
  item: HealthItem;
  eager?: boolean;
  selected: boolean;
  included: boolean;
  onAdd: () => void;
  onDetails: () => void;
  onTests: () => void;
  previouslyBooked?: boolean;
}

// The live catalogue uses this logo in place of most package photographs.
const SOURCE_PLACEHOLDER = "/health-checkups/source/244d0a7c43bfee93d416c289.webp";
function itemImage(item: HealthItem) {
  if (item.image && item.image !== SOURCE_PLACEHOLDER) return item.image;
  if (item.kind === "test") return "/health-checkups/lab-tests-v1.webp";
  if (/senior|elder/i.test(item.name)) return "/Health Checkup/Senior Citizen.png";
  if (/female|women/i.test(item.name)) return "/Health Checkup/Master health.png";
  if (/\bmale\b|\bmen\b/i.test(item.name)) return "/Health Checkup/Men's health.png";
  return "/health-checkups/source/645dcfb312b746759d699e1a.webp";
}

/** Compact cards keep the full detail page accessible through the title/image. */
export default function HealthDiscoveryCard({ item, eager = false, selected, included, onAdd, onDetails, onTests, previouslyBooked = false }: Props) {
  const titleId = useId();
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const { originalPrice, testCount } = healthCardContent(item);
  const selectedLabel = included ? "Included" : selected ? "Added" : "Add";

  return <article className={styles.card} data-kind={item.kind} data-tone={healthCardTone(item)} data-selected={selected || undefined} aria-labelledby={titleId}>
    <button type="button" className={styles.visual} onClick={onDetails} aria-label={`View ${item.name}`} tabIndex={-1}>
      <Image src={itemImage(item)} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={eager} className={styles.image} />
    </button>
    <div className={styles.content}>
      {previouslyBooked && <span className={styles.history}><History aria-hidden />Booked before</span>}
      <h3 id={titleId} className={styles.title}><button type="button" onClick={onDetails}>{item.name}</button></h3>
      <button type="button" className={styles.includes} onClick={onTests} aria-haspopup="dialog" aria-label={`View included tests for ${item.name}`}>
        {testCount ? `Includes ${testCount} ${testCount === 1 ? "test" : "tests"}` : "View included tests"}<ChevronRight aria-hidden />
      </button>
      <footer className={styles.footer}>
        <div className={styles.prices}>
          {originalPrice !== undefined && <del aria-label={`Original price ${money(originalPrice)}`}>{money(originalPrice)}</del>}
          <strong className={hasPrice ? styles.price : styles.unpriced}>{hasPrice ? money(item.price) : "Price not listed"}</strong>
        </div>
        <button type="button" className={styles.select} data-selected={selected || undefined} data-included={included || undefined}
          aria-pressed={included ? undefined : selected} disabled={included || (!hasPrice && !selected)}
          aria-label={included ? `${item.name} is included in your package` : selected ? `Remove ${item.name} from cart` : `Add ${item.name} to cart`}
          onClick={onAdd}>
          {included || selected ? <Check aria-hidden /> : <ShoppingCart aria-hidden />}{selectedLabel}
        </button>
      </footer>
    </div>
  </article>;
}
