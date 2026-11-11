"use client";

import { useState } from "react";
import { X } from "lucide-react";
import HealthDialog from "./HealthDialog";
import { healthComparisonFacts } from "./healthDiscovery";
import { money, type HealthItem } from "./catalog";
import styles from "./HealthComparison.module.css";

interface Props {
  items: HealthItem[];
  selectedIds: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onSelect: (item: HealthItem) => void;
  onDetails: (item: HealthItem) => void;
}

export default function HealthComparison({ items, selectedIds, onClose, onRemove, onSelect, onDetails }: Props) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const facts = items.map(healthComparisonFacts);
  const rows = Object.keys(facts[0] ?? {}).map(label => ({ label, differs: new Set(facts.map(fact => fact[label])).size > 1 }))
    .sort((a, b) => Number(b.differs) - Number(a.differs));
  return <HealthDialog title="Compare packages" onClose={onClose} wide>
    <div className={styles.tools}><p>Compare published details. “Not listed” does not mean excluded.</p>
      {items.length > 1 && <label><input type="checkbox" checked={differencesOnly} onChange={event => setDifferencesOnly(event.target.checked)} />Differences only</label>}
    </div>
    <div className={styles.scroll} tabIndex={0} aria-label="Package comparison, scroll horizontally for more packages">
      <table className={styles.table}>
        <caption className={styles.caption}>Package prices and available details</caption>
        <thead><tr><th scope="col">Compare</th>{items.map(item => <th scope="col" key={item.id}>
          <div className={styles.name}>{item.name}<button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name} from comparison`}><X size={16} /></button></div>
          <strong className={styles.price}>{Number.isFinite(item.price) && item.price >= 0 ? money(item.price) : "Price not listed"}</strong>
          <button className={styles.select} type="button" disabled={selectedIds.includes(item.id) || !Number.isFinite(item.price) || item.price < 0} onClick={() => onSelect(item)}>{selectedIds.includes(item.id) ? "Selected" : "Select package"}</button>
        </th>)}</tr></thead>
        <tbody>{rows.filter(row => !differencesOnly || row.differs).map(row => <tr key={row.label}><th scope="row">{row.label}</th>{items.map((item, index) => <td key={item.id} data-missing={facts[index][row.label] === "Not listed" || undefined}>{facts[index][row.label]}</td>)}</tr>)}
          <tr><th scope="row">Full details</th>{items.map(item => <td key={item.id}><button className={styles.link} type="button" onClick={() => onDetails(item)}>View details</button></td>)}</tr>
        </tbody>
      </table>
    </div>
  </HealthDialog>;
}
