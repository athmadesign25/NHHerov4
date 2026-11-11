"use client";

import { Search } from "lucide-react";
import type { HealthItem } from "../catalog";
import HealthItemCard1 from "./HealthItemCard1";
import styles from "../HealthCheckups.module.css";
import legacy from "./HealthListing1.module.css";

interface Props {
  catalog: HealthItem[];
  tab: "package" | "test";
  query: string;
  category: string;
  ids: string[];
  includedIds: string[];
  onTab: (tab: "package" | "test") => void;
  onCategory: (category: string) => void;
  onClear: () => void;
  onCentre: () => void;
  onAdd: (item: HealthItem) => void;
  onDetails: (item: HealthItem) => void;
}

export default function HealthListing1({ catalog, tab, query, category, ids, includedIds, onTab, onCategory, onClear, onCentre, onAdd, onDetails }: Props) {
  const current = catalog.filter(item => item.kind === tab);
  const categories = ["All", ...new Set(current.map(item => item.category).filter(Boolean))];
  const visible = current.filter(item => (category === "All" || item.category === category) && `${item.name} ${item.description} ${item.inclusions.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim()));
  const otherKind = tab === "package" ? "test" : "package";
  const hasOtherKind = catalog.some(item => item.kind === otherKind);
  return <div className={legacy.listing}>
    <div className={`${styles.toolbar} ${legacy.toolbar}`}>
      <div className={styles.tabs} aria-label="Browse by type">{(["package", "test"] as const).map(value => <button type="button" key={value} aria-pressed={tab === value} onClick={() => onTab(value)}>{value === "package" ? "Health packages" : "Lab tests"}</button>)}</div>
      <p>{tab === "package" ? "Thoughtfully grouped for your health" : "Find a specific test"}</p>
    </div>
    {categories.length > 1 && <div className={`${styles.categories} ${legacy.categories}`} aria-label="Filter by focus">{categories.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => onCategory(value)}>{value}</button>)}</div>}
    <div aria-live="polite" aria-atomic="false">
      {visible.length ? <div className={styles.grid}>{visible.map((item, index) => <HealthItemCard1 key={item.id} item={item} eager={index === 0} selected={ids.includes(item.id)} included={includedIds.includes(item.id)} onAdd={() => onAdd(item)} onDetails={() => onDetails(item)} />)}</div> : <div className={styles.empty}>
        <Search size={28} aria-hidden />
        <h2>{current.length ? `No matching ${tab === "package" ? "packages" : "tests"}` : `No ${tab === "package" ? "packages" : "lab tests"} listed at this centre`}</h2>
        <p>{current.length ? "Try another name or clear your filters." : hasOtherKind ? "Choose another centre or explore the other listed services." : "Choose another centre to explore listed packages and tests."}</p>
        {current.length > 0 && <button type="button" className={styles.textButton} onClick={onClear}>Clear search &amp; filters</button>}
        {hasOtherKind && <button type="button" className={styles.textButton} onClick={() => { onTab(otherKind); if (!current.length) onClear(); }}>{current.length && query ? "Search" : "View"} {otherKind === "test" ? "lab tests" : "health packages"}</button>}
        <button type="button" className={styles.textButton} onClick={onCentre}>Choose another centre</button>
      </div>}
    </div>
    <p className={styles.catalogNote}>Packages and tests vary by hospital. View details for inclusions and preparation.</p>
  </div>;
}
