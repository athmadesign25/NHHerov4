"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Clock3, FlaskConical, History, ShoppingCart } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import { money, type HealthItem } from "../catalog";
import { healthCardContent, healthCategories } from "../healthCardContent";
import { healthItemDetailHref } from "../healthDetailTypes";
import styles from "./HealthLandingCard.module.css";

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

/** Reuse the landing-page artwork where its subject matches the catalogue item. */
function itemArtwork(item: HealthItem) {
  const categories = healthCategories(item);
  if (categories.includes("heart")) return "/healthy-heart-package-2.png";
  if (categories.includes("diabetes")) return "/health-packages/diabetes.png";
  if (categories.includes("thyroid")) return "/health-packages/thyroid.png";
  if (/bone|calcium|vitamin d/i.test(item.name)) return "/bone-health-package.png";
  if (item.image && item.image !== "/health-checkups/source/244d0a7c43bfee93d416c289.webp") return item.image;
  if (item.kind === "test") return "/health-checkups/lab-tests-v1.webp";
  if (categories.includes("senior")) return "/Health Checkup/Senior Citizen.png";
  if (categories.includes("women")) return "/Health Checkup/Master health.png";
  if (categories.includes("men")) return "/Health Checkup/Men's health.png";
  return "/Health Checkup/Basic health.png";
}

export default function HealthLandingCard({ item, eager = false, selected, included, onAdd, onDetails, onTests, previouslyBooked = false }: Props) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const { originalPrice, testCount, preparation, reportTime, samples, highlights } = healthCardContent(item);
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const selectedLabel = included ? "Included" : selected ? "Added" : "Add";
  const usefulPreparation = /confirm preparation instructions/i.test(preparation) ? "" : preparation;
  const fact = usefulPreparation || (reportTime ? `Reports: ${reportTime}` : samples.join(", "));
  const FactIcon = usefulPreparation || reportTime ? Clock3 : FlaskConical;

  return <motion.article className={styles.card} data-selected={selected || undefined} aria-labelledby={titleId}
    initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: duration.emphasis, ease: ease.out }}>
    <div className={styles.body}>
      <div className={styles.artwork} aria-hidden="true">
        <Image src={itemArtwork(item)} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 23vw, 200px" priority={eager} className={styles.image} />
      </div>
      <div className={styles.content}>
        {previouslyBooked && <span className={styles.history}><History aria-hidden="true" />Booked before</span>}
        <h3 id={titleId} className={styles.title}>
          <Link href={healthItemDetailHref(item, "6")} onNavigate={event => { event.preventDefault(); onDetails(); }}>{item.name}</Link>
        </h3>
        <div className={styles.facts}>
          {testCount ? <button type="button" className={styles.inclusions} onClick={onTests} aria-haspopup="dialog" aria-label={`View included tests for ${item.name}`}>
            <span className={styles.factIcon}><FlaskConical aria-hidden="true" /></span>
            <span>Includes {testCount} {testCount === 1 ? "test" : "tests"}</span><ChevronRight className={styles.chevron} aria-hidden="true" />
          </button> : null}
          {fact && <div className={styles.fact}>
            <span className={styles.factIcon}><FactIcon aria-hidden="true" /></span>
            <span>{fact}</span>
          </div>}
        </div>
        <Link className={styles.details} href={healthItemDetailHref(item, "6")} onNavigate={event => { event.preventDefault(); onDetails(); }}>View details<ChevronRight aria-hidden="true" /></Link>
      </div>
    </div>
    {highlights.length > 0 && <ul className={styles.highlights} aria-label="Package highlights">
      {highlights.slice(0, 2).map(highlight => <li key={highlight}><span className={styles.highlightIcon}><Check aria-hidden="true" /></span><span>{highlight}</span></li>)}
    </ul>}
    <footer className={styles.footer}>
      <div className={styles.prices}>
        {originalPrice !== undefined && <del aria-label={`Original price ${money(originalPrice)}`}>{money(originalPrice)}</del>}
        <strong className={hasPrice ? styles.price : styles.unpriced}>{hasPrice ? money(item.price) : "Price not listed"}</strong>
      </div>
      <button type="button" className={styles.add} data-selected={selected || undefined} data-included={included || undefined}
        aria-pressed={included ? undefined : selected} disabled={included || (!hasPrice && !selected)}
        aria-label={included ? `${item.name} is included in your package` : selected ? `Remove ${item.name} from cart` : `Add ${item.name} to cart`}
        onClick={onAdd}>
        <span key={selectedLabel} className={styles.selectionIcon}>{included || selected ? <Check className={styles.check} aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}</span>{selectedLabel}
      </button>
    </footer>
  </motion.article>;
}
