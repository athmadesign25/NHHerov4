import Link from "next/link";
import { Building2 } from "lucide-react";
import { money, type HealthFacility, type HealthItem } from "./catalog";
import { healthItemDetailHref } from "./healthDetailTypes";
import type { HealthDesign } from "./healthDesigns";
import detailStyles from "./HealthDetail.module.css";
import styles from "./HealthDetailBooking.module.css";

interface Props {
  item: HealthItem;
  facility: HealthFacility;
  design: HealthDesign;
  relatedPackages: HealthItem[];
}

/** Facility-scoped information: never infer package membership or a price range. */
export default function HealthDetailBooking({ item, facility, design, relatedPackages }: Props) {
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address || `${facility.name}, ${facility.city}`)}`;
  const distance = typeof facility.distanceKm === "number" && Number.isFinite(facility.distanceKm) && facility.distanceKm >= 0
    ? `${facility.distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
  const packages = item.kind === "test" ? relatedPackages.filter(entry => entry.kind === "package" && entry.facilityId === facility.id && entry.includedTestIds.includes(item.id)) : [];

  return <section id="where-to-book" className={detailStyles.section} aria-labelledby="where-to-book-heading">
    <div className={detailStyles.sectionHeading}><span><Building2 aria-hidden /></span><h2 id="where-to-book-heading">Where to book</h2></div>
    <div className={styles.location}>
      <div className={styles.centre}>
        <div className={styles.nameRow}>
          <h3>{facility.name}</h3>
          <a className={styles.directions} href={directions} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${facility.name} (opens in a new tab)`}>
            {distance}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg>
          </a>
        </div>
        <p>{facility.address || facility.city}</p>
      </div>
      <dl className={styles.cost}><dt>{item.kind === "test" ? "Test price" : "Package price"}</dt><dd>{hasPrice ? money(item.price) : "Price not listed"}</dd></dl>
    </div>
    {packages.length > 0 && <div className={styles.packages}>
      <h3>Packages that include this test</h3>
      <ul>{packages.map(entry => <li key={entry.id}><Link href={healthItemDetailHref(entry, design)}>{entry.name}</Link>{Number.isFinite(entry.price) && entry.price >= 0 && <span>{money(entry.price)}</span>}</li>)}</ul>
    </div>}
  </section>;
}
